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

            // Check each field individually and show specific error messages
            if (!isValidName(name)) {
                Toast.makeText(this, "Name cannot be empty", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (!isValidName(surname)) {
                Toast.makeText(this, "Surname cannot be empty", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (!Validation.isValidEmail(email)) {
                Toast.makeText(this, "Please enter a valid email address (e.g., user@example.com)", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (!Validation.isValidPassword(password)) {
                Toast.makeText(this, "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Register the user with Firebase Authentication
            auth.createUserWithEmailAndPassword(email, password)
                .addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        // Get the user ID
                        val userId = auth.currentUser?.uid

                        // Store the user information in Firestore
                        val user = hashMapOf(
                            "UserId" to userId,
                            "Name" to name,
                            "Surname" to surname,
                            "Email" to email
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
