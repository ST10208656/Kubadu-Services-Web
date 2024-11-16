package com.example.kubaduservices1

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.Query

class HomeFragment : Fragment() {

    private lateinit var welcomeTextView: TextView
    private lateinit var notificationsTextView: TextView
    private lateinit var newsTextView: TextView
    private lateinit var loanButton: Button
    private lateinit var funeralPolicyButton: Button
    private lateinit var walletBalanceTextView: TextView
    private lateinit var cardNameTextView: TextView

    private lateinit var firestore: FirebaseFirestore
    private lateinit var auth: FirebaseAuth
    private var notificationsListener: ListenerRegistration? = null
    private var newsListener: ListenerRegistration? = null

    // Add dependency injection method for testing
    internal fun setFirebaseInstances(mockFirestore: FirebaseFirestore, mockAuth: FirebaseAuth) {
        firestore = mockFirestore
        auth = mockAuth
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_home, container, false)

        // Initialize Firebase if not injected
        if (!::firestore.isInitialized) {
            firestore = FirebaseFirestore.getInstance()
        }
        if (!::auth.isInitialized) {
            auth = FirebaseAuth.getInstance()
        }

        // Get references to views
        welcomeTextView = view.findViewById(R.id.welcomeTextView)
        notificationsTextView = view.findViewById(R.id.notificationsTextView)
        newsTextView = view.findViewById(R.id.newsTextView)
        loanButton = view.findViewById(R.id.loanButton)
        funeralPolicyButton = view.findViewById(R.id.funeralPolicyButton)
        walletBalanceTextView = view.findViewById(R.id.wallet_balance)
        cardNameTextView = view.findViewById(R.id.card_name)

        // Set up button navigation
        setupButtonNavigation()

        // Display welcome message with user's name
        displayWelcomeMessage()

        // Load wallet balance
        loadWalletBalance()

        // Listen for real-time updates on notifications and news
        listenForNotifications()
        listenForNews()

        return view
    }

    private fun setupButtonNavigation() {
        loanButton.setOnClickListener {
            try {
                findNavController().navigate(R.id.action_homeFragment_to_loanFragment)
            } catch (e: Exception) {
                Log.e("HomeFragment", "Error navigating to LoanFragment", e)
            }
        }

        funeralPolicyButton.setOnClickListener {
            try {
                findNavController().navigate(R.id.action_homeFragment_to_funeralPolicyFragment)
            } catch (e: Exception) {
                Log.e("HomeFragment", "Error navigating to FuneralPolicyFragment", e)
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        // Remove listeners to prevent memory leaks
        notificationsListener?.remove()
        newsListener?.remove()
    }

    private fun displayWelcomeMessage() {
        val currentUser = auth.currentUser
        currentUser?.let { user ->
            firestore.collection("Customers").document(user.uid).get()
                .addOnSuccessListener { document ->
                    val name = document.getString("name") ?: "User"
                    welcomeTextView.text = "Welcome, $name!"
                }
                .addOnFailureListener {
                    welcomeTextView.text = "Welcome, User!"
                }
        }
    }

    private fun loadWalletBalance() {
        val currentUser = auth.currentUser
        currentUser?.let { user ->
            firestore.collection("Customers").document(user.uid)
                .get()
                .addOnSuccessListener { document ->
                    if (document != null && document.exists()) {
                        val walletBalance = document.getDouble("walletBalance") ?: 0.0
                        val name = document.getString("Name") ?: ""
                        val surname = document.getString("Surname") ?: ""
                        
                        // Update UI
                        walletBalanceTextView.text = formatBalance(walletBalance)
                        cardNameTextView.text = formatUserName(name, surname)
                    } else {
                        Log.e("HomeFragment", "User document not found!")
                        walletBalanceTextView.text = "R0.00"
                        cardNameTextView.text = "Error loading data"
                    }
                }
                .addOnFailureListener { e ->
                    Log.e("HomeFragment", "Error loading wallet balance", e)
                    walletBalanceTextView.text = "R0.00"
                    cardNameTextView.text = "Error loading data"
                }
        }
    }

    private fun listenForNotifications() {
        notificationsListener = firestore.collection("notifications")
            .orderBy("timestamp", Query.Direction.DESCENDING)
            .limit(5) // Limit to last 5 notifications
            .addSnapshotListener { snapshots, error ->
                if (error != null) {
                    Log.e("HomeFragment", "Error listening for notifications", error)
                    notificationsTextView.text = "Error loading notifications"
                    return@addSnapshotListener
                }

                if (snapshots != null && !snapshots.isEmpty) {
                    val notificationsText = StringBuilder()
                    for (doc in snapshots) {
                        try {
                            val notification = doc.toObject(Notification::class.java)
                            val timestamp = notification.timestamp
                            val date = java.text.SimpleDateFormat("MMM dd, HH:mm", java.util.Locale.getDefault())
                                .format(timestamp.toDate())
                            
                            notificationsText.append("• ${notification.message}\n")
                            notificationsText.append("  $date\n\n")
                        } catch (e: Exception) {
                            Log.e("HomeFragment", "Error parsing notification", e)
                        }
                    }
                    notificationsTextView.text = notificationsText.toString().trim()
                } else {
                    notificationsTextView.text = "No notifications"
                }
            }
    }

    private fun listenForNews() {
        newsListener = firestore.collection("News").document("latest")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    newsTextView.text = "Stay tuned for the latest updates."
                    return@addSnapshotListener
                }
                snapshot?.let {
                    val newsText = it.getString("message") ?: "Stay tuned for the latest updates."
                    newsTextView.text = newsText
                }
            }
    }

    fun formatBalance(balance: Double): String {
        return when {
            balance >= 0 -> "R%.2f".format(balance)
            else -> "-R%.2f".format(Math.abs(balance))
        }
    }

    fun formatUserName(firstName: String, lastName: String): String {
        return "$firstName $lastName"
    }
}
