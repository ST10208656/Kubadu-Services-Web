// Loan Management Functions
export const loans = {
    calculateLoanAmount(principal, interestRate, months) {
        // Validate inputs
        if (principal <= 0) {
            throw new Error('Invalid loan amount');
        }
        if (months <= 0) {
            throw new Error('Invalid loan term');
        }
        if (interestRate <= 0) {
            throw new Error('Invalid interest rate');
        }

        const monthlyRate = interestRate / 100 / 12;
        const monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                             (Math.pow(1 + monthlyRate, months) - 1);
        return {
            monthlyPayment: Math.round(monthlyPayment * 100) / 100,
            totalAmount: Math.round(monthlyPayment * months * 100) / 100
        };
    },

    validateLoanApplication(data) {
        const errors = [];
        
        // Validate amount
        if (!data.amount || data.amount <= 0) {
            errors.push('Invalid loan amount');
        }
        
        // Validate term
        if (!data.term || data.term < 3 || data.term > 60) {
            errors.push('Loan term must be between 3 and 60 months');
        }
        
        // Validate income
        if (!data.monthlyIncome || data.monthlyIncome <= 0) {
            errors.push('Invalid monthly income');
        }

        // Check debt-to-income ratio
        if (data.monthlyIncome && data.amount) {
            const { monthlyPayment } = this.calculateLoanAmount(data.amount, 15, data.term);
            if (monthlyPayment > data.monthlyIncome * 0.4) {
                errors.push('Monthly payment exceeds 40% of monthly income');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(amount);
    },

    getLoanStatus(loan) {
        const today = new Date();
        const dueDate = new Date(loan.dueDate);
        
        if (loan.isPaid) {
            return 'PAID';
        }
        
        if (today > dueDate) {
            const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
            return `OVERDUE (${daysLate} days)`;
        }
        
        return 'ACTIVE';
    }
};
