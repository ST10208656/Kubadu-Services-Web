package com.example.kubaduservices1

import org.junit.Test
import org.junit.Assert.*
import org.junit.Before

class LoginActivityTest {
    
    companion object {
        private val VALID_EMAIL = "test@example.com"
        private val VALID_PASSWORD = "Password123!"
        private val INVALID_EMAIL = "invalid.email"
        private val INVALID_PASSWORD = "weak"
    }

    @Test
    fun testEmailValidation() {
        assertTrue(LoginActivity.Validation.isValidEmail(VALID_EMAIL))
        assertFalse(LoginActivity.Validation.isValidEmail(INVALID_EMAIL))
        assertFalse(LoginActivity.Validation.isValidEmail(""))
    }

    @Test
    fun testPasswordValidation() {
        assertTrue(LoginActivity.Validation.isValidPassword(VALID_PASSWORD))
        assertFalse(LoginActivity.Validation.isValidPassword(INVALID_PASSWORD))
        assertFalse(LoginActivity.Validation.isValidPassword(""))
    }

    @Test
    fun testCredentialsValidation() {
        assertTrue(LoginActivity.Validation.areCredentialsValid(VALID_EMAIL, VALID_PASSWORD))
        assertFalse(LoginActivity.Validation.areCredentialsValid(INVALID_EMAIL, VALID_PASSWORD))
        assertFalse(LoginActivity.Validation.areCredentialsValid(VALID_EMAIL, INVALID_PASSWORD))
        assertFalse(LoginActivity.Validation.areCredentialsValid("", ""))
    }
}
