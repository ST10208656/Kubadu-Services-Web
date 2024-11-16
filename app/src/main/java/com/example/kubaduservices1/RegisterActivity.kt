package com.example.kubaduservices1

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore

class RegisterActivity : AppCompatActivity() {

    // Initialize FirebaseAuth and FirebaseFirestore
    lateinit var auth: FirebaseAuth
    lateinit var db: FirebaseFirestore

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        // Initialize Firebase Auth and Firestore
        auth = FirebaseAuth.getInstance()
        db = FirebaseFirestore.getInstance()

        val editTextName = findViewById<EditText>(R.id.editTextName)
        val editTextSurname = findViewById<EditText>(R.id.editTextSurname)
        val editTextEmail = findViewById<EditText>(R.id.editTextEmail)
        val editTextPassword = findViewById<EditText>(R.id.editTextPassword)
        val buttonRegister = findViewById<Button>(R.id.buttonRegister)

        buttonRegister.setOnClickListener {
            val name = editTextName.text.toString().trim()
            val surname = editTextSurname.text.toString().trim()
            val email = editTextEmail.text.toString().trim()
            val password = editTextPassword.text.toString().trim()

            // Check if name, surname, email, and password are valid
            if (isValidName(name) && isValidName(surname) && Validation.isValidEmail(email) && Validation.isValidPassword(password)) {
                // Register the user with Firebase Authentication
                auth.createUserWithEmailAndPassword(email, password)
                    .addOnCompleteListener { task ->
                        if (task.isSuccessful) {
                            // Get the user ID
                            val userId = auth.currentUser?.uid

                            // Store the user information in Firestore
                            val user = hashMapOf(
                                "userId" to userId,
                                "name" to name,
                                "surname" to surname,
                                "email" to email
                            )

                            userId?.let {
                                db.collection("Customers").document(it)
                                    .set(user)
                                    .addOnSuccessListener {
                                        Toast.makeText(this, "Registration successful", Toast.LENGTH_SHORT).show()
                                        // Redirect to LoginActivity
                                        startActivity(Intent(this, LoginActivity::class.java))
                                        finish()
                                    }
                                    .addOnFailureListener { e ->
                                        Toast.makeText(this, "Failed to save user: ${e.message}", Toast.LENGTH_SHORT).show()
                                    }
                            }
                        } else {
                            Toast.makeText(this, "Registration failed: ${task.exception?.message}", Toast.LENGTH_SHORT).show()
                        }
                    }
            } else {
                Toast.makeText(this, "Invalid name, surname, email, or password", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // Function to validate name and surname
    private fun isValidName(name: String): Boolean {
        return name.isNotEmpty()
    }

    companion object Validation {
        private val EMAIL_PATTERN = Regex("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}")
        
        fun isValidEmail(email: String): Boolean {
            return email.matches(EMAIL_PATTERN)
        }

        fun isValidPassword(password: String): Boolean {
            return password.length >= 8 && 
                   password.any { it.isDigit() } && 
                   password.any { it.isUpperCase() } &&
                   password.any { it.isLowerCase() }
        }

        fun isValidPhoneNumber(phoneNumber: String): Boolean {
            return phoneNumber.length == 10 && phoneNumber.all { it.isDigit() }
        }
    }
}
