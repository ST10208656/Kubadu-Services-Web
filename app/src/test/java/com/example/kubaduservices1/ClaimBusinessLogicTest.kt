package com.example.kubaduservices1

import org.junit.Test
import org.junit.Before
import org.junit.Assert.*

class ClaimBusinessLogicTest {
    private lateinit var claims: Claims
    private val testClaim1 = Claim(
        claimType = "Funeral",
        claimAmount = "5000.00",
        status = "Pending",
        claimId = "1"
    )
    private val testClaim2 = Claim(
        claimType = "Medical",
        claimAmount = "3000.00",
        status = "Approved",
        claimId = "2"
    )

    @Before
    fun setup() {
        claims = Claims()
    }

    @Test
    fun testAddClaim() {
        claims.addClaim(testClaim1)
        val claimsList = claims.getClaimsList()
        assertEquals(1, claimsList.size)
        assertEquals(testClaim1, claimsList[0])
    }

    @Test
    fun testRemoveClaim() {
        claims.addClaim(testClaim1)
        claims.removeClaim(testClaim1)
        val claimsList = claims.getClaimsList()
        assertTrue(claimsList.isEmpty())
    }

    @Test
    fun testGetClaimsListEmpty() {
        val claimsList = claims.getClaimsList()
        assertTrue(claimsList.isEmpty())
    }

    @Test
    fun testGetClaimsListMultipleClaims() {
        claims.addClaim(testClaim1)
        claims.addClaim(testClaim2)
        val claimsList = claims.getClaimsList()
        assertEquals(2, claimsList.size)
        assertTrue(claimsList.contains(testClaim1))
        assertTrue(claimsList.contains(testClaim2))
    }

    @Test
    fun testGetTotalClaimAmount() {
        claims.addClaim(testClaim1)
        claims.addClaim(testClaim2)
        val expectedTotal = 8000.00 // 5000.00 + 3000.00
        assertEquals(expectedTotal, claims.getTotalClaimAmount(), 0.01)
    }

    @Test
    fun testGetTotalClaimAmountEmptyList() {
        assertEquals(0.0, claims.getTotalClaimAmount(), 0.01)
    }

    @Test
    fun testClaimDataClass() {
        val claim = Claim(
            claimType = "Test",
            claimAmount = "1000.00",
            status = "Pending",
            claimId = "test123"
        )
        
        assertEquals("Test", claim.claimType)
        assertEquals("1000.00", claim.claimAmount)
        assertEquals("Pending", claim.status)
        assertEquals("test123", claim.claimId)
    }

    @Test
    fun testClaimEquality() {
        val claim1 = Claim("Test", "1000.00", "Pending", "1")
        val claim2 = Claim("Test", "1000.00", "Pending", "1")
        val claim3 = Claim("Different", "2000.00", "Approved", "2")

        assertEquals(claim1, claim2)
        assertNotEquals(claim1, claim3)
    }
}
