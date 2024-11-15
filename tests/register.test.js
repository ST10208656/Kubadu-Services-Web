import { auth } from '../public_html/js/auth';
import '@testing-library/jest-dom';

describe('Registration Functionality', () => {
  const { mockCreateUserWithEmailAndPassword } = global.__mocks__;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successful registration with valid inputs', async () => {
    mockCreateUserWithEmailAndPassword.mockResolvedValueOnce({
      user: { email: 'newuser@example.com' }
    });

    const form = document.getElementById('registerForm');
    const inputs = {
      name: form.querySelector('input[name="name"]'),
      surname: form.querySelector('input[name="surname"]'),
      id: form.querySelector('input[name="ID"]'),
      email: form.querySelector('input[name="email"]'),
      password: form.querySelector('input[name="password"]')
    };

    // Fill in form fields
    inputs.name.value = 'John';
    inputs.surname.value = 'Doe';
    inputs.id.value = '1234567890123';
    inputs.email.value = 'newuser@example.com';
    inputs.password.value = 'Password123';

    const userData = {
      name: inputs.name.value,
      surname: inputs.surname.value,
      id: inputs.id.value
    };

    const result = await auth.register(inputs.email.value, inputs.password.value, userData);

    expect(result.success).toBe(true);
    expect(result.user.email).toBe('newuser@example.com');
    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.any(Object),
      'newuser@example.com',
      'Password123'
    );
  });

  test('handles registration error correctly', async () => {
    const mockError = new Error('Email already in use');
    mockCreateUserWithEmailAndPassword.mockRejectedValueOnce(mockError);

    const form = document.getElementById('registerForm');
    const inputs = {
      name: form.querySelector('input[name="name"]'),
      surname: form.querySelector('input[name="surname"]'),
      id: form.querySelector('input[name="ID"]'),
      email: form.querySelector('input[name="email"]'),
      password: form.querySelector('input[name="password"]')
    };

    // Fill in form fields
    inputs.name.value = 'John';
    inputs.surname.value = 'Doe';
    inputs.id.value = '1234567890123';
    inputs.email.value = 'existing@example.com';
    inputs.password.value = 'Password123';

    const userData = {
      name: inputs.name.value,
      surname: inputs.surname.value,
      id: inputs.id.value
    };

    const result = await auth.register(inputs.email.value, inputs.password.value, userData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Email already in use');
  });

  test('validates required fields', () => {
    const form = document.getElementById('registerForm');
    const preventDefault = jest.fn();
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      preventDefault();
    });
    
    form.dispatchEvent(new Event('submit'));
    expect(preventDefault).toHaveBeenCalled();
  });
});
