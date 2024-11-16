package com.example.kubaduservices1

import org.junit.Test
import org.junit.Assert.*

class RegisterActivityTest {
    
    @Test
    fun testValidEmail() {
        assertTrue(RegisterActivity.Validation.isValidEmail("test@example.com"))
        assertTrue(RegisterActivity.Validation.isValidEmail("user.name@domain.co.uk"))
        assertFalse(RegisterActivity.Validation.isValidEmail("invalid.email"))
        assertFalse(RegisterActivity.Validation.isValidEmail(""))
    }

    @Test
    fun testValidPassword() {
        assertTrue(RegisterActivity.Validation.isValidPassword("Password123!"))
        assertFalse(RegisterActivity.Validation.isValidPassword("weak"))
        assertFalse(RegisterActivity.Validation.isValidPassword(""))
    }

    @Test
    fun testValidPhoneNumber() {
        assertTrue(RegisterActivity.Validation.isValidPhoneNumber("0123456789"))
        assertFalse(RegisterActivity.Validation.isValidPhoneNumber("123"))
        assertFalse(RegisterActivity.Validation.isValidPhoneNumber(""))
    }
}
