package com.example.kubaduservices1


import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage
import com.squareup.picasso.Picasso

class ProfileFragment : Fragment() {

    private lateinit var nameTextView: TextView
    private lateinit var emailTextView: TextView
    private lateinit var profileImageView: ImageView
    private lateinit var changeProfilePictureButton: Button
    private lateinit var backButton: Button

    private val db = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()
    private val storage = FirebaseStorage.getInstance()

    // Use this launcher to get the image from the gallery
    private val getImageLauncher =
        registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
            uri?.let { uploadImageToFirebase(it) }
        }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_profile, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        nameTextView = view.findViewById(R.id.nameTextView)
        emailTextView = view.findViewById(R.id.emailTextView)
        profileImageView = view.findViewById(R.id.profileImageView)
        changeProfilePictureButton = view.findViewById(R.id.changeProfilePictureButton)
        backButton = view.findViewById(R.id.backButton)

        loadUserProfile()

        changeProfilePictureButton.setOnClickListener {
            // Open image picker to change profile picture
            openImagePicker()
        }

        backButton.setOnClickListener {
            findNavController().navigateUp()
        }
    }

    private fun loadUserProfile() {
        val userId = auth.currentUser?.uid
        userId?.let {
            db.collection("Customers").document(it).get()
                .addOnSuccessListener { document ->
                    if (document != null) {
                        val fullName = document.getString("Name")
                        val email = document.getString("Email")
                        val profileImageUrl = document.getString("profileImageUrl") // URL of profile image


                        nameTextView.text = fullName ?: "No Name"
                        emailTextView.text = email ?: "No Email"
                        if (profileImageUrl != null) {
                            Picasso.get().load(Uri.parse(profileImageUrl)).into(profileImageView)
                        } else {
                            profileImageView.setImageResource(R.drawable.profile) // Default image
                        }
                    }
                }
                .addOnFailureListener { exception ->
                    Log.e("ProfileFragment", "Failed to load user profile", exception)
                }
        }
    }

    private fun openImagePicker() {
        // Launch the image picker
        getImageLauncher.launch("image/*")
    }

    private fun uploadImageToFirebase(uri: Uri) {
        val userId = auth.currentUser?.uid ?: return
        val profileImageRef = storage.reference.child("profile_images/$userId.jpg")

        profileImageRef.putFile(uri)
            .addOnSuccessListener {
                profileImageRef.downloadUrl.addOnSuccessListener { downloadUrl ->
                    // Update Firestore with the new profile image URL
                    db.collection("Customers").document(userId)
                        .update("profileImageUrl", downloadUrl.toString())
                        .addOnSuccessListener {
                            loadUserProfile() // Reload the profile to show the updated image
                        }
                        .addOnFailureListener { exception ->
                            Log.e("ProfileFragment", "Failed to update Firestore", exception)
                        }
                }
            }
            .addOnFailureListener { exception ->
                Log.e("ProfileFragment", "Failed to upload image", exception)
            }
    }
}
