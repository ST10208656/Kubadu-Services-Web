package com.example.kubaduservices1

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import com.squareup.picasso.Picasso
import com.squareup.picasso.OkHttp3Downloader

class KubaduApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // Initialize Picasso with custom configuration
        val picasso = Picasso.Builder(this)
            .downloader(OkHttp3Downloader(this))
            .build()
        
        // Set the singleton instance
        Picasso.setSingletonInstance(picasso)
        
        // Create notification channel for Android O and higher
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channelId = "kubadu_channel"
            val channelName = "Kubadu Notifications"
            val importance = NotificationManager.IMPORTANCE_DEFAULT
            val channel = NotificationChannel(channelId, channelName, importance)
            
            // Register the channel with the system
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
}
