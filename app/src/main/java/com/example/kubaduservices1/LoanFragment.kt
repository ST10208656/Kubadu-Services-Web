package com.example.kubaduservices1

import android.annotation.SuppressLint
import android.app.AlertDialog
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.widget.addTextChangedListener
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage
import com.google.firebase.storage.StorageReference

class LoanFragment : Fragment() {
    private val db = FirebaseFirestore.getInstance()
    private val firebaseAuth = FirebaseAuth.getInstance()

    private lateinit var loanAmountEditText: EditText
    private lateinit var interestRateTextView: TextView
    private lateinit var applyLoanButton: Button
    private lateinit var loanNotificationTextView: TextView
    private lateinit var uploadDocumentsButton: Button
    private lateinit var bankSpinner: Spinner
    private lateinit var loanTypeSpinner: Spinner
    private lateinit var paymentMethodSpinner: Spinner
    private lateinit var accountNumberEditText: EditText
    private lateinit var cellphoneEditText: EditText
    private lateinit var backButton: Button

    private var idDocumentUri: Uri? = null
    private var proofOfIncomeUri: Uri? = null
    private var proofOfResidenceUri: Uri? = null

    private companion object {
        const val INTEREST_RATE = 0.15 // 15% interest rate
    }

    @SuppressLint("SetTextI18n")
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.loan_fragment, container, false)

        loanAmountEditText = view.findViewById(R.id.loanAmountEditText)
        interestRateTextView = view.findViewById(R.id.interestRateTextView)
        applyLoanButton = view.findViewById(R.id.applyLoanButton)
        loanNotificationTextView = view.findViewById(R.id.loanNotificationTextView)
        uploadDocumentsButton = view.findViewById(R.id.uploadDocumentsButton)
        bankSpinner = view.findViewById(R.id.bankSpinner)
        loanTypeSpinner = view.findViewById(R.id.loanTypeSpinner)
        paymentMethodSpinner = view.findViewById(R.id.paymentMethodSpinner)
        accountNumberEditText = view.findViewById(R.id.accountNumberEditText)
        cellphoneEditText = view.findViewById(R.id.cellphoneEditText)
        backButton = view.findViewById(R.id.backButton)

        // Initially hide all fields
        loanAmountEditText.visibility = View.GONE
        interestRateTextView.visibility = View.GONE
        bankSpinner.visibility = View.GONE
        paymentMethodSpinner.visibility = View.GONE
        accountNumberEditText.visibility = View.GONE
        cellphoneEditText.visibility = View.GONE
        uploadDocumentsButton.visibility = View.GONE

        interestRateTextView.text = getString(R.string.interest_rate_text)

        setupSpinners()
        addTextWatchers()

        uploadDocumentsButton.setOnClickListener {
            showDocumentSelectionDialog()
        }

        applyLoanButton.setOnClickListener {
            val amountText = loanAmountEditText.text.toString()
            val loanAmount = amountText.toDouble()
            val repaymentAmount = loanAmount * (1 + INTEREST_RATE)
            showConfirmationDialog(amountText, repaymentAmount.toString())
        }

        backButton.setOnClickListener {
            findNavController().navigateUp()
        }

        return view
    }

    private fun setupSpinners() {
        val bankOptions = arrayOf("Capitec", "Absa", "Fnb", "Standard Bank", "Nedbank")
        val paymentMethods = arrayOf("Account", "Cash send")
        val loanTypes = arrayOf("Home Loan", "Personal Loan")

        loanTypeSpinner.adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_dropdown_item, loanTypes)
        bankSpinner.adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_dropdown_item, bankOptions)
        paymentMethodSpinner.adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_dropdown_item, paymentMethods)

        // Loan Type selection listener
        loanTypeSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                // Show the amount input field after selecting a loan type
                loanAmountEditText.visibility = View.VISIBLE
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        // Amount input listener
        loanAmountEditText.addTextChangedListener {
            // Show the bank spinner once the amount is filled
            if (loanAmountEditText.text.toString().isNotEmpty()) {
                bankSpinner.visibility = View.VISIBLE
            }
        }

        // Bank selection listener
        bankSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                // Show the payment method spinner after selecting a bank
                paymentMethodSpinner.visibility = View.VISIBLE
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        // Payment method selection listener
        paymentMethodSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                // Show the relevant input fields based on payment method
                when (position) {
                    0 -> { // Account
                        accountNumberEditText.visibility = View.VISIBLE
                        cellphoneEditText.visibility = View.GONE
                    }
                    1 -> { // Cash send
                        accountNumberEditText.visibility = View.GONE
                        cellphoneEditText.visibility = View.VISIBLE
                    }
                }
                // Show the upload documents button after selecting a payment method
                uploadDocumentsButton.visibility = View.VISIBLE
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }
    }

    private fun addTextWatchers() {
        loanAmountEditText.addTextChangedListener { checkInputs() }
        accountNumberEditText.addTextChangedListener { checkInputs() }
        cellphoneEditText.addTextChangedListener { checkInputs() }
    }

    private fun checkInputs() {
        val amountFilled = loanAmountEditText.text.toString().isNotEmpty()
        val bankSelected = bankSpinner.selectedItem != null
        val paymentMethodSelected = paymentMethodSpinner.selectedItem != null
        val accountFilled = if (paymentMethodSpinner.selectedItem == "Account") accountNumberEditText.text.toString().isNotEmpty() else true
        val cellphoneFilled = if (paymentMethodSpinner.selectedItem == "Cash send") cellphoneEditText.text.toString().isNotEmpty() else true
        val documentsUploaded = idDocumentUri != null && proofOfIncomeUri != null && proofOfResidenceUri != null

        applyLoanButton.isEnabled = amountFilled && bankSelected && paymentMethodSelected && accountFilled && cellphoneFilled && documentsUploaded
    }

    private fun showDocumentSelectionDialog() {
        val documentOptions = arrayOf("Select ID Document", "Select Proof of Income", "Select Proof of Residence")

        AlertDialog.Builder(requireContext())
            .setTitle("Select Document")
            .setItems(documentOptions) { _, which ->
                when (which) {
                    0 -> selectIdDocument()
                    1 -> selectProofOfIncome()
                    2 -> selectProofOfResidence()
                }
            }
            .show()
    }

    private fun selectIdDocument() {
        idPicker.launch(arrayOf("*/*"))
    }

    private fun selectProofOfIncome() {
        proofOfIncomePicker.launch(arrayOf("*/*"))
    }

    private fun selectProofOfResidence() {
        proofOfResidencePicker.launch(arrayOf("*/*"))
    }

    private val idPicker = registerForActivityResult(ActivityResultContracts.OpenDocument()) { uri: Uri? ->
        uri?.let {
            idDocumentUri = it
            checkInputs()
        }
    }

    private val proofOfIncomePicker = registerForActivityResult(ActivityResultContracts.OpenDocument()) { uri: Uri? ->
        uri?.let {
            proofOfIncomeUri = it
            checkInputs()
        }
    }

    private val proofOfResidencePicker = registerForActivityResult(ActivityResultContracts.OpenDocument()) { uri: Uri? ->
        uri?.let {
            proofOfResidenceUri = it
            checkInputs()
        }
    }

    private fun showConfirmationDialog(amount: String, repaymentAmount: String) {
        AlertDialog.Builder(requireContext())
            .setTitle("Confirm Loan Application")
            .setMessage("You are applying for a loan of R$amount\nTotal repayment amount: R$repaymentAmount")
            .setPositiveButton("Confirm") { _, _ -> submitLoanApplication() }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun submitLoanApplication() {
        val userId = firebaseAuth.currentUser?.uid ?: return

        val loanRequest = hashMapOf(
            "userId" to userId,
            "loanAmount" to loanAmountEditText.text.toString().toDouble(),
            "loanType" to loanTypeSpinner.selectedItem.toString(),
            "paymentMethod" to paymentMethodSpinner.selectedItem.toString(),
            "bank" to bankSpinner.selectedItem.toString(),
            "accountNumber" to accountNumberEditText.text.toString(),
            "cellphone" to cellphoneEditText.text.toString()
        )

        // Store the loan request in Firestore
        db.collection("Requests")
            .add(loanRequest)
            .addOnSuccessListener { documentReference ->
                // Upload documents to Firebase Storage
                uploadDocuments(documentReference.id)
                Toast.makeText(requireContext(), "Loan application submitted successfully!", Toast.LENGTH_SHORT).show()

                // Clear input fields after submission
                clearInputFields()
            }
            .addOnFailureListener { e ->
                Toast.makeText(requireContext(), "Error submitting loan application: ${e.message}", Toast.LENGTH_SHORT).show()
            }
    }

    private fun uploadDocuments(loanRequestId: String) {
        val storageRef = FirebaseStorage.getInstance().reference.child("loan_requests/$loanRequestId")

        // Upload ID document
        idDocumentUri?.let { uploadFile(it, storageRef.child("id_document")) }
        // Upload proof of income
        proofOfIncomeUri?.let { uploadFile(it, storageRef.child("proof_of_income")) }
        // Upload proof of residence
        proofOfResidenceUri?.let { uploadFile(it, storageRef.child("proof_of_residence")) }
    }

    private fun uploadFile(fileUri: Uri, fileReference: StorageReference) {
        fileReference.putFile(fileUri)
            .addOnSuccessListener {
                // Document uploaded successfully
            }
            .addOnFailureListener { e ->
                Toast.makeText(requireContext(), "Error uploading document: ${e.message}", Toast.LENGTH_SHORT).show()
            }
    }
    // Function to clear input fields
    private fun clearInputFields() {
        loanAmountEditText.text.clear()
        loanTypeSpinner.setSelection(0) // Reset to first item
        bankSpinner.setSelection(0) // Reset to first item
        paymentMethodSpinner.setSelection(0) // Reset to first item
        accountNumberEditText.text.clear()
        cellphoneEditText.text.clear()

        // Reset document URIs
        idDocumentUri = null
        proofOfIncomeUri = null
        proofOfResidenceUri = null

        // Hide fields again if necessary
        loanAmountEditText.visibility = View.GONE
        bankSpinner.visibility = View.GONE
        paymentMethodSpinner.visibility = View.GONE
        accountNumberEditText.visibility = View.GONE
        cellphoneEditText.visibility = View.GONE
        uploadDocumentsButton.visibility = View.GONE
}
}
