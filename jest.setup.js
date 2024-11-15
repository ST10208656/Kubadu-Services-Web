// Mock Firebase
const mockAuth = {
  currentUser: null
};

const mockGetAuth = jest.fn(() => mockAuth);
const mockSignInWithEmailAndPassword = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSendPasswordResetEmail = jest.fn();

jest.mock('firebase/auth', () => ({
  getAuth: () => mockAuth,
  signInWithEmailAndPassword: (...args) => mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args) => mockCreateUserWithEmailAndPassword(...args),
  sendPasswordResetEmail: (...args) => mockSendPasswordResetEmail(...args)
}));

// Export mocks for test usage
global.__mocks__ = {
  mockAuth,
  mockGetAuth,
  mockSignInWithEmailAndPassword,
  mockCreateUserWithEmailAndPassword,
  mockSendPasswordResetEmail
};

// Set up DOM environment
document.body.innerHTML = `
  <form id="loginForm">
    <input type="text" name="email">
    <input type="password" name="password">
  </form>
  <form id="registerForm">
    <input type="text" name="name">
    <input type="text" name="surname">
    <input type="text" name="ID">
    <input type="password" name="password">
    <input type="email" name="email">
  </form>
`;
