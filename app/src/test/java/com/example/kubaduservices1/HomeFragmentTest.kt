package com.example.kubaduservices1

import org.junit.Test
import org.junit.Assert.*
import org.junit.Before

class HomeFragmentTest {
    
    private lateinit var homeFragment: HomeFragment

    @Before
    fun setup() {
        homeFragment = com.example.kubaduservices1.HomeFragment()
    }

    @Test
    fun testWalletBalanceFormat() {
        val balance = 100.0
        val formattedBalance = homeFragment.formatBalance(balance)
        assertEquals("R100.00", formattedBalance)
    }

    @Test
    fun testZeroWalletBalance() {
        val balance = 0.0
        val formattedBalance = homeFragment.formatBalance(balance)
        assertEquals("R0.00", formattedBalance)
    }

    @Test
    fun testNegativeWalletBalance() {
        val balance = -50.0
        val formattedBalance = homeFragment.formatBalance(balance)
        assertEquals("-R50.00", formattedBalance)
    }

    @Test
    fun testFormatUserName() {
        val firstName = "John"
        val lastName = "Doe"
        val fullName = homeFragment.formatUserName(firstName, lastName)
        assertEquals("John Doe", fullName)
    }
}
