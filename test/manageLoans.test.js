// Import functions to test
import { loadLoans, viewLoanDetails, approveLoan, rejectLoan } from '../public_html/js/manageLoans.js';

// Mock Firebase modules
jest.mock('firebase/app', () => ({
    initializeApp: jest.fn()
}));

jest.mock('firebase/firestore', () => {
    const mockDb = {};
    return {
        getFirestore: jest.fn(() => mockDb),
        collection: jest.fn(),
        query: jest.fn(),
        where: jest.fn(),
        orderBy: jest.fn(),
        getDocs: jest.fn(),
        doc: jest.fn(),
        getDoc: jest.fn(),
        updateDoc: jest.fn(),
        deleteDoc: jest.fn(),
        mockDb
    };
});

// Import mocked Firebase objects
const { 
    getFirestore, collection, query, where, orderBy, getDocs, 
    doc, getDoc, updateDoc, deleteDoc, mockDb
} = require('firebase/firestore');

// Mock Firebase auth
const auth = { currentUser: { uid: 'testUserId' } };
window.auth = auth;

beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset the DOM
    document.body.innerHTML = `
        <div id="loans-list"></div>
        <div id="loan-details"></div>
        <div id="loanDetailsModal"></div>
    `;

    // Mock window.alert and console.error
    window.alert = jest.fn();
    window.console.error = jest.fn();

    // Mock bootstrap Modal
    window.bootstrap = {
        Modal: jest.fn().mockImplementation(() => ({
            show: jest.fn()
        }))
    };

    // Mock helper functions
    window.createLoanElement = jest.fn().mockImplementation((id, loan) => {
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
    });

    window.createLoanDetailsHTML = jest.fn().mockImplementation((loan) => `
        <h2>Loan Details</h2>
        <p>Type: ${loan.type}</p>
        <p>Amount: ${loan.amount}</p>
        <p>Status: ${loan.status}</p>
        <p>Request Date: ${loan.requestDate.toDate().toLocaleDateString()}</p>
        <p>Purpose: ${loan.purpose || ''}</p>
        ${loan.approvedDate ? `<p>Approved Date: ${loan.approvedDate.toDate().toLocaleDateString()}</p>` : ''}
        ${loan.rejectedDate ? `<p>Rejected Date: ${loan.rejectedDate.toDate().toLocaleDateString()}</p>` : ''}
    `);

    window.areDocumentsVerified = jest.fn().mockImplementation((loan) => {
        return loan.documents && loan.documents.every(doc => doc.verified === true);
    });
});

