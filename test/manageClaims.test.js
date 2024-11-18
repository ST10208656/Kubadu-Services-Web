// Import Firebase modules
import { getFirestore, collection, query, where, orderBy, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Import functions to test
import { loadClaims, viewClaimDetails, approveClaim, rejectClaim } from '../public_html/js/manageClaims.js';

// Mock Firebase modules
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    getDocs: jest.fn(),
    doc: jest.fn(() => ({})),
    updateDoc: jest.fn(),
    getDoc: jest.fn()
}));

jest.mock('firebase/app', () => ({
    initializeApp: jest.fn()
}));

const mockFirestore = jest.requireMock('firebase/firestore');

describe('Claims Management', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="users-claims-list"></div>
            <div id="claimDetailsModal">
                <div id="claim-details"></div>
            </div>
            <input type="text" id="admin-notes" />
        `;

        window.bootstrap = { Modal: jest.fn().mockImplementation(() => ({ show: jest.fn() })) };
        window.createClaimElement = jest.fn().mockImplementation((id, claim) => {
            const div = document.createElement('div');
            div.className = 'claim-item';
            div.innerHTML = `<h3>${claim.type}</h3><p>Status: ${claim.status}</p>`;
            return div;
        });
        window.createClaimDetailsHTML = jest.fn().mockImplementation((claim) => `<h2>Claim Details</h2><p>Type: ${claim.type}</p><p>Amount: ${claim.amount}</p>`);
        window.alert = jest.fn();
        window.console = { error: jest.fn() };

        global.auth = { currentUser: { uid: 'testUserId' } };

        mockFirestore.getDocs.mockReset();
        mockFirestore.getDoc.mockReset();
        mockFirestore.updateDoc.mockReset();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('loadClaims', () => {
        test('should load claims successfully', async () => {
            const mockClaimData = { type: 'Medical', status: 'pending' };
            const mockClaim = { id: 'claim1', data: () => mockClaimData };
            mockFirestore.getDocs.mockResolvedValueOnce({ forEach: (callback) => callback(mockClaim) });

            await loadClaims();

            const claimsList = document.getElementById('users-claims-list');
            expect(window.createClaimElement).toHaveBeenCalledTimes(1);
            expect(window.createClaimElement).toHaveBeenCalledWith('claim1', mockClaimData);
            expect(claimsList.children.length).toBe(1);
            expect(claimsList.innerHTML).toContain('Medical');
        });

        test('should handle load error', async () => {
            mockFirestore.getDocs.mockRejectedValueOnce(new Error('Load failed'));

            await loadClaims();

            expect(window.alert).toHaveBeenCalledTimes(1);
            expect(window.alert).toHaveBeenCalledWith('Error loading claims. Please try again.');
        });
    });

    describe('viewClaimDetails', () => {
        test('should display claim details', async () => {
            const mockClaimData = { type: 'Medical', amount: 1000 };
            mockFirestore.getDoc.mockResolvedValueOnce({ exists: () => true, data: () => mockClaimData });

            await viewClaimDetails('claim123');

            const claimDetails = document.getElementById('claim-details');
            expect(window.createClaimDetailsHTML).toHaveBeenCalledTimes(1);
            expect(window.createClaimDetailsHTML).toHaveBeenCalledWith(mockClaimData);
            expect(claimDetails.innerHTML).toContain('Medical');
            expect(claimDetails.innerHTML).toContain('1000');
            expect(window.bootstrap.Modal).toHaveBeenCalledTimes(1);
            expect(window.bootstrap.Modal).toHaveBeenCalled();
        });

        test('should handle view error', async () => {
            mockFirestore.getDoc.mockRejectedValueOnce(new Error('View failed'));

            await viewClaimDetails('claim123');

            expect(window.alert).toHaveBeenCalledTimes(1);
            expect(window.alert).toHaveBeenCalledWith('Error loading claim details. Please try again.');
        });
    });

    describe('approveClaim', () => {
        test('should approve claim with verified documents', async () => {
            const mockClaim = { exists: () => true, data: () => ({ documents: [{ verified: true }] }) };
            mockFirestore.getDoc.mockResolvedValueOnce(mockClaim);
            mockFirestore.updateDoc.mockResolvedValueOnce();

            await approveClaim('claim123');

            expect(window.alert).toHaveBeenCalledTimes(1);
            expect(window.alert).toHaveBeenCalledWith('Claim approved successfully!');
        });

        test('should reject unverified documents', async () => {
            const mockClaim = { exists: () => true, data: () => ({ documents: [{ verified: false }] }) };
            mockFirestore.getDoc.mockResolvedValueOnce(mockClaim);

            await approveClaim('claim123');

            expect(window.alert).toHaveBeenCalledTimes(1);
            expect(window.alert).toHaveBeenCalledWith('All required documents must be verified before approval.');
        });
    });

    describe('rejectClaim', () => {
        test('should reject claim with notes', async () => {
            document.getElementById('admin-notes').value = 'Invalid claim';
            mockFirestore.getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({}) });
            mockFirestore.updateDoc.mockResolvedValueOnce();

            await rejectClaim('claim123');

            expect(mockFirestore.updateDoc).toHaveBeenCalledTimes(1);
            expect(mockFirestore.updateDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ status: 'rejected', adminNotes: 'Invalid claim', rejectedBy: 'testUserId' }));
            expect(window.alert).toHaveBeenCalledTimes(1);
            expect(window.alert).toHaveBeenCalledWith('Claim rejected successfully!');
        });

        test('should require rejection notes', async () => {
            document.getElementById('admin-notes').value = '';
            await rejectClaim('claim123');

            expect(window.alert).toHaveBeenCalledTimes(1);
            expect(window.alert).toHaveBeenCalledWith('Please provide a reason for rejection.');
        });

        test('should handle rejection error', async () => {
            document.getElementById('admin-notes').value = 'Invalid claim';
            mockFirestore.getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({}) });
            mockFirestore.updateDoc.mockRejectedValueOnce(new Error('Rejection failed'));

            await rejectClaim('claim123');

            expect(window.console.error).toHaveBeenCalledTimes(1);
            expect(window.alert).toHaveBeenCalledTimes(1);
            expect(window.alert).toHaveBeenCalledWith('Error rejecting claim. Please try again.');
        });
    });
});
