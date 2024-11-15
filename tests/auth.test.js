import { auth } from '../public_html/js/auth';

describe('Authentication Module', () => {
    const { mockSignInWithEmailAndPassword, mockCreateUserWithEmailAndPassword, mockSendPasswordResetEmail } = global.__mocks__;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('login', () => {
        test('successful login returns user object', async () => {
            const mockUser = { email: 'test@example.com' };
            mockSignInWithEmailAndPassword.mockResolvedValueOnce({ user: mockUser });

            const result = await auth.login('test@example.com', 'password123');

            expect(result.success).toBe(true);
            expect(result.user).toEqual(mockUser);
            expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
                expect.any(Object),
                'test@example.com',
                'password123'
            );
        });

        test('failed login returns error message', async () => {
            const errorMessage = 'Invalid credentials';
            mockSignInWithEmailAndPassword.mockRejectedValueOnce(new Error(errorMessage));

            const result = await auth.login('test@example.com', 'wrongpassword');

            expect(result.success).toBe(false);
            expect(result.error).toBe(errorMessage);
        });
    });

    describe('register', () => {
        const userData = {
            name: 'John Doe',
            id: '1234567890123'
        };

        test('successful registration returns user object', async () => {
            const mockUser = { email: 'new@example.com' };
            mockCreateUserWithEmailAndPassword.mockResolvedValueOnce({ user: mockUser });

            const result = await auth.register('new@example.com', 'Password123', userData);

            expect(result.success).toBe(true);
            expect(result.user).toEqual(mockUser);
            expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
                expect.any(Object),
                'new@example.com',
                'Password123'
            );
        });

        test('failed registration returns error message', async () => {
            const errorMessage = 'Email already in use';
            mockCreateUserWithEmailAndPassword.mockRejectedValueOnce(new Error(errorMessage));

            const result = await auth.register('existing@example.com', 'Password123', userData);

            expect(result.success).toBe(false);
            expect(result.error).toBe(errorMessage);
        });
    });

    describe('resetPassword', () => {
        test('successful password reset', async () => {
            mockSendPasswordResetEmail.mockResolvedValueOnce();

            const result = await auth.resetPassword('test@example.com');

            expect(result.success).toBe(true);
            expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
                expect.any(Object),
                'test@example.com'
            );
        });

        test('failed password reset returns error message', async () => {
            const errorMessage = 'User not found';
            mockSendPasswordResetEmail.mockRejectedValueOnce(new Error(errorMessage));

            const result = await auth.resetPassword('nonexistent@example.com');

            expect(result.success).toBe(false);
            expect(result.error).toBe(errorMessage);
        });
    });
});
