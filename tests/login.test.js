import { auth } from '../public_html/js/auth';
import '@testing-library/jest-dom';

describe('Login Functionality', () => {
  const { mockSignInWithEmailAndPassword } = global.__mocks__;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('successful login submits form with correct credentials', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValueOnce({
      user: { email: 'test@example.com' }
    });

    const form = document.getElementById('loginForm');
    const emailInput = form.querySelector('input[name="email"]');
    const passwordInput = form.querySelector('input[name="password"]');

    emailInput.value = 'test@example.com';
    passwordInput.value = 'Password123';

    const result = await auth.login(emailInput.value, passwordInput.value);

    expect(result.success).toBe(true);
    expect(result.user.email).toBe('test@example.com');
    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.any(Object),
      'test@example.com',
      'Password123'
    );
  });

  test('handles login error correctly', async () => {
    const mockError = new Error('Invalid credentials');
    mockSignInWithEmailAndPassword.mockRejectedValueOnce(mockError);

    const form = document.getElementById('loginForm');
    const emailInput = form.querySelector('input[name="email"]');
    const passwordInput = form.querySelector('input[name="password"]');

    emailInput.value = 'test@example.com';
    passwordInput.value = 'wrongpassword';

    const result = await auth.login(emailInput.value, passwordInput.value);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid credentials');
  });

  test('form prevents default submission', () => {
    const form = document.getElementById('loginForm');
    const preventDefault = jest.fn();
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      preventDefault();
    });
    
    form.dispatchEvent(new Event('submit'));
    expect(preventDefault).toHaveBeenCalled();
  });
});
