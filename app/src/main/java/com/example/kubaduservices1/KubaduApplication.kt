package com.example.kubaduservices1

import android.app.Application
import com.google.firebase.FirebaseApp

class KubaduApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        FirebaseApp.initializeApp(this)
    }
}
