// Firebase imports
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, getDocs, query, where, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { getStorage, ref, getMetadata } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAauhTRKCxnwpXvfdvRMXfU1K9oFvYgRRE",
    authDomain: "login-b62bd.firebaseapp.com",
    projectId: "login-b62bd",
    storageBucket: "login-b62bd.appspot.com",
    messagingSenderId: "861930818449",
    appId: "1:861930818449:web:1c5f962893ca85ecf5a830",
    measurementId: "G-KHJSX85R56"
};

// Initialize Firebase
let app;
try {
    app = initializeApp(firebaseConfig);
} catch (error) {
    if (error.code === 'app/duplicate-app') {
        app = getApp();
    } else {
        throw error;
    }
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Document handling functions
export async function getFileType(fileUrl) {
    const fileRef = ref(storage, fileUrl);
    let fileType = null;
    try {
        const metadata = await getMetadata(fileRef);
        fileType = metadata.contentType;
        console.log("File Type:", fileType);
        return fileType;
    } catch (error) {
        console.error("Error fetching metadata:", error);
        return null;
    }
}

export function openDocumentModal(url, fileType) {
    const modal = document.getElementById("documentModal");
    const iframe = document.getElementById("documentFrame");
    const imageDisplay = document.getElementById("imageDisplay");

    if (fileType === 'application/pdf') {
        iframe.src = url;
        iframe.style.display = "block";
        imageDisplay.style.display = "none";
    } else if (fileType === 'image/jpeg' || fileType === 'image/png') {
        imageDisplay.src = url;
        imageDisplay.style.display = "block";
        iframe.style.display = "none";
    } else {
        alert('This file type cannot be displayed. Click OK to download the file.');
        window.open(url, '_blank');
        return;
    }

    modal.style.display = "block";
}

export function closeModal() {
    const modal = document.getElementById("documentModal");
    modal.style.display = "none";
}

// Request management functions
export async function notifyUser(userId, requestType) {
    try {
        const notificationRef = collection(db, 'notifications');
        await addDoc(notificationRef, {
            userId: userId,
            message: `Your ${requestType} request has been processed.`,
            timestamp: new Date(),
            read: false
        });
        console.log('Notification sent successfully');
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

export async function approveRequest(requestData, requestType) {
    if (!requestData || !requestData.id) {
        console.error('Invalid request data');
        return false;
    }

    try {
        const requestRef = doc(db, 'requests', requestData.id);
        const requestDoc = await getDoc(requestRef);

        if (!requestDoc.exists()) {
            console.error('Request document not found');
            return false;
        }

        const currentData = requestDoc.data();
        
        // Check if all required documents are verified
        const documents = currentData.documents || {};
        const allVerified = Object.values(documents).every(doc => doc.verified);
        
        if (!allVerified) {
            alert('All required documents must be verified before approval');
            return false;
        }

        // Update request status
        await updateDoc(requestRef, {
            status: 'approved',
            approvedBy: auth.currentUser.uid,
            approvedAt: new Date()
        });

        // Notify user
        await notifyUser(currentData.userId, requestType);

        console.log('Request approved successfully');
        return true;
    } catch (error) {
        console.error('Error approving request:', error);
        return false;
    }
}

export async function denyRequest(requestId, userId, reason) {
    if (!requestId || !userId || !reason) {
        console.error('Missing required parameters');
        return false;
    }

    try {
        const requestRef = doc(db, 'requests', requestId);
        
        await updateDoc(requestRef, {
            status: 'denied',
            deniedBy: auth.currentUser.uid,
            deniedAt: new Date(),
            denialReason: reason
        });

        // Notify user
        await notifyUser(userId, 'denial');

        console.log('Request denied successfully');
        return true;
    } catch (error) {
        console.error('Error denying request:', error);
        return false;
    }
}

// Initialize request list
export async function initializeRequestList() {
    try {
        const requestsRef = collection(db, 'requests');
        const q = query(requestsRef, where('status', '==', 'pending'));
        
        // Set up real-time listener
        onSnapshot(q, (snapshot) => {
            const requestsList = document.getElementById('requests-list');
            requestsList.innerHTML = ''; // Clear existing list
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                const timestamp = data.timestamp?.toDate() || new Date();
                createRequestRow(doc.id, data, timestamp);
            });
        });
        
        console.log('Request list initialized');
        return true;
    } catch (error) {
        console.error('Error initializing request list:', error);
        return false;
    }
}

export function createRequestRow(docId, data, timestamp) {
    const requestsList = document.getElementById('requests-list');
    const row = document.createElement('tr');
    row.id = `request-${docId}`;
    
    row.innerHTML = `
        <td>${data.requestType}</td>
        <td>${data.userId}</td>
        <td>${timestamp.toLocaleDateString()}</td>
        <td>
            <button class="btn btn-primary btn-sm view-beneficiaries">View Beneficiaries</button>
            <div class="beneficiaries-list" style="display: none;"></div>
        </td>
        <td>
            <button class="btn btn-info btn-sm view-documents">View Documents</button>
            <div class="documents-list" style="display: none;"></div>
        </td>
        <td>
            <button class="btn btn-success btn-sm approve-request">Approve</button>
            <button class="btn btn-danger btn-sm deny-request">Deny</button>
        </td>
    `;
    
    requestsList.appendChild(row);
    setupEventListeners(row, docId, data);
}

export function setupBeneficiaries(rowElement, data) {
    const beneficiariesList = rowElement.querySelector('.beneficiaries-list');
    const beneficiaries = data.beneficiaries || [];
    
    if (beneficiaries.length === 0) {
        beneficiariesList.innerHTML = '<p>No beneficiaries found</p>';
        return;
    }
    
    let html = '<ul class="list-group">';
    beneficiaries.forEach(beneficiary => {
        html += `
            <li class="list-group-item">
                <strong>Name:</strong> ${beneficiary.name}<br>
                <strong>Relationship:</strong> ${beneficiary.relationship}<br>
                <strong>Share:</strong> ${beneficiary.share}%<br>
                <strong>Contact:</strong> ${beneficiary.contact}
            </li>
        `;
    });
    html += '</ul>';
    
    beneficiariesList.innerHTML = html;
}

export function setupDocuments(rowElement, data) {
    const documentsList = rowElement.querySelector('.documents-list');
    const documents = data.documents || {};
    
    if (Object.keys(documents).length === 0) {
        documentsList.innerHTML = '<p>No documents found</p>';
        return;
    }
    
    let html = '<ul class="list-group">';
    for (const [docType, docData] of Object.entries(documents)) {
        html += `
            <li class="list-group-item">
                <strong>${docType}:</strong><br>
                <button class="btn btn-link view-document" data-url="${docData.url}">
                    View Document
                </button>
                <div class="form-check">
                    <input class="form-check-input verify-document" type="checkbox" 
                           ${docData.verified ? 'checked' : ''}>
                    <label class="form-check-label">Verified</label>
                </div>
            </li>
        `;
    }
    html += '</ul>';
    
    documentsList.innerHTML = html;
}

// Event listeners setup
export function setupEventListeners(rowElement, docId, data) {
    // View beneficiaries
    const viewBeneficiariesBtn = rowElement.querySelector('.view-beneficiaries');
    const beneficiariesList = rowElement.querySelector('.beneficiaries-list');
    
    viewBeneficiariesBtn.addEventListener('click', () => {
        const isHidden = beneficiariesList.style.display === 'none';
        beneficiariesList.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
            setupBeneficiaries(rowElement, data);
        }
    });
    
    // View documents
    const viewDocumentsBtn = rowElement.querySelector('.view-documents');
    const documentsList = rowElement.querySelector('.documents-list');
    
    viewDocumentsBtn.addEventListener('click', () => {
        const isHidden = documentsList.style.display === 'none';
        documentsList.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
            setupDocuments(rowElement, data);
        }
    });
    
    // Document verification
    documentsList.addEventListener('change', async (e) => {
        if (e.target.classList.contains('verify-document')) {
            const docItem = e.target.closest('.list-group-item');
            const docType = docItem.querySelector('strong').textContent.replace(':', '');
            
            try {
                const requestRef = doc(db, 'requests', docId);
                await updateDoc(requestRef, {
                    [`documents.${docType}.verified`]: e.target.checked
                });
                console.log(`Document ${docType} verification updated`);
            } catch (error) {
                console.error('Error updating document verification:', error);
                e.target.checked = !e.target.checked; // Revert checkbox
            }
        }
    });
    
    // View individual documents
    documentsList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('view-document')) {
            const url = e.target.dataset.url;
            const fileType = await getFileType(url);
            openDocumentModal(url, fileType);
        }
    });
    
    // Approve request
    const approveBtn = rowElement.querySelector('.approve-request');
    approveBtn.addEventListener('click', async () => {
        if (await approveRequest(data, data.requestType)) {
            rowElement.remove();
        }
    });
    
    // Deny request
    const denyBtn = rowElement.querySelector('.deny-request');
    denyBtn.addEventListener('click', async () => {
        const reason = prompt('Please provide a reason for denial:');
        if (reason && await denyRequest(docId, data.userId, reason)) {
            rowElement.remove();
        }
    });
}
