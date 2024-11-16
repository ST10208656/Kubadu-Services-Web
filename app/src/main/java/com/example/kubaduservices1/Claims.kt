package com.example.kubaduservices1

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage
import com.google.firebase.storage.StorageReference

class Claims : Fragment() {
    private lateinit var hintTextView: TextView
    private lateinit var submitButton: Button
    private lateinit var backButton: Button
    private lateinit var attachButton: Button
    private lateinit var editTextAmount: EditText
    private lateinit var editTextDescription: EditText
    private lateinit var editTextClaimType: EditText
    private val firestore: FirebaseFirestore by lazy { FirebaseFirestore.getInstance() }
    private val storage: FirebaseStorage by lazy { FirebaseStorage.getInstance() }
    private var deathCertificateUri: Uri? = null
    private lateinit var userId: String

    private val claims = mutableListOf<Claim>()

    private val pickImageLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            result.data?.data?.let { uri ->
                deathCertificateUri = uri
                submitButton.isEnabled = true
            }
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_claims, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Initialize views
        hintTextView = view.findViewById(R.id.hintTextView)
        submitButton = view.findViewById(R.id.submitButton)
        backButton = view.findViewById(R.id.backButton)
        attachButton = view.findViewById(R.id.attachButton)
        editTextAmount = view.findViewById(R.id.editTextAmount)
        editTextDescription = view.findViewById(R.id.editTextDescription)
        editTextClaimType = view.findViewById(R.id.editTextClaimType)

        // Get current user ID
        userId = FirebaseAuth.getInstance().currentUser?.uid ?: ""

        // Set click listeners
        attachButton.setOnClickListener {
            openFilePicker()
        }

        submitButton.setOnClickListener {
            if (validateInputs()) {
                uploadDeathCertificate()
            }
        }

        backButton.setOnClickListener {
            requireActivity().supportFragmentManager.popBackStack()
        }

        // Initially disable submit button
        submitButton.isEnabled = false
    }

    private fun openFilePicker() {
        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
            type = "image/*"
        }
        pickImageLauncher.launch(intent)
    }

    private fun validateInputs(): Boolean {
        val amount = editTextAmount.text.toString()
        val description = editTextDescription.text.toString()
        val claimType = editTextClaimType.text.toString()

        if (amount.isEmpty() || description.isEmpty() || claimType.isEmpty() || deathCertificateUri == null) {
            Toast.makeText(requireContext(), "Please fill all fields and attach a death certificate", Toast.LENGTH_SHORT).show()
            return false
        }
        return true
    }

    private fun uploadDeathCertificate() {
        deathCertificateUri?.let { uri ->
            val storageRef: StorageReference = storage.reference
            val certificateRef = storageRef.child("death_certificates/$userId/${System.currentTimeMillis()}")

            certificateRef.putFile(uri)
                .addOnSuccessListener {
                    certificateRef.downloadUrl.addOnSuccessListener { downloadUrl ->
                        saveClaim(downloadUrl.toString())
                    }
                }
                .addOnFailureListener { e ->
                    Toast.makeText(requireContext(), "Failed to upload certificate: ${e.message}", Toast.LENGTH_SHORT).show()
                }
        }
    }

    private fun saveClaim(certificateUrl: String) {
        val claimData = hashMapOf(
            "claimType" to editTextClaimType.text.toString(),
            "amount" to editTextAmount.text.toString(),
            "description" to editTextDescription.text.toString(),
            "certificateUrl" to certificateUrl,
            "status" to "Pending",
            "timestamp" to System.currentTimeMillis()
        )

        firestore.collection("users").document(userId)
            .collection("claims").add(claimData)
            .addOnSuccessListener {
                Toast.makeText(requireContext(), "Claim submitted successfully", Toast.LENGTH_SHORT).show()
                requireActivity().supportFragmentManager.popBackStack()
            }
            .addOnFailureListener { e ->
                Toast.makeText(requireContext(), "Failed to save claim: ${e.message}", Toast.LENGTH_SHORT).show()
            }
    }

    fun addClaim(claim: Claim) {
        claims.add(claim)
    }

    fun removeClaim(claim: Claim) {
        claims.remove(claim)
    }

    fun getClaimsList(): List<Claim> {
        return claims.toList()
    }

    fun getTotalClaimAmount(): Double {
        return claims.sumOf { it.claimAmount.toDouble() }
    }
}
