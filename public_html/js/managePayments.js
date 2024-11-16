// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, getDoc, Timestamp } from 'firebase/firestore';

// Initialize Firebase (config should be in a separate config file)
const firebaseConfig = {
    // Firebase config goes here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Payments management functions
export async function loadPayments() {
    const paymentsList = document.getElementById("payments-list");
    if (!paymentsList) {
        console.error('Payments list element not found');
        return;
    }

    paymentsList.innerHTML = "";  // Clear existing payments

    try {
        if (!auth.currentUser) {
            throw new Error('User not authenticated');
        }

        const paymentsRef = collection(db, 'payments');
        const q = query(paymentsRef, orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot || !querySnapshot.forEach) {
            throw new Error('Invalid query snapshot');
        }

        let hasValidPayments = false;
        querySnapshot.forEach((doc) => {
            if (!doc.exists()) return;
            
            const payment = doc.data();
            if (!payment) return;

            try {
                if (isValidPayment(payment)) {
                    const paymentElement = createPaymentElement(doc.id, payment);
                    paymentsList.appendChild(paymentElement);
                    hasValidPayments = true;
                } else {
                    console.warn('Invalid payment data:', { id: doc.id, payment });
                }
            } catch (err) {
                console.error('Error processing payment:', err, { id: doc.id, payment });
            }
        });

        if (!hasValidPayments) {
            paymentsList.innerHTML = '<p>No valid payments found.</p>';
        }
    } catch (error) {
        console.error('Error loading payments:', error);
        alert('Error loading payments. Please try again.');
        paymentsList.innerHTML = '<p>Error loading payments. Please try again.</p>';
    }
}

export async function viewPaymentDetails(paymentId) {
    try {
        if (!auth.currentUser) {
            throw new Error('User not authenticated');
        }

        const paymentDoc = await getDoc(doc(db, 'payments', paymentId));
        if (!paymentDoc.exists()) {
            throw new Error('Payment not found');
        }

        const payment = paymentDoc.data();
        if (!isValidPayment(payment)) {
            throw new Error('Invalid payment data');
        }

        const modalElement = document.getElementById('paymentDetailsModal');
        if (!modalElement) {
            throw new Error('Modal element not found');
        }

        const modal = new bootstrap.Modal(modalElement);
        document.getElementById('payment-details').innerHTML = createPaymentDetailsHTML(payment);
        modal.show();
    } catch (error) {
        console.error('Error viewing payment details:', error);
        alert('Error loading payment details. Please try again.');
    }
}

export async function confirmPayment(paymentId) {
    try {
        if (!auth.currentUser) {
            throw new Error('User not authenticated');
        }

        const paymentDoc = doc(db, 'payments', paymentId);
        const paymentData = await getDoc(paymentDoc);
        
        if (!paymentData.exists()) {
            throw new Error('Payment not found');
        }

        const payment = paymentData.data();
        if (!isValidPayment(payment)) {
            alert('Payment validation failed. Please check the payment details.');
            return;
        }

        if (payment.status !== 'pending') {
            alert('This payment has already been processed.');
            return;
        }

        await updateDoc(paymentDoc, {
            status: 'confirmed',
            confirmationDate: Timestamp.now(),
            confirmedBy: auth.currentUser.uid
        });

        alert('Payment confirmed successfully!');
        await loadPayments(); // Refresh the list
    } catch (error) {
        console.error('Error confirming payment:', error);
        alert('Error confirming payment. Please try again.');
    }
}

export async function rejectPayment(paymentId) {
    try {
        if (!auth.currentUser) {
            throw new Error('User not authenticated');
        }

        const paymentDoc = doc(db, 'payments', paymentId);
        const paymentData = await getDoc(paymentDoc);
        
        if (!paymentData.exists()) {
            throw new Error('Payment not found');
        }

        const payment = paymentData.data();
        if (!isValidPayment(payment)) {
            alert('Payment validation failed. Please check the payment details.');
            return;
        }

        if (payment.status !== 'pending') {
            alert('This payment has already been processed.');
            return;
        }

        const rejectionReason = document.getElementById('rejection-reason')?.value;
        if (!rejectionReason || !rejectionReason.trim()) {
            alert('Please provide a reason for rejection.');
            return;
        }

        await updateDoc(paymentDoc, {
            status: 'rejected',
            rejectionDate: Timestamp.now(),
            rejectedBy: auth.currentUser.uid,
            rejectionReason: rejectionReason.trim()
        });

        alert('Payment rejected successfully!');
        await loadPayments(); // Refresh the list
    } catch (error) {
        console.error('Error rejecting payment:', error);
        alert('Error rejecting payment. Please try again.');
    }
}

export async function filterPaymentsByDate(startDate, endDate) {
    const paymentsList = document.getElementById("payments-list");
    if (!paymentsList) {
        console.error('Payments list element not found');
        return;
    }

    paymentsList.innerHTML = "";  // Clear existing payments

    try {
        if (!startDate || !endDate) {
            throw new Error('Invalid date range');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the entire end date

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Invalid date format');
        }

        const paymentsRef = collection(db, 'payments');
        const q = query(
            paymentsRef,
            where('date', '>=', Timestamp.fromDate(start)),
            where('date', '<=', Timestamp.fromDate(end)),
            orderBy('date', 'desc')
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot || !querySnapshot.forEach) {
            throw new Error('Invalid query snapshot');
        }

        let hasValidPayments = false;
        querySnapshot.forEach((doc) => {
            if (!doc.exists()) return;
            
            const payment = doc.data();
            if (!payment) return;

            try {
                if (isValidPayment(payment)) {
                    const paymentElement = createPaymentElement(doc.id, payment);
                    paymentsList.appendChild(paymentElement);
                    hasValidPayments = true;
                } else {
                    console.warn('Invalid payment data:', { id: doc.id, payment });
                }
            } catch (err) {
                console.error('Error processing payment:', err, { id: doc.id, payment });
            }
        });

        if (!hasValidPayments) {
            paymentsList.innerHTML = '<p>No payments found in the selected date range.</p>';
        }
    } catch (error) {
        console.error('Error filtering payments:', error);
        alert('Error filtering payments. Please try again.');
    }
}

function isValidPayment(payment) {
    if (!payment || typeof payment !== 'object') return false;
    
    // Check required fields
    if (!payment.amount || typeof payment.amount !== 'number' || payment.amount <= 0) return false;
    if (!payment.referenceNumber || typeof payment.referenceNumber !== 'string' || !payment.referenceNumber.trim()) return false;
    if (!payment.paymentMethod || typeof payment.paymentMethod !== 'string' || !payment.paymentMethod.trim()) return false;
    if (!payment.date || !payment.date.toDate || typeof payment.date.toDate !== 'function') return false;

    // Validate optional fields if present
    if (payment.status && typeof payment.status !== 'string') return false;
    if (payment.userName && typeof payment.userName !== 'string') return false;
    if (payment.confirmationDate && (!payment.confirmationDate.toDate || typeof payment.confirmationDate.toDate !== 'function')) return false;
    if (payment.rejectionDate && (!payment.rejectionDate.toDate || typeof payment.rejectionDate.toDate !== 'function')) return false;

    return true;
}

function createPaymentElement(id, payment) {
    if (!payment || !isValidPayment(payment)) {
        console.error('Invalid payment data:', payment);
        return document.createElement('div');
    }

    const div = document.createElement('div');
    div.className = 'payment-item';
    div.innerHTML = `
        <h3>Payment #${id}</h3>
        <p>User: ${payment.userName ? payment.userName.trim() : 'Unknown'}</p>
        <p>Amount: R${typeof payment.amount === 'number' ? payment.amount.toFixed(2) : '0.00'}</p>
        <p>Date: ${payment.date.toDate().toLocaleDateString()}</p>
        <p>Status: ${payment.status ? payment.status.trim() : 'pending'}</p>
        <button onclick="viewPaymentDetails('${id}')">View Details</button>
        ${payment.status === 'pending' ? `
            <button onclick="confirmPayment('${id}')">Confirm</button>
            <button onclick="rejectPayment('${id}')">Reject</button>
        ` : ''}
    `;
    return div;
}

function createPaymentDetailsHTML(payment) {
    if (!payment || !isValidPayment(payment)) {
        console.error('Invalid payment data for details:', payment);
        return '';
    }

    const formatDate = (timestamp) => {
        if (!timestamp || !timestamp.toDate || typeof timestamp.toDate !== 'function') {
            return 'Invalid date';
        }
        return timestamp.toDate().toLocaleDateString();
    };

    return `
        <h2>Payment Details</h2>
        <p>User: ${payment.userName ? payment.userName.trim() : 'Unknown'}</p>
        <p>Amount: R${typeof payment.amount === 'number' ? payment.amount.toFixed(2) : '0.00'}</p>
        <p>Date: ${formatDate(payment.date)}</p>
        <p>Status: ${payment.status ? payment.status.trim() : 'pending'}</p>
        <p>Payment Method: ${payment.paymentMethod ? payment.paymentMethod.trim() : 'Not specified'}</p>
        <p>Reference Number: ${payment.referenceNumber ? payment.referenceNumber.trim() : 'Not provided'}</p>
        ${payment.confirmationDate ? `<p>Confirmed Date: ${formatDate(payment.confirmationDate)}</p>` : ''}
        ${payment.rejectionDate ? `
            <p>Rejected Date: ${formatDate(payment.rejectionDate)}</p>
            <p>Rejection Reason: ${payment.rejectionReason ? payment.rejectionReason.trim() : 'Not provided'}</p>
        ` : ''}
    `;
}

// Export functions to window object for testing
if (typeof window !== 'undefined') {
    Object.assign(window, {
        loadPayments,
        viewPaymentDetails,
        confirmPayment,
        rejectPayment,
        filterPaymentsByDate
    });
}
