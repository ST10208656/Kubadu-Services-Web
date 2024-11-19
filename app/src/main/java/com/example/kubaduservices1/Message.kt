package com.example.kubaduservices1

import com.google.firebase.Timestamp

data class Message(
    val userID: String = "",
    val message: String = "",
    val name: String = "",
    val timestamp: com.google.firebase.Timestamp? = null
) {
    fun getFormattedTime(): String {
        return timestamp?.let { ts ->
            val sdf = java.text.SimpleDateFormat("HH:mm", java.util.Locale.getDefault())
            sdf.format(ts.toDate())
        } ?: ""
    }
}
