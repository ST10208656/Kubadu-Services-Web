package com.example.kubaduservices1

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import com.google.firebase.auth.FirebaseAuth

class LoginActivity : AppCompatActivity() {
    private val TAG = "LoginActivity"
    private lateinit var auth: FirebaseAuth

    companion object Validation {
        private val EMAIL_PATTERN = Regex("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}")
        
        fun isValidEmail(email: String): Boolean {
            return email.isNotEmpty() && email.contains("@")
        }

        fun isValidPassword(password: String): Boolean {
            return password.isNotEmpty() && password.length >= 6
        }

        fun areCredentialsValid(email: String, password: String): Boolean {
            return isValidEmail(email) && isValidPassword(password)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        // Initialize Firebase Auth
        auth = FirebaseAuth.getInstance()
        Log.d(TAG, "Firebase Auth initialized")

        // Check if user is already signed in
        val currentUser = auth.currentUser
        if (currentUser != null) {
            Log.d(TAG, "User already signed in: ${currentUser.email}")
            startActivity(Intent(this, ServicesActivity::class.java))
            finish()
            return
        }

        val editTextEmail = findViewById<EditText>(R.id.editTextEmail)
        val editTextPassword = findViewById<EditText>(R.id.editTextPassword)
        val buttonLogin = findViewById<Button>(R.id.buttonLogin)

        buttonLogin.setOnClickListener {
            val email = editTextEmail.text.toString().trim()
            val password = editTextPassword.text.toString().trim()

            Log.d(TAG, "Login attempt with email: $email")

            // Check if email and password are valid
            if (Validation.areCredentialsValid(email, password)) {
                Log.d(TAG, "Credentials validation passed")
                
                // Sign in the user using Firebase Authentication
                auth.signInWithEmailAndPassword(email, password)
                    .addOnCompleteListener { task ->
                        if (task.isSuccessful) {
                            Log.d(TAG, "Login successful")
                            Toast.makeText(this, "Login successful", Toast.LENGTH_SHORT).show()
                            startActivity(Intent(this, ServicesActivity::class.java))
                            finish()
                        } else {
                            val exception = task.exception
                            Log.e(TAG, "Login failed", exception)
                            Toast.makeText(this, "Login failed: ${exception?.message}", Toast.LENGTH_LONG).show()
                        }
                    }
                    .addOnFailureListener { e ->
                        Log.e(TAG, "Firebase authentication failed", e)
                        Toast.makeText(this, "Authentication failed: ${e.message}", Toast.LENGTH_LONG).show()
                    }
            } else {
                Log.w(TAG, "Invalid credentials - Email valid: ${Validation.isValidEmail(email)}, Password valid: ${Validation.isValidPassword(password)}")
                Toast.makeText(this, "Invalid email or password format", Toast.LENGTH_LONG).show()
            }
        }
    }
}