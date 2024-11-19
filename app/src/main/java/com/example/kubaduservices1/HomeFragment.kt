package com.example.kubaduservices1

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.cardview.widget.CardView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.Timestamp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.*
import java.text.SimpleDateFormat
import java.util.*

class HomeFragment : Fragment() {

    private lateinit var welcomeTextView: TextView
    private lateinit var notificationsTextView: TextView
    private lateinit var newsTextView: TextView
    private lateinit var loanButton: Button
    private lateinit var funeralPolicyButton: Button
    private lateinit var walletBalanceTextView: TextView
    private lateinit var cardNameTextView: TextView
    private var chatLayout: View? = null
    private var chatWindow: CardView? = null
    private lateinit var messagesRecyclerView: RecyclerView
    private lateinit var messageInput: EditText
    private lateinit var sendMessageButton: ImageButton
    private lateinit var resolveChatButton: ImageButton
    private lateinit var emptyMessagesText: TextView
    private var chatId: String? = null
    private lateinit var messagesAdapter: MessagesAdapter

    private lateinit var firestore: FirebaseFirestore
    private lateinit var auth: FirebaseAuth
    private var notificationsListener: ListenerRegistration? = null
    private var newsListener: ListenerRegistration? = null
    private var chatMessagesListener: ListenerRegistration? = null

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

        return view
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Log.d("HomeFragment", "onViewCreated called")

        // Initialize Firebase
        firestore = FirebaseFirestore.getInstance()
        auth = FirebaseAuth.getInstance()

        // Initialize views and setup
        initializeViews(view)
        setupChatViews(view)
        setupButtonListeners()
        
        displayWelcomeMessage()
        loadWalletBalance()
        listenForNotifications()
        listenForNews()

