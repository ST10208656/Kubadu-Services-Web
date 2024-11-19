package com.example.kubaduservices1

import org.junit.Test
import org.junit.Assert.*

class RequestTest {
    
    @Test
    fun testRequestDefaultValues() {
        val request = Request()
        assertEquals("", request.requestId)
        assertEquals("Unknown", request.requestCategory)
        assertEquals("Pending", request.requestStatus)
    }

    @Test
    fun testRequestCustomValues() {
        val request = Request(
            requestId = "123",
            requestCategory = "Loan",
            requestStatus = "Approved"
        )
        assertEquals("123", request.requestId)
        assertEquals("Loan", request.requestCategory)
        assertEquals("Approved", request.requestStatus)
    }

    @Test
    fun testRequestEquality() {
        val request1 = Request("123", "Loan", "Pending")
        val request2 = Request("123", "Loan", "Pending")
        val request3 = Request("456", "Policy", "Approved")

        assertEquals(request1, request2)
        assertNotEquals(request1, request3)
    }

    @Test
    fun testRequestCopy() {
        val originalRequest = Request("123", "Loan", "Pending")
        val copiedRequest = originalRequest.copy(requestStatus = "Approved")

        assertEquals(originalRequest.requestId, copiedRequest.requestId)
        assertEquals(originalRequest.requestCategory, copiedRequest.requestCategory)
        assertNotEquals(originalRequest.requestStatus, copiedRequest.requestStatus)
        assertEquals("Approved", copiedRequest.requestStatus)
    }

    @Test
    fun testRequestToString() {
        val request = Request("123", "Loan", "Pending")
        val toString = request.toString()
        
        assertTrue(toString.contains("123"))
        assertTrue(toString.contains("Loan"))
        assertTrue(toString.contains("Pending"))
    }

    @Test
    fun testRequestComponentFunctions() {
        val request = Request("123", "Loan", "Pending")
        
        assertEquals("123", request.component1())
        assertEquals("Loan", request.component2())
        assertEquals("Pending", request.component3())
    }
}
