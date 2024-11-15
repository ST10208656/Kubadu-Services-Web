import { forms } from '../public_html/js/forms';

describe('Forms Module', () => {
    describe('validateEmail', () => {
        test('validates correct email formats', () => {
            expect(forms.validateEmail('test@example.com')).toBe(true);
            expect(forms.validateEmail('user.name@domain.co.za')).toBe(true);
            expect(forms.validateEmail('user+tag@example.com')).toBe(true);
        });

        test('rejects incorrect email formats', () => {
            expect(forms.validateEmail('test@')).toBe(false);
            expect(forms.validateEmail('@domain.com')).toBe(false);
            expect(forms.validateEmail('test.com')).toBe(false);
            expect(forms.validateEmail('')).toBe(false);
        });
    });

    describe('validatePassword', () => {
        test('accepts valid passwords', () => {
            expect(forms.validatePassword('Password123')).toBe(true);
            expect(forms.validatePassword('SecurePass1')).toBe(true);
        });

        test('rejects invalid passwords', () => {
            expect(forms.validatePassword('password')).toBe(false); // no uppercase, no number
            expect(forms.validatePassword('PASSWORD123')).toBe(false); // no lowercase
            expect(forms.validatePassword('Pass1')).toBe(false); // too short
            expect(forms.validatePassword('')).toBe(false);
        });
    });

    describe('validateIDNumber', () => {
        test('accepts valid South African ID numbers', () => {
            expect(forms.validateIDNumber('1234567890123')).toBe(true);
        });

        test('rejects invalid ID numbers', () => {
            expect(forms.validateIDNumber('123')).toBe(false); // too short
            expect(forms.validateIDNumber('12345678901234')).toBe(false); // too long
            expect(forms.validateIDNumber('abcd12345678')).toBe(false); // contains letters
            expect(forms.validateIDNumber('')).toBe(false);
        });
    });

    describe('validateRequiredFields', () => {
        test('accepts form with all required fields filled', () => {
            const formData = new FormData();
            formData.append('name', 'John');
            formData.append('email', 'john@example.com');

            const result = forms.validateRequiredFields(formData);
            expect(result.isValid).toBe(true);
        });

        test('rejects form with empty required fields', () => {
            const formData = new FormData();
            formData.append('name', '');
            formData.append('email', 'john@example.com');

            const result = forms.validateRequiredFields(formData);
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('name is required');
        });
    });

    describe('getFormData', () => {
        test('converts FormData to object', () => {
            // Create a mock form element
            document.body.innerHTML = `
                <form id="testForm">
                    <input name="name" value="John">
                    <input name="email" value="john@example.com">
                </form>
            `;

            const form = document.getElementById('testForm');
            const result = forms.getFormData(form);

            expect(result).toEqual({
                name: 'John',
                email: 'john@example.com'
            });
        });
    });
});
