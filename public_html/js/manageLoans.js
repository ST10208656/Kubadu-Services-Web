// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Initialize Firebase (config should be in a separate config file)
const firebaseConfig = {
    // Firebase config goes here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Loan management functions
export async function loadLoans() {
    const loansList = document.getElementById("loans-list");
    loansList.innerHTML = "";  // Clear existing loans

    try {
        const loansRef = collection(db, 'loans');
        const q = query(loansRef, orderBy('requestDate', 'desc'));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
            const loan = doc.data();
            // Create and append loan element
            const loanElement = createLoanElement(doc.id, loan);
            loansList.appendChild(loanElement);
        });
    } catch (error) {
        console.error('Error loading loans:', error);
        alert('Error loading loans. Please try again.');
    }
}

export async function viewLoanDetails(loanId) {
    try {
        const loanDoc = await doc(db, 'loans', loanId);
        const loanData = await getDoc(loanDoc);
        
        if (loanData.exists()) {
            const loan = loanData.data();
            // Display loan details in modal
            const modal = new bootstrap.Modal(document.getElementById('loanDetailsModal'));
            document.getElementById('loan-details').innerHTML = createLoanDetailsHTML(loan);
            modal.show();
        }
    } catch (error) {
        console.error('Error viewing loan details:', error);
        alert('Error loading loan details. Please try again.');
    }
}

export async function approveLoan(loanId) {
    try {
        // Check required documents
        const loanDoc = await doc(db, 'loans', loanId);
        const loanData = await getDoc(loanDoc);
        
        if (!loanData.exists()) {
            throw new Error('Loan not found');
        }

        const loan = loanData.data();
        if (!areDocumentsVerified(loan)) {
            alert('All required documents must be verified before approval.');
            return;
        }

        // Update loan status
        await updateDoc(loanDoc, {
            status: 'approved',
            approvedDate: new Date(),
            approvedBy: auth.currentUser.uid
        });

        alert('Loan approved successfully!');
        await loadLoans(); // Refresh the list
    } catch (error) {
        console.error('Error approving loan:', error);
        alert('Error approving loan. Please try again.');
    }
}

export async function rejectLoan(loanId) {
    try {
        const loanDoc = doc(db, 'loans', loanId);
        await updateDoc(loanDoc, {
            status: 'rejected',
            rejectedDate: new Date(),
            rejectedBy: auth.currentUser.uid
        });

        alert('Loan rejected successfully!');
        await loadLoans(); // Refresh the list
    } catch (error) {
        console.error('Error rejecting loan:', error);
        alert('Error rejecting loan. Please try again.');
    }
}

// Helper functions
function createLoanElement(id, loan) {
    const div = document.createElement('div');
    div.className = 'loan-item';
    div.innerHTML = `
        <h3>${loan.type}</h3>
        <p>Amount: ${loan.amount}</p>
        <p>Status: ${loan.status}</p>
        <button onclick="viewLoanDetails('${id}')">View Details</button>
        ${loan.status === 'pending' ? `
            <button onclick="approveLoan('${id}')">Approve</button>
            <button onclick="rejectLoan('${id}')">Reject</button>
        ` : ''}
    `;
    return div;
}

function createLoanDetailsHTML(loan) {
    return `
        <h2>Loan Details</h2>
        <p>Type: ${loan.type}</p>
        <p>Amount: ${loan.amount}</p>
        <p>Status: ${loan.status}</p>
        <p>Request Date: ${loan.requestDate.toDate().toLocaleDateString()}</p>
        <p>Purpose: ${loan.purpose}</p>
        ${loan.approvedDate ? `<p>Approved Date: ${loan.approvedDate.toDate().toLocaleDateString()}</p>` : ''}
        ${loan.rejectedDate ? `<p>Rejected Date: ${loan.rejectedDate.toDate().toLocaleDateString()}</p>` : ''}
    `;
}

function areDocumentsVerified(loan) {
    return loan.documents && 
           loan.documents.every(doc => doc.verified === true);
}

// Export functions to window object for testing
if (typeof window !== 'undefined') {
    Object.assign(window, {
        loadLoans,
        viewLoanDetails,
        approveLoan,
        rejectLoan
    });
}
