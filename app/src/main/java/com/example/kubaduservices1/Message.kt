package com.example.kubaduservices1

import com.google.firebase.Timestamp

data class Message(
    val userID: String = "",
    val message: String = "",
    val name: String = "",
    val timestamp: Timestamp? = null
)
