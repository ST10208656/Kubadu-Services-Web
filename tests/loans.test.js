import { loans } from '../public_html/js/loans';

describe('Loans Module', () => {
    describe('calculateLoanAmount', () => {
        test('calculates correct monthly payment and total amount', () => {
            const result = loans.calculateLoanAmount(10000, 15, 12);
            
            // Monthly payment should be around R902.58 for R10,000 at 15% for 12 months
            expect(result.monthlyPayment).toBeCloseTo(902.58, 2);
            // Total amount should be around R10,831.00
            expect(result.totalAmount).toBeCloseTo(10831.00, 2);
        });

        test('handles invalid inputs', () => {
            expect(() => loans.calculateLoanAmount(-1000, 15, 12)).toThrow('Invalid loan amount');
            expect(() => loans.calculateLoanAmount(1000, 15, 0)).toThrow('Invalid loan term');
            expect(() => loans.calculateLoanAmount(1000, -5, 12)).toThrow('Invalid interest rate');
        });
    });

    describe('validateLoanApplication', () => {
        test('validates loan amount within limits', () => {
            // Test with valid amount (R10,000)
            expect(loans.validateLoanApplication({
                amount: 10000,
                term: 12,
                monthlyIncome: 5000
            }).isValid).toBe(true);

            // Test with amount too high (R100,000)
            expect(loans.validateLoanApplication({
                amount: 100000,
                term: 12,
                monthlyIncome: 5000
            }).isValid).toBe(false);
        });

        test('validates loan term within limits', () => {
            // Test with valid term (12 months)
            expect(loans.validateLoanApplication({
                amount: 10000,
                term: 12,
                monthlyIncome: 5000
            }).isValid).toBe(true);

            // Test with term too long (61 months)
            expect(loans.validateLoanApplication({
                amount: 10000,
                term: 61,
                monthlyIncome: 5000
            }).isValid).toBe(false);
        });

        test('validates monthly payment against income', () => {
            // Monthly payment would be R902.58 for R10,000 at 15% for 12 months
            // Test with sufficient income (R3000, payment is ~30% of income)
            expect(loans.validateLoanApplication({
                amount: 10000,
                term: 12,
                monthlyIncome: 3000
            }).isValid).toBe(true);
            
            // Test with insufficient income (R2000, payment would be >40% of income)
            expect(loans.validateLoanApplication({
                amount: 10000,
                term: 12,
                monthlyIncome: 2000
            }).isValid).toBe(false);
        });
    });

    describe('formatCurrency', () => {
        test('formats currency correctly for ZAR', () => {
            const formatted1 = loans.formatCurrency(1234.56);
            const formatted2 = loans.formatCurrency(1000000);
            const formatted3 = loans.formatCurrency(0);

            // Remove any non-breaking spaces and normalize spaces
            const normalize = (str) => str.replace(/\s/g, ' ');

            expect(normalize(formatted1)).toBe('R 1,234.56');
            expect(normalize(formatted2)).toBe('R 1,000,000.00');
            expect(normalize(formatted3)).toBe('R 0.00');
        });
    });

    describe('getLoanStatus', () => {
        beforeEach(() => {
            // Mock current date to 2024-01-15
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2024-01-15'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        test('returns PAID for paid loans', () => {
            const loan = {
                dueDate: '2024-02-15',
                isPaid: true
            };

            expect(loans.getLoanStatus(loan)).toBe('PAID');
        });

        test('returns ACTIVE for current loans', () => {
            const loan = {
                dueDate: '2024-02-15',
                isPaid: false
            };

            expect(loans.getLoanStatus(loan)).toBe('ACTIVE');
        });

        test('returns OVERDUE with days for overdue loans', () => {
            const loan = {
                dueDate: '2024-01-10',
                isPaid: false
            };

            expect(loans.getLoanStatus(loan)).toBe('OVERDUE (5 days)');
        });
    });
});
