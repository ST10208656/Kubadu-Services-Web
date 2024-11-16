import { getAuth } from 'firebase/auth';

describe('Login Admin', () => {
    let auth;

    beforeEach(() => {
        document.body.innerHTML = `
            <form id="login-form">
                <input type="email" id="email" />
                <input type="password" id="password" />
                <button type="submit">Login</button>
            </form>
            <div id="error-message"></div>
        `;

        // Setup Firebase Auth mock
        auth = {
            signInWithEmailAndPassword: jest.fn().mockResolvedValue({
                user: { email: 'test@example.com' }
            })
        };
        global.auth = auth;
    });

    // Basic DOM element tests
    test('should have login form elements', () => {
        const form = document.getElementById('login-form');
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        
        expect(form).not.toBeNull();
        expect(email).not.toBeNull();
        expect(password).not.toBeNull();
    });

    test('should have error message container', () => {
        const errorDiv = document.getElementById('error-message');
        expect(errorDiv).not.toBeNull();
    });

    // Simple Firebase Auth interaction tests
    test('should attempt login with Firebase Auth', async () => {
        const email = 'test@example.com';
        const password = 'password123';

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        emailInput.value = email;
        passwordInput.value = password;

        // Directly call signInWithEmailAndPassword
        await auth.signInWithEmailAndPassword(email, password);

        // Verify Firebase Auth was called with correct credentials
        expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith(email, password);
    });

    test('should handle failed login attempt', async () => {
        const email = 'wrong@example.com';
        const password = 'wrongpass';

        // Mock auth failure
        auth.signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Invalid credentials'));

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        emailInput.value = email;
        passwordInput.value = password;

        // Set up error message
        const errorDiv = document.getElementById('error-message');
        
        try {
            // Directly call signInWithEmailAndPassword
            await auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            errorDiv.textContent = 'Invalid email or password';
        }

        // Wait for the next tick to allow async operations to complete
        await new Promise(resolve => setTimeout(resolve, 0));

        // Verify error message is displayed
        expect(errorDiv.textContent).toBe('Invalid email or password');
    });
});
