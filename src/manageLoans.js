import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Get current user ID (mock for testing)
const getCurrentUserId = () => 'admin123';

export const approveLoan = async (loanId) => {
    try {
        const loanRef = doc(db, 'loans', loanId);
        const loanSnap = await getDoc(loanRef);

        if (!loanSnap.exists()) {
            window.alert('Loan not found');
            return;
        }

        const loanData = loanSnap.data();
        const allDocsVerified = loanData.documents.every(doc => doc.verified);

        if (!allDocsVerified) {
            window.alert('All required documents must be verified before approval.');
            return;
        }

        await updateDoc(loanRef, {
            status: 'approved',
            approvedDate: new Date(),
            approvedBy: getCurrentUserId()
        });

        window.alert('Loan approved successfully!');
    } catch (error) {
        console.error('Error approving loan:', error);
        window.alert('Error approving loan. Please try again.');
    }
};

export const rejectLoan = async (loanId) => {
    try {
        const loanRef = doc(db, 'loans', loanId);
        const loanSnap = await getDoc(loanRef);

        if (!loanSnap.exists()) {
            window.alert('Loan not found');
            return;
        }

        await updateDoc(loanRef, {
            status: 'rejected',
            rejectedDate: new Date(),
            rejectedBy: getCurrentUserId()
        });

        window.alert('Loan rejected successfully!');
    } catch (error) {
        console.error('Error rejecting loan:', error);
        window.alert('Error rejecting loan. Please try again.');
    }
};

export const displayLoanDetails = async (loanId) => {
    try {
        const loanRef = doc(db, 'loans', loanId);
        const loanSnap = await getDoc(loanRef);

        if (!loanSnap.exists()) {
            window.alert('Loan not found');
            return null;
        }

        return {
            id: loanId,
            ...loanSnap.data()
        };
    } catch (error) {
        console.error('Error loading loan details:', error);
        window.alert('Error loading loan details. Please try again.');
        return null;
    }
};

export const loadLoans = async () => {
    try {
        const loansRef = collection(db, 'loans');
        const loansSnap = await getDocs(loansRef);
        return loansSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error loading loans:', error);
        window.alert('Error loading loans. Please try again.');
        return [];
    }
};
