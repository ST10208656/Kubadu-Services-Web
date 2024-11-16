package com.example.kubaduservices1

import android.app.AlertDialog
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.google.android.material.textfield.TextInputEditText
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage

class FuneralPolicyFragment : Fragment() {

    private lateinit var policyTypeDropdown: Spinner
    private lateinit var policyDetailsTextView: TextView
    private lateinit var beneficiaryCountSpinner: Spinner
    private lateinit var beneficiaryLayout: LinearLayout
    private lateinit var applyPolicyButton: Button
    private lateinit var backButton: Button

    private val db = FirebaseFirestore.getInstance()
    private val firebaseAuth = FirebaseAuth.getInstance()
    private val storage = FirebaseStorage.getInstance()

    private val beneficiaryNames = mutableListOf<String>()
    private val beneficiaryDocumentUris = mutableListOf<Uri?>()

    // Registering the document picker activity result launcher
    private val documentPickerLauncher =
        registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
            // Handle the returned URI
            uri?.let {
                // Update the corresponding document URI
                val index = beneficiaryNames.size - beneficiaryDocumentUris.size // Adjust the index based on the current size
                if (index in beneficiaryDocumentUris.indices) {
                    beneficiaryDocumentUris[index] = it
                }
            }
        }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        val view = inflater.inflate(R.layout.funeral_policy_fragment, container, false)

        policyTypeDropdown = view.findViewById(R.id.policyTypeSpinner)
        policyDetailsTextView = view.findViewById(R.id.policyDetailsTextView)
        beneficiaryCountSpinner = view.findViewById(R.id.beneficiaryCountSpinner)
        beneficiaryLayout = view.findViewById(R.id.beneficiaryLayout)
        applyPolicyButton = view.findViewById(R.id.applyPolicyButton)
        backButton = view.findViewById(R.id.backButton)

        setupPolicyTypeDropdown()
        setupBeneficiaryCountSpinner()

        applyPolicyButton.setOnClickListener {
            // Show confirmation dialog before proceeding with the application
            AlertDialog.Builder(requireContext()).apply {
                setTitle("Confirm Application")
                setMessage("Are you sure you want to submit this funeral policy request?")
                setPositiveButton("Confirm") { dialog, _ ->
                    applyForPolicy() // Proceed with the application if confirmed
                    dialog.dismiss()
                }
                setNegativeButton("Cancel") { dialog, _ ->
                    dialog.dismiss() // Close the dialog if canceled
                }
                create()
                show()
            }
        }

        backButton.setOnClickListener {
            findNavController().navigateUp()
        }

        return view
    }

    private fun setupPolicyTypeDropdown() {
        val policyTypes = resources.getStringArray(R.array.policy_types)
        val adapter =
            ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, policyTypes)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        policyTypeDropdown.adapter = adapter

        policyTypeDropdown.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(
                parent: AdapterView<*>,
                view: View?,
                position: Int,
                id: Long
            ) {
                policyDetailsTextView.text = when (policyTypes[position]) {
                    "Basic Funeral Policy" -> resources.getStringArray(R.array.funeral_policy_details_basic)
                        .joinToString("\n")

                    "Premium Funeral Policy" -> resources.getStringArray(R.array.funeral_policy_details_premium)
                        .joinToString("\n")

                    else -> ""
                }
            }

            override fun onNothingSelected(parent: AdapterView<*>) {
                // Do nothing
            }
        }
    }

    private fun setupBeneficiaryCountSpinner() {
        val options = (1..5).map { it.toString() }.toTypedArray()
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, options)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        beneficiaryCountSpinner.adapter = adapter

        beneficiaryCountSpinner.onItemSelectedListener =
            object : AdapterView.OnItemSelectedListener {
                override fun onItemSelected(
                    parent: AdapterView<*>,
                    view: View?,
                    position: Int,
                    id: Long
                ) {
                    updateBeneficiaryFields(options[position].toInt())
                }

                override fun onNothingSelected(parent: AdapterView<*>) {}
            }
    }

    private fun updateBeneficiaryFields(count: Int) {
        beneficiaryLayout.removeAllViews()
        beneficiaryNames.clear()
        beneficiaryDocumentUris.clear()

        for (i in 1..count) {
            val beneficiaryNameInput = TextInputEditText(requireContext()).apply {
                id = View.generateViewId()
                hint = "Beneficiary $i Name"
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
            }

            val documentButton = Button(requireContext()).apply {
                text = "Select Document for Beneficiary $i"
                setOnClickListener {
                    selectDocument()
                }
            }

            beneficiaryLayout.addView(beneficiaryNameInput)
            beneficiaryLayout.addView(documentButton)

            beneficiaryNames.add("") // Initialize with empty string
            beneficiaryDocumentUris.add(null) // Initialize with null
        }
    }

    private fun selectDocument() {
        // Launch a document picker intent (you may need to add permission checks)
        documentPickerLauncher.launch("*/*") // Allow any type of document
    }

    private fun applyForPolicy() {
        val currentUser = firebaseAuth.currentUser

        if (currentUser != null) {
            val selectedPolicyType = policyTypeDropdown.selectedItem.toString()
            val policyDetails = policyDetailsTextView.text.toString()

            // Create a funeral policy request
            val funeralPolicyRequest = hashMapOf(
                "policyType" to selectedPolicyType,
                "policyDetails" to policyDetails,
                "status" to "Pending"
            )

            // Add the request under a subcollection "funeralPolicies" in the user's document
            db.collection("Requests")
                .add(funeralPolicyRequest)
                .addOnSuccessListener { documentReference ->
                    uploadBeneficiaryDocuments(documentReference.id)
                    Toast.makeText(
                        requireContext(),
                        "Funeral policy request submitted successfully!",
                        Toast.LENGTH_LONG
                    ).show()
                }
                .addOnFailureListener { e ->
                    Toast.makeText(
                        requireContext(),
                        "Policy request failed: ${e.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
        } else {
            Toast.makeText(
                requireContext(),
                "User not authenticated. Please login to apply for a policy.",
                Toast.LENGTH_SHORT
            ).show()
        }
    }

    private fun uploadBeneficiaryDocuments(requestId: String) {
        val userId = firebaseAuth.currentUser?.uid ?: return // Get user ID

        // Upload each beneficiary document
        for (i in beneficiaryNames.indices) {
            val name = beneficiaryNames[i]
            val documentUri = beneficiaryDocumentUris[i]

            if (name.isNotBlank() && documentUri != null) {
                val path =
                    "users/$userId/funeralPolicies/$requestId/Beneficiary_${i + 1}_${documentUri.lastPathSegment}"
                storage.reference.child(path).putFile(documentUri)
                    .addOnSuccessListener {
                        storage.reference.child(path).downloadUrl.addOnSuccessListener { downloadUrl ->
                            saveBeneficiaryToFirestore(
                                name,
                                downloadUrl.toString(),
                                requestId
                            )
                        }
                    }
                    .addOnFailureListener { e ->
                        Toast.makeText(
                            requireContext(),
                            "Failed to upload document for Beneficiary ${i + 1}: ${e.message}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
            }
        }
    }

    private fun saveBeneficiaryToFirestore(name: String, documentUrl: String, requestId: String) {
        val beneficiaryData = hashMapOf(
            "name" to name,
            "documentUrl" to documentUrl
        )

        db.collection("Requests")
            .document(requestId)
            .collection("beneficiaries")
            .add(beneficiaryData)
            .addOnSuccessListener {
                // Optionally handle success
            }
            .addOnFailureListener { e ->
                Toast.makeText(
                    requireContext(),
                    "Failed to save beneficiary data: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            }
    }
}