describe('Loan Management', () => {
    describe('loadLoans', () => {
        test('should load and display loans', async () => {
            const mockLoan = {
                id: 'loan1',
                data: () => ({
                    type: 'Personal',
                    amount: 1000,
                    status: 'pending',
                    requestDate: {
                        toDate: () => new Date()
                    }
                })
            };

            const mockDocs = {
                forEach: jest.fn((callback) => {
                    callback(mockLoan);
                    callback(mockLoan);
                })
            };

            const mockQuerySnapshot = {
                forEach: mockDocs.forEach
            };

            collection.mockReturnValue('loansRef');
            query.mockReturnValue('queryRef');
            getDocs.mockResolvedValue(mockQuerySnapshot);

            await loadLoans();

            expect(collection).toHaveBeenCalledWith(mockDb, 'loans');
            expect(orderBy).toHaveBeenCalledWith('requestDate', 'desc');
            expect(query).toHaveBeenCalledWith('loansRef', expect.any(Function));
            expect(getDocs).toHaveBeenCalledWith('queryRef');
            expect(mockDocs.forEach).toHaveBeenCalledTimes(1);
            expect(window.createLoanElement).toHaveBeenCalledTimes(2);
        });

        test('should handle errors when loading loans', async () => {
            getDocs.mockRejectedValue(new Error('Failed to load'));

            await loadLoans();

            expect(window.alert).toHaveBeenCalledWith('Error loading loans. Please try again.');
        });
    });

    describe('viewLoanDetails', () => {
        test('should display loan details in modal', async () => {
            const mockLoanRef = {
                id: 'loan123'
            };
            const mockLoan = {
                exists: () => true,
                data: () => ({
                    type: 'Personal',
                    amount: 1000,
                    status: 'pending',
                    requestDate: {
                        toDate: () => new Date()
                    },
                    purpose: 'Home renovation'
                })
            };

            doc.mockReturnValue(mockLoanRef);
            getDoc.mockResolvedValue(mockLoan);

            await viewLoanDetails('loan123');

            expect(doc).toHaveBeenCalledWith(mockDb, 'loans', 'loan123');
            expect(getDoc).toHaveBeenCalledWith(mockLoanRef);
            expect(window.createLoanDetailsHTML).toHaveBeenCalledWith(mockLoan.data());
            expect(window.bootstrap.Modal).toHaveBeenCalled();
        });

        test('should handle errors when viewing loan details', async () => {
            getDoc.mockRejectedValue(new Error('Failed to load'));

            await viewLoanDetails('loan123');

            expect(window.alert).toHaveBeenCalledWith('Error loading loan details. Please try again.');
        });
    });

    describe('approveLoan', () => {
        test('should approve a valid loan', async () => {
            const mockLoanRef = {
                id: 'loan123'
            };
            const mockLoan = {
                exists: () => true,
                data: () => ({
                    documents: [{ verified: true }, { verified: true }],
                    status: 'pending'
                })
            };

            doc.mockReturnValue(mockLoanRef);
            getDoc.mockResolvedValue(mockLoan);
            updateDoc.mockResolvedValue();
            window.areDocumentsVerified.mockReturnValue(true);

            await approveLoan('loan123');

            expect(doc).toHaveBeenCalledWith(mockDb, 'loans', 'loan123');
            expect(updateDoc).toHaveBeenCalledWith(mockLoanRef, expect.objectContaining({
                status: 'approved',
                approvedBy: 'testUserId',
                approvedDate: expect.any(Date)
            }));
            expect(window.alert).toHaveBeenCalledWith('Loan approved successfully!');
        });

        test('should handle non-existent loan', async () => {
            const mockLoan = {
                exists: () => false,
                data: () => null
            };

            getDoc.mockResolvedValue(mockLoan);

            await approveLoan('loan123');

            expect(updateDoc).not.toHaveBeenCalled();
            expect(window.console.error).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith('Error approving loan. Please try again.');
        });

        test('should handle unverified documents', async () => {
            const mockLoanRef = {
                id: 'loan123'
            };
            const mockLoan = {
                exists: () => true,
                data: () => ({
                    documents: [{ verified: true }, { verified: false }],
                    status: 'pending'
                })
            };

            doc.mockReturnValue(mockLoanRef);
            getDoc.mockResolvedValue(mockLoan);
            window.areDocumentsVerified.mockReturnValue(false);

            await approveLoan('loan123');

            expect(doc).toHaveBeenCalledWith(mockDb, 'loans', 'loan123');
            expect(updateDoc).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith('All required documents must be verified before approval.');
            expect(window.console.error).not.toHaveBeenCalled();
        });

        test('should handle errors during approval', async () => {
            const mockLoan = {
                exists: () => true,
                data: () => ({
                    documents: [{ verified: true }, { verified: true }],
                    status: 'pending'
                })
            };

            getDoc.mockResolvedValue(mockLoan);
            updateDoc.mockRejectedValue(new Error('Failed to approve'));
            window.areDocumentsVerified.mockReturnValue(true);

            await approveLoan('loan123');

            expect(window.console.error).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith('Error approving loan. Please try again.');
        });
    });

    describe('rejectLoan', () => {
        test('should reject an existing loan', async () => {
            const mockLoanRef = {
                id: 'loan123'
            };

            doc.mockReturnValue(mockLoanRef);
            updateDoc.mockResolvedValue();

            await rejectLoan('loan123');

            expect(doc).toHaveBeenCalledWith(mockDb, 'loans', 'loan123');
            expect(updateDoc).toHaveBeenCalledWith(mockLoanRef, {
                status: 'rejected',
                rejectedDate: expect.any(Date),
                rejectedBy: 'testUserId'
            });
            expect(window.alert).toHaveBeenCalledWith('Loan rejected successfully!');
        });

        test('should handle errors during rejection', async () => {
            updateDoc.mockRejectedValue(new Error('Failed to reject'));

            await rejectLoan('loan123');

            expect(window.console.error).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith('Error rejecting loan. Please try again.');
        });
    });
});
