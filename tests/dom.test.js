/**
 * @jest-environment jsdom
 */

import { validateLoginForm, initLoanCalculator, validateProfile, initChat } from '../public_html/js/domHandlers';

describe('DOM Interactions', () => {
    beforeEach(() => {
        // Reset the DOM before each test
        document.body.innerHTML = '';
    });

    describe('Login Page', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <form id="loginForm">
                    <input type="email" id="email" required>
                    <input type="password" id="password" required>
                    <div id="loginError" class="error-message"></div>
                    <button type="submit">Login</button>
                </form>
            `;
            validateLoginForm();
        });

        test('shows error message for invalid email', () => {
            const emailInput = document.getElementById('email');
            const errorDiv = document.getElementById('loginError');
            
            emailInput.value = 'invalid-email';
            emailInput.dispatchEvent(new Event('input'));
            
            expect(emailInput.validity.valid).toBe(false);
            expect(errorDiv.textContent).toContain('Please enter a valid email');
        });

        test('shows error message for empty password', () => {
            const passwordInput = document.getElementById('password');
            const errorDiv = document.getElementById('loginError');
            
            passwordInput.value = '';
            passwordInput.dispatchEvent(new Event('input'));
            
            expect(passwordInput.validity.valid).toBe(false);
            expect(errorDiv.textContent).toContain('Password is required');
        });
    });

    describe('Loan Calculator', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <form id="loanCalculator">
                    <input type="number" id="loanAmount" required>
                    <input type="number" id="loanTerm" required>
                    <input type="number" id="monthlyIncome" required>
                    <div id="monthlyPayment"></div>
                    <div id="totalAmount"></div>
                    <div id="loanError" class="error-message"></div>
                    <button type="submit">Calculate</button>
                </form>
            `;
            initLoanCalculator();
        });

        test('calculates loan details for valid inputs', () => {
            const form = document.getElementById('loanCalculator');
            const amountInput = document.getElementById('loanAmount');
            const termInput = document.getElementById('loanTerm');
            const incomeInput = document.getElementById('monthlyIncome');
            const monthlyPaymentDiv = document.getElementById('monthlyPayment');
            const totalAmountDiv = document.getElementById('totalAmount');
            
            amountInput.value = '10000';
            termInput.value = '12';
            incomeInput.value = '5000';
            
            form.dispatchEvent(new Event('submit', { cancelable: true }));
            
            expect(monthlyPaymentDiv.textContent.replace(/\s+/g, '')).toBe('R902.58');
            expect(totalAmountDiv.textContent.replace(/\s+/g, '')).toBe('R10,831.00');
        });

        test('shows error for loan amount exceeding income limit', () => {
            const form = document.getElementById('loanCalculator');
            const amountInput = document.getElementById('loanAmount');
            const termInput = document.getElementById('loanTerm');
            const incomeInput = document.getElementById('monthlyIncome');
            const errorDiv = document.getElementById('loanError');
            
            amountInput.value = '50000';
            termInput.value = '12';
            incomeInput.value = '3000';
            
            form.dispatchEvent(new Event('submit', { cancelable: true }));
            
            expect(errorDiv.textContent).toContain('Monthly payment exceeds 40% of monthly income');
        });
    });

    describe('Profile Editor', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <form id="profileForm">
                    <input type="text" id="name" required>
                    <input type="text" id="surname" required>
                    <input type="text" id="idNumber" required>
                    <input type="tel" id="phone" required>
                    <input type="email" id="email" required>
                    <div id="profileError" class="error-message"></div>
                    <button type="submit">Save Changes</button>
                </form>
            `;
            validateProfile();
        });

        test('validates South African ID number', () => {
            const idInput = document.getElementById('idNumber');
            const errorDiv = document.getElementById('profileError');
            
            // Invalid ID
            idInput.value = '1234567890';
            idInput.dispatchEvent(new Event('input'));
            expect(errorDiv.textContent).toContain('Please enter a valid 13-digit South African ID number');
            
            // Valid ID
            idInput.value = '8001015009087';
            idInput.dispatchEvent(new Event('input'));
            expect(errorDiv.textContent).toBe('');
        });

        test('validates phone number format', () => {
            const phoneInput = document.getElementById('phone');
            const errorDiv = document.getElementById('profileError');
            
            // Invalid phone
            phoneInput.value = '123';
            phoneInput.dispatchEvent(new Event('input'));
            expect(errorDiv.textContent).toContain('Please enter a valid phone number');
            
            // Valid phone
            phoneInput.value = '0721234567';
            phoneInput.dispatchEvent(new Event('input'));
            expect(errorDiv.textContent).toBe('');
        });
    });

    describe('Chat Interface', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div id="chatContainer">
                    <div id="messageList"></div>
                    <form id="messageForm">
                        <input type="text" id="messageInput" required>
                        <button type="submit">Send</button>
                    </form>
                </div>
            `;
            initChat();
        });

        test('adds new message to chat', () => {
            const messageList = document.getElementById('messageList');
            const messageInput = document.getElementById('messageInput');
            const form = document.getElementById('messageForm');
            
            messageInput.value = 'Hello, support team!';
            form.dispatchEvent(new Event('submit', { cancelable: true }));
            
            expect(messageList.children.length).toBe(1);
            expect(messageList.lastChild.textContent).toContain('Hello, support team!');
        });

        test('prevents empty message submission', () => {
            const messageList = document.getElementById('messageList');
            const messageInput = document.getElementById('messageInput');
            const form = document.getElementById('messageForm');
            
            messageInput.value = '';
            form.dispatchEvent(new Event('submit', { cancelable: true }));
            
            expect(messageList.children.length).toBe(0);
        });
    });
});
