// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

// Initialize Firebase (config should be in a separate config file)
const firebaseConfig = {
    // Firebase config goes here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Claims management functions
export async function loadClaims() {
    const claimsList = document.getElementById("users-claims-list");
    claimsList.innerHTML = "";  // Clear existing claims

    try {
        const claimsRef = collection(db, 'claims');
        const q = query(claimsRef, orderBy('submissionDate', 'desc'));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
            const claim = doc.data();
            // Create and append claim element
            const claimElement = createClaimElement(doc.id, claim);
            claimsList.appendChild(claimElement);
        });
    } catch (error) {
        console.error('Error loading claims:', error);
        alert('Error loading claims. Please try again.');
    }
}

export async function viewClaimDetails(claimId) {
    try {
        const claimDoc = await getDoc(doc(db, 'claims', claimId));
        
        if (claimDoc.exists()) {
            const claim = claimDoc.data();
            // Display claim details in modal
            const modal = new bootstrap.Modal(document.getElementById('claimDetailsModal'));
            document.getElementById('claim-details').innerHTML = createClaimDetailsHTML(claim);
            modal.show();
        }
    } catch (error) {
        console.error('Error viewing claim details:', error);
        alert('Error loading claim details. Please try again.');
    }
}

export async function approveClaim(claimId, userId) {
    try {
        const claimDoc = doc(db, 'claims', claimId);
        const claimData = await getDoc(claimDoc);
        
        if (!claimData.exists()) {
            throw new Error('Claim not found');
        }

        const claim = claimData.data();
        if (!areDocumentsVerified(claim)) {
            alert('All required documents must be verified before approval.');
            return;
        }

        await updateDoc(claimDoc, {
            status: 'approved',
            approvedDate: new Date(),
            approvedBy: auth.currentUser.uid
        });

        alert('Claim approved successfully!');
        await loadClaims(); // Refresh the list
    } catch (error) {
        console.error('Error approving claim:', error);
        alert('Error approving claim. Please try again.');
    }
}

export async function rejectClaim(claimId) {
    try {
        const claimDoc = doc(db, 'claims', claimId);
        const adminNotes = document.getElementById('admin-notes').value;
        
        if (!adminNotes.trim()) {
            alert('Please provide a reason for rejection.');
            return;
        }

        await updateDoc(claimDoc, {
            status: 'rejected',
            rejectedDate: new Date(),
            rejectedBy: auth.currentUser.uid,
            adminNotes: adminNotes
        });

        alert('Claim rejected successfully!');
        await loadClaims(); // Refresh the list
    } catch (error) {
        console.error('Error rejecting claim:', error);
        alert('Error rejecting claim. Please try again.');
    }
}

// Helper functions
function createClaimElement(id, claim) {
    const div = document.createElement('div');
    div.className = 'claim-item';
    div.innerHTML = `
        <h3>${claim.type}</h3>
        <p>Claimant: ${claim.userName}</p>
        <p>Status: ${claim.status}</p>
        <button onclick="viewClaimDetails('${id}')">View Details</button>
        ${claim.status === 'pending' ? `
            <button onclick="approveClaim('${id}', '${claim.userId}')">Approve</button>
            <button onclick="rejectClaim('${id}')">Reject</button>
        ` : ''}
    `;
    return div;
}

function createClaimDetailsHTML(claim) {
    return `
        <h2>Claim Details</h2>
        <p>Type: ${claim.type}</p>
        <p>Claimant: ${claim.userName}</p>
        <p>Status: ${claim.status}</p>
        <p>Submission Date: ${claim.submissionDate.toDate().toLocaleDateString()}</p>
        <p>Amount: ${claim.amount}</p>
        ${claim.approvedDate ? `<p>Approved Date: ${claim.approvedDate.toDate().toLocaleDateString()}</p>` : ''}
        ${claim.rejectedDate ? `<p>Rejected Date: ${claim.rejectedDate.toDate().toLocaleDateString()}</p>` : ''}
        ${claim.adminNotes ? `<p>Admin Notes: ${claim.adminNotes}</p>` : ''}
    `;
}

function areDocumentsVerified(claim) {
    return claim.documents && 
           claim.documents.every(doc => doc.verified === true);
}

// Export functions to window object for testing
if (typeof window !== 'undefined') {
    Object.assign(window, {
        loadClaims,
        viewClaimDetails,
        approveClaim,
        rejectClaim
    });
}