        // Create or get existing chat
        createOrGetChat()
    }

    private fun setupChatViews(view: View) {
        try {
            Log.d("HomeFragment", "Setting up chat views")
            
            // Initialize chat controls
            messagesRecyclerView = view.findViewById(R.id.messagesRecyclerView)
            messageInput = view.findViewById(R.id.messageInput)
            sendMessageButton = view.findViewById(R.id.sendMessageButton)
            resolveChatButton = view.findViewById(R.id.resolveChatButton)
            emptyMessagesText = view.findViewById(R.id.emptyMessagesText)

            // Setup RecyclerView
            messagesAdapter = MessagesAdapter()
            messagesRecyclerView.apply {
                layoutManager = LinearLayoutManager(context)
                adapter = messagesAdapter
            }

            // Update empty state when messages change
            messagesAdapter.registerAdapterDataObserver(object : RecyclerView.AdapterDataObserver() {
                override fun onChanged() {
                    updateEmptyState()
                }

                override fun onItemRangeInserted(positionStart: Int, itemCount: Int) {
                    updateEmptyState()
                }

                override fun onItemRangeRemoved(positionStart: Int, itemCount: Int) {
                    updateEmptyState()
                }
            })

            Log.d("HomeFragment", "Chat views initialized: " +
                "messageInput=${messageInput != null}, " +
                "sendButton=${sendMessageButton != null}, " +
                "recyclerView=${messagesRecyclerView != null}, " +
                "adapter=${messagesAdapter != null}")

            // Set up click listeners
            sendMessageButton.setOnClickListener {
                val messageText = messageInput.text.toString().trim()
                if (messageText.isNotEmpty()) {
                    sendMessage(messageText)
                    messageInput.text.clear()
                }
            }

            resolveChatButton.setOnClickListener {
                resolveChat()
            }

        } catch (e: Exception) {
            Log.e("HomeFragment", "Error setting up chat views", e)
            Toast.makeText(context, "Error setting up chat: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun updateEmptyState() {
        if (messagesAdapter.itemCount > 0) {
            messagesRecyclerView.visibility = View.VISIBLE
            emptyMessagesText.visibility = View.GONE
        } else {
            messagesRecyclerView.visibility = View.GONE
            emptyMessagesText.visibility = View.VISIBLE
        }
    }

    private inner class MessagesAdapter : RecyclerView.Adapter<MessagesAdapter.MessageViewHolder>() {
        private var messages: List<Message> = emptyList()

        inner class MessageViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            val messageText: TextView = itemView.findViewById(R.id.messageText)
            val senderName: TextView = itemView.findViewById(R.id.senderName)
            val timestamp: TextView = itemView.findViewById(R.id.timestamp)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MessageViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.chat_message_item, parent, false)
            return MessageViewHolder(view)
        }

        override fun onBindViewHolder(holder: MessageViewHolder, position: Int) {
            val message = messages[position]
            holder.messageText.text = message.message
            holder.senderName.text = message.name
            holder.timestamp.text = message.getFormattedTime()
        }

        override fun getItemCount() = messages.size

        fun submitList(newMessages: List<Message>) {
            messages = newMessages
            notifyDataSetChanged()
        }
    }

    private fun initializeViews(view: View) {
        try {
            Log.d("HomeFragment", "Initializing views")

            // Initialize main views
            welcomeTextView = view.findViewById(R.id.welcomeTextView)
            notificationsTextView = view.findViewById(R.id.notificationsTextView)
            newsTextView = view.findViewById(R.id.newsTextView)
            loanButton = view.findViewById(R.id.loanButton)
            funeralPolicyButton = view.findViewById(R.id.funeralPolicyButton)
            walletBalanceTextView = view.findViewById(R.id.wallet_balance)
            cardNameTextView = view.findViewById(R.id.card_name)

            Log.d("HomeFragment", "Views initialized successfully")
        } catch (e: Exception) {
            Log.e("HomeFragment", "Error initializing views", e)
            e.printStackTrace()
        }
    }

    private fun setupButtonListeners() {
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

    private fun createOrGetChat() {
        val currentUser = FirebaseAuth.getInstance().currentUser
        if (currentUser == null) {
            Log.e("HomeFragment", "No user signed in")
            return
        }

        val db = FirebaseFirestore.getInstance()
        
        // Check for existing chat
        db.collection("chats")
            .whereEqualTo("customerID", currentUser.uid)
            .whereIn("status", listOf("open", "unassigned"))
            .get()
            .addOnSuccessListener { documents ->
                if (documents.isEmpty) {
                    // Create new chat
                    val chat = hashMapOf(
                        "customerID" to currentUser.uid,
                        "status" to "unassigned",
                        "timestamp" to FieldValue.serverTimestamp()
                    )

                    db.collection("chats")
                        .add(chat)
                        .addOnSuccessListener { documentReference ->
                            chatId = documentReference.id
                            Log.d("HomeFragment", "New chat created with ID: $chatId")
                            listenToMessages()
                        }
                        .addOnFailureListener { e ->
                            Log.e("HomeFragment", "Error creating chat", e)
                        }
                } else {
                    // Use existing chat
                    chatId = documents.documents[0].id
                    Log.d("HomeFragment", "Using existing chat with ID: $chatId")
                    listenToMessages()
                }
            }
            .addOnFailureListener { e ->
                Log.e("HomeFragment", "Error checking for existing chat", e)
            }
    }

    private fun sendMessage(messageText: String) {
        val currentUser = FirebaseAuth.getInstance().currentUser ?: return
        val chatIdCopy = chatId
        if (chatIdCopy == null) {
            Log.e("HomeFragment", "Cannot send message - no active chat")
            return
        }

        // First get the customer's name from Customers collection
        FirebaseFirestore.getInstance()
            .collection("Customers")
            .document(currentUser.uid)
            .get()
            .addOnSuccessListener { document ->
                val firstName = document.getString("Name") ?: ""
                val lastName = document.getString("Surname") ?: ""
                val customerName = "$firstName $lastName".trim()

                val message = hashMapOf(
                    "userID" to currentUser.uid,
                    "message" to messageText,
                    "name" to customerName,
                    "timestamp" to FieldValue.serverTimestamp()
                )

                FirebaseFirestore.getInstance()
                    .collection("chats")
                    .document(chatIdCopy)
                    .collection("messages")
                    .add(message)
                    .addOnFailureListener { e ->
                        Log.e("HomeFragment", "Error sending message", e)
                    }
            }
            .addOnFailureListener { e ->
                Log.e("HomeFragment", "Error getting customer name", e)
                // Fallback to sending message with default name if we can't get the customer name
                val message = hashMapOf(
                    "userID" to currentUser.uid,
                    "message" to messageText,
                    "name" to "Customer",
                    "timestamp" to FieldValue.serverTimestamp()
                )

                FirebaseFirestore.getInstance()
                    .collection("chats")
                    .document(chatIdCopy)
                    .collection("messages")
                    .add(message)
                    .addOnFailureListener { e2 ->
                        Log.e("HomeFragment", "Error sending message", e2)
                    }
            }
    }

    private fun listenToMessages() {
        val chatIdCopy = chatId
        if (chatIdCopy == null) {
            Log.e("HomeFragment", "Cannot listen to messages - no active chat")
            return
        }

        FirebaseFirestore.getInstance()
            .collection("chats")
            .document(chatIdCopy)
            .collection("messages")
            .orderBy("timestamp", Query.Direction.ASCENDING)
            .addSnapshotListener { snapshots, e ->
                if (e != null) {
                    Log.e("HomeFragment", "Error listening to messages", e)
                    return@addSnapshotListener
                }

                snapshots?.let { documents ->
                    val messages = documents.mapNotNull { doc ->
                        doc.toObject(Message::class.java)
                    }
                    messagesAdapter.submitList(messages)
                    messagesRecyclerView.scrollToPosition(messages.size - 1)
                }
            }
    }

    private fun resolveChat() {
        val chatIdCopy = chatId
        if (chatIdCopy == null) {
            Log.e("HomeFragment", "Cannot resolve chat - no active chat")
            return
        }

        FirebaseFirestore.getInstance()
            .collection("chats")
            .document(chatIdCopy)
            .update("status", "resolved")
            .addOnSuccessListener {
                Log.d("HomeFragment", "Chat resolved successfully")
                // Create new chat for future messages
                chatId = null
                createOrGetChat()
            }
            .addOnFailureListener { e ->
                Log.e("HomeFragment", "Error resolving chat", e)
            }
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
        val currentUser = auth.currentUser
        currentUser?.let { user ->
            notificationsListener = firestore.collection("notifications")
                .whereEqualTo("userId", user.uid)  // Filter notifications by current user's ID
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
        } ?: run {
            // If no user is logged in
            notificationsTextView.text = "Please log in to view notifications"
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

    override fun onDestroyView() {
        super.onDestroyView()
        notificationsListener?.remove()
        newsListener?.remove()
    }

    companion object {
        private const val TAG = "HomeFragment"
    }
}
