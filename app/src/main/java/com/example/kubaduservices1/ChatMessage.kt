package com.example.kubaduservices1

import com.google.firebase.Timestamp

data class ChatMessage(
    val userID: String = "",
    val message: String = "",
    val name: String = "",
    val surname: String = "",
    val timestamp: Timestamp = Timestamp.now()
)
