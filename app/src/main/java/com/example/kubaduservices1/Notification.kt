package com.example.kubaduservices1

import com.google.firebase.Timestamp

data class Notification(
    val message: String = "",
    val timestamp: Timestamp = Timestamp.now()
)
