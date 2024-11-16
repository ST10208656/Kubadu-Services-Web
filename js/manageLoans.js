import { getFirestore, collection, doc, getDoc, updateDoc } from 'firebase/firestore';

const db = getFirestore();

// Filter loans by status
export async function filterLoansByStatus(status) {
    const loansRef = collection(db, 'loans');
    const loansList = document.getElementById('loans-list');
    loansList.innerHTML = '';

    try {
        const querySnapshot = await loansRef.get();
        querySnapshot.forEach(doc => {
            const loan = doc.data();
            if (status === 'all' || loan.status === status) {
                const loanElement = document.createElement('div');
                loanElement.textContent = loan.loanNumber;
                loansList.appendChild(loanElement);
            }
        });
    } catch (error) {
        console.error('Error filtering loans:', error);
    }
}

// Search loans by loan number
export async function searchLoansByNumber(searchTerm) {
    const loansRef = collection(db, 'loans');
    const loansList = document.getElementById('loans-list');
    loansList.innerHTML = '';

    try {
        const querySnapshot = await loansRef.get();
        querySnapshot.forEach(doc => {
            const loan = doc.data();
            if (loan.loanNumber.includes(searchTerm)) {
                const loanElement = document.createElement('div');
                loanElement.textContent = loan.memberName;
                loansList.appendChild(loanElement);
            }
        });
    } catch (error) {
        console.error('Error searching loans:', error);
    }
}

// Show loan details
export async function showLoanDetails(loanId) {
    try {
        const loanRef = doc(db, 'loans', loanId);
        const loanSnap = await getDoc(loanRef);
        
        if (loanSnap.exists()) {
            const loan = loanSnap.data();
            const loanDetails = document.getElementById('loan-details');
            loanDetails.innerHTML = `
                ${loan.loanNumber} 
                ${loan.memberName} 
                ${loan.amount} 
                ${loan.term}
            `;
        }
    } catch (error) {
        console.error('Error showing loan details:', error);
    }
}

// Approve loan
export async function approveLoan(loanId) {
    try {
        const loanRef = doc(db, 'loans', loanId);
        const loanSnap = await getDoc(loanRef);
        
        if (loanSnap.exists()) {
            const loan = loanSnap.data();
            
            if (loan.creditScore < 600) {
                alert('Cannot approve loan. Credit score too low.');
                return;
            }

            const interestRate = parseFloat(prompt('Enter interest rate:'));
            const terms = calculateLoanTerms(loan.amount, loan.term, interestRate);

            await updateDoc(loanRef, {
                status: 'approved',
                approvedDate: new Date(),
                interestRate,
                monthlyPayment: terms.monthlyPayment,
                totalPayable: terms.totalPayable
            });
        }
    } catch (error) {
        console.error('Error approving loan:', error);
    }
}

// Reject loan
export async function rejectLoan(loanId) {
    try {
        const loanRef = doc(db, 'loans', loanId);
        const reason = prompt('Enter rejection reason:');
        
        await updateDoc(loanRef, {
            status: 'rejected',
            rejectionReason: reason,
            rejectedDate: new Date()
        });
    } catch (error) {
        console.error('Error rejecting loan:', error);
    }
}

// Calculate loan terms
export function calculateLoanTerms(amount, term, interestRate) {
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                          (Math.pow(1 + monthlyRate, term) - 1);
    const totalPayable = monthlyPayment * term;
    const totalInterest = totalPayable - amount;
    
    return {
        monthlyPayment,
        totalPayable,
        totalInterest
    };
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    const statusFilter = document.getElementById('status-filter');
    statusFilter.addEventListener('change', () => {
        filterLoansByStatus(statusFilter.value);
    });

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
        searchLoansByNumber(searchInput.value);
    });
});
