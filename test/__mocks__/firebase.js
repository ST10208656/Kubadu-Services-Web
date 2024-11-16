// Mock Firebase functionality
const mockApp = {
    name: '[DEFAULT]',
    options: {}
};

const mockAuth = {
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    currentUser: {
        uid: 'test-user-id',
        email: 'test@example.com'
    }
};

const mockFirestore = {
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    updateDoc: jest.fn(),
    addDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    onSnapshot: jest.fn(),
    deleteDoc: jest.fn()
};

const mockStorage = {
    ref: jest.fn(),
    getMetadata: jest.fn(),
    getDownloadURL: jest.fn(),
    uploadBytes: jest.fn()
};

// Initialize mock functions
export const initializeApp = jest.fn(() => mockApp);
export const getAuth = jest.fn(() => mockAuth);
export const getFirestore = jest.fn(() => mockFirestore);
export const getStorage = jest.fn(() => mockStorage);

// Export Firestore functions
export const collection = jest.fn(() => mockFirestore);
export const doc = jest.fn();
export const getDoc = jest.fn();
export const getDocs = jest.fn();
export const updateDoc = jest.fn();
export const addDoc = jest.fn();
export const deleteDoc = jest.fn();
export const query = jest.fn();
export const where = jest.fn();
export const orderBy = jest.fn();
export const onSnapshot = jest.fn();

// Export Storage functions
export const ref = jest.fn();
export const getMetadata = jest.fn();
export const getDownloadURL = jest.fn();
export const uploadBytes = jest.fn();

// Export Auth functions
export const signInWithEmailAndPassword = jest.fn();
export const signOut = jest.fn();
export const onAuthStateChanged = jest.fn();

// Helper function to reset all mocks
export const resetAllMocks = () => {
    initializeApp.mockClear();
    getAuth.mockClear();
    getFirestore.mockClear();
    getStorage.mockClear();
    collection.mockClear();
    doc.mockClear();
    getDoc.mockClear();
    getDocs.mockClear();
    updateDoc.mockClear();
    addDoc.mockClear();
    deleteDoc.mockClear();
    query.mockClear();
    where.mockClear();
    orderBy.mockClear();
    onSnapshot.mockClear();
    ref.mockClear();
    getMetadata.mockClear();
    getDownloadURL.mockClear();
    uploadBytes.mockClear();
    signInWithEmailAndPassword.mockClear();
    signOut.mockClear();
    onAuthStateChanged.mockClear();
};
