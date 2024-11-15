// Form Handling Functions
export const forms = {
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    },

    validatePassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return re.test(password);
    },

    validateIDNumber(id) {
        // South African ID number validation (13 digits)
        return /^\d{13}$/.test(id);
    },

    validateRequiredFields(formData) {
        for (let [key, value] of formData.entries()) {
            if (!value.trim()) {
                return { isValid: false, error: `${key} is required` };
            }
        }
        return { isValid: true };
    },

    getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    }
};
