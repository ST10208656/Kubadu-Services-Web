package com.example.kubaduservices1

import org.junit.Before
import org.junit.Test
import org.junit.Assert.*

class ClaimsTest {
    private lateinit var claims: Claims

    @Before
    fun setUp() {
        claims = Claims()
    }
    
    @Test
    fun testClaimCreation() {
        val claim = com.example.kubaduservices1.Claim(
            claimType = "Test Claim",
            claimAmount = "1000.00",
            status = "Pending",
            claimId = "test123"
        )
        assertEquals("Test Claim", claim.claimType)
        assertEquals("1000.00", claim.claimAmount)
        assertEquals("Pending", claim.status)
        assertEquals("test123", claim.claimId)
    }
    
    @Test
    fun testAddAndGetClaims() {
        assertTrue(claims.getClaimsList().isEmpty())
        
        val claim1 = com.example.kubaduservices1.Claim(
            claimType = "Claim 1",
            claimAmount = "1000.00",
            status = "Pending",
            claimId = "claim1"
        )
        val claim2 = com.example.kubaduservices1.Claim(
            claimType = "Claim 2",
            claimAmount = "2000.00",
            status = "Approved",
            claimId = "claim2"
        )
        
        claims.addClaim(claim1)
        claims.addClaim(claim2)
        
        val claimsList = claims.getClaimsList()
        assertEquals(2, claimsList.size)
        assertTrue(claimsList.contains(claim1))
        assertTrue(claimsList.contains(claim2))
    }
    
    @Test
    fun testRemoveClaim() {
        val claim = com.example.kubaduservices1.Claim(
            claimType = "Test Claim",
            claimAmount = "1000.00",
            status = "Pending",
            claimId = "test123"
        )
        
        claims.addClaim(claim)
        assertTrue(claims.getClaimsList().contains(claim))
        
        claims.removeClaim(claim)
        assertFalse(claims.getClaimsList().contains(claim))
    }
    
    @Test
    fun testTotalClaimAmount() {
        claims.addClaim(com.example.kubaduservices1.Claim(
            claimType = "Claim 1",
            claimAmount = "1000.00",
            status = "Pending",
            claimId = "claim1"
        ))
        claims.addClaim(com.example.kubaduservices1.Claim(
            claimType = "Claim 2",
            claimAmount = "2000.00",
            status = "Approved",
            claimId = "claim2"
        ))
        claims.addClaim(com.example.kubaduservices1.Claim(
            claimType = "Claim 3",
            claimAmount = "3000.00",
            status = "Pending",
            claimId = "claim3"
        ))
        
        assertEquals(6000.00, claims.getTotalClaimAmount(), 0.01)
    }
}
