package com.example.kubaduservices1

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore

class SettingsFragment : Fragment() {

    private lateinit var settingsTitle: TextView
    private lateinit var logoutButton: Button
    private lateinit var deleteAccountButton: Button
    private lateinit var backToHomeButton: Button

    private val auth: FirebaseAuth by lazy { FirebaseAuth.getInstance() }
    private val firestore: FirebaseFirestore by lazy { FirebaseFirestore.getInstance() }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_settings, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Initialize views
        settingsTitle = view.findViewById(R.id.settingsTitle)
        logoutButton = view.findViewById(R.id.logoutButton)
        deleteAccountButton = view.findViewById(R.id.deleteAccountButton)
        backToHomeButton = view.findViewById(R.id.backToHomeButton)

        // Set up button listeners
        logoutButton.setOnClickListener {
            auth.signOut()
            // Redirect to login page
            startActivity(Intent(requireContext(), LoginActivity::class.java))
            requireActivity().finish() // Optionally finish current activity
        }

        deleteAccountButton.setOnClickListener {
            confirmAccountDeletion()
        }

        backToHomeButton.setOnClickListener {
            findNavController().navigateUp()
        }
    }

    private fun confirmAccountDeletion() {
        AlertDialog.Builder(requireContext())
            .setTitle("Confirm Deletion")
            .setMessage("Are you sure you want to delete your account? This action cannot be undone.")
            .setPositiveButton("Delete") { dialog, _ ->
                deleteAccount()
                dialog.dismiss()
            }
            .setNegativeButton("Cancel") { dialog, _ -> dialog.dismiss() }
            .show()
    }

    private fun deleteAccount() {
        val user = auth.currentUser
        user?.delete()?.addOnCompleteListener { task ->
            if (task.isSuccessful) {
                // Remove user data from Firestore
                firestore.collection("users").document(user.uid).delete()
                    .addOnCompleteListener { deleteTask ->
                        if (deleteTask.isSuccessful) {
                            // Successfully deleted account and user data
                            Toast.makeText(requireContext(), "Account deleted successfully.", Toast.LENGTH_SHORT).show()
                            // Redirect to registration page
                            startActivity(Intent(requireContext(), RegisterActivity::class.java))
                            requireActivity().finish() // Optionally finish current activity
                        } else {
                            Toast.makeText(requireContext(), "Failed to delete account data.", Toast.LENGTH_SHORT).show()
                        }
                    }
            } else {
                Toast.makeText(requireContext(), "Failed to delete account.", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
