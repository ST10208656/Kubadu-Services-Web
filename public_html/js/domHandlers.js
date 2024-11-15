/**
 * DOM Event Handlers for Kubadu Financial Services
 */

// Utility function for currency formatting
function formatCurrency(amount) {
    return amount.toLocaleString('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).replace('ZAR ', 'R');
}

// Login Form Validation
export function validateLoginForm() {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorDiv = document.getElementById('loginError');

    emailInput.addEventListener('input', () => {
        if (!emailInput.validity.valid) {
            errorDiv.textContent = 'Please enter a valid email';
        } else {
            errorDiv.textContent = '';
        }
    });

    passwordInput.addEventListener('input', () => {
        if (passwordInput.value.length === 0) {
            errorDiv.textContent = 'Password is required';
        } else {
            errorDiv.textContent = '';
        }
    });
}

// Loan Calculator
export function initLoanCalculator() {
    const form = document.getElementById('loanCalculator');
    const amountInput = document.getElementById('loanAmount');
    const termInput = document.getElementById('loanTerm');
    const incomeInput = document.getElementById('monthlyIncome');
    const monthlyPaymentDiv = document.getElementById('monthlyPayment');
    const totalAmountDiv = document.getElementById('totalAmount');
    const errorDiv = document.getElementById('loanError');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(amountInput.value);
        const term = parseInt(termInput.value);
        const income = parseFloat(incomeInput.value);

        const monthlyPayment = calculateMonthlyPayment(amount, term);
        
        if (monthlyPayment > income * 0.4) {
            errorDiv.textContent = 'Monthly payment exceeds 40% of monthly income';
            return;
        }

        monthlyPaymentDiv.textContent = formatCurrency(monthlyPayment);
        totalAmountDiv.textContent = formatCurrency(monthlyPayment * term);
    });
}

function calculateMonthlyPayment(principal, months, rate = 0.15) {
    const monthlyRate = rate / 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
           (Math.pow(1 + monthlyRate, months) - 1);
}

// Profile Validation
export function validateProfile() {
    const form = document.getElementById('profileForm');
    const idInput = document.getElementById('idNumber');
    const phoneInput = document.getElementById('phone');
    const errorDiv = document.getElementById('profileError');

    idInput.addEventListener('input', () => {
        if (!/^\d{13}$/.test(idInput.value)) {
            errorDiv.textContent = 'Please enter a valid 13-digit South African ID number';
        } else {
            errorDiv.textContent = '';
        }
    });

    phoneInput.addEventListener('input', () => {
        if (!/^0[0-9]{9}$/.test(phoneInput.value)) {
            errorDiv.textContent = 'Please enter a valid phone number';
        } else {
            errorDiv.textContent = '';
        }
    });
}

// Chat Interface
export function initChat() {
    const form = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    const messageList = document.getElementById('messageList');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (messageInput.value.trim()) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            messageDiv.textContent = messageInput.value;
            messageList.appendChild(messageDiv);
            messageInput.value = '';
        }
    });
}
