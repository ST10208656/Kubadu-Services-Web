package com.example.kubaduservices1

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore

class ServicesRequestedFragment : Fragment() {
    private lateinit var serviceRequestAdapter: ServiceRequestAdapter
    private lateinit var claimsAdapter: ClaimAdapter
    private val db = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_services_requested, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val serviceRequestsRecyclerView: RecyclerView = view.findViewById(R.id.serviceRequestsRecyclerView)
        val claimsRecyclerView: RecyclerView = view.findViewById(R.id.claimsRecyclerView)

        // Initialize adapters with empty lists
        serviceRequestAdapter = com.example.kubaduservices1.ServiceRequestAdapter(mutableListOf())
        claimsAdapter = ClaimAdapter(mutableListOf())

        // Set up RecyclerViews
        serviceRequestsRecyclerView.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = serviceRequestAdapter
        }

        claimsRecyclerView.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = claimsAdapter
        }

        // Load data
        loadUserServiceRequests()
        loadUserClaims()
    }

    private fun loadUserServiceRequests() {
        val userId = auth.currentUser?.uid
        userId?.let {
            db.collection("Requests")
                .whereEqualTo("userId", it)
                .get()
                .addOnSuccessListener { documents ->
                    val serviceRequests = mutableListOf<Request>()
                    if (documents.isEmpty) {
                        serviceRequests.add(
                            com.example.kubaduservices1.Request(
                                "0",
                                "No requests",
                                ""
                            )
                        )
                    } else {
                        for (document in documents) {
                            try {
                                val requestId = document.id
                                val requestStatus = document.getString("status") ?: "Pending"
                                
                                // Determine request category based on type
                                val requestCategory = when {
                                    document.contains("loanType") -> document.getString("loanType") ?: "Unknown Loan Type"
                                    document.contains("policyType") -> document.getString("policyType") ?: "Unknown Policy Type"
                                    document.contains("type") -> document.getString("type") ?: "Unknown Type"
                                    else -> "Unknown"
                                }

                                serviceRequests.add(
                                    com.example.kubaduservices1.Request(
                                        requestId,
                                        requestCategory,
                                        requestStatus
                                    )
                                )
                                Log.d("ServiceRequests", "Added request: $requestId, $requestCategory, $requestStatus")
                            } catch (e: Exception) {
                                Log.e("ServiceRequests", "Error parsing request document: ${document.id}", e)
                            }
                        }
                    }
                    serviceRequestAdapter.updateData(serviceRequests)
                    Log.d("ServiceRequests", "Total requests: ${serviceRequests.size}")
                }
                .addOnFailureListener { exception ->
                    Log.e("ServicesRequestedFragment", "Error getting requests: ", exception)
                    serviceRequestAdapter.updateData(mutableListOf(
                        com.example.kubaduservices1.Request(
                            "0",
                            "Error loading requests",
                            ""
                        )
                    ))
                }
        }
    }

    private fun loadUserClaims() {
        val userId = auth.currentUser?.uid
        userId?.let {
            db.collection("Claims")
                .whereEqualTo("userId", it)
                .get()
                .addOnSuccessListener { documents ->
                    val claims = mutableListOf<Claim>()
                    if (documents.isEmpty) {
                        claims.add(
                            com.example.kubaduservices1.Claim(
                                claimType = "No claims",
                                claimAmount = "0",
                                status = "Pending",
                                claimId = "0"
                            )
                        )
                    } else {
                        for (document in documents) {
                            try {
                                val claim = com.example.kubaduservices1.Claim(
                                    claimId = document.id,
                                    claimType = document.getString("claimType") ?: "Unknown",
                                    claimAmount = document.getString("amount") ?: "0",
                                    status = document.getString("status") ?: "Pending"
                                )
                                claims.add(claim)
                                Log.d("Claims", "Added claim: $claim")
                            } catch (e: Exception) {
                                Log.e("Claims", "Error parsing claim document: ${document.id}", e)
                            }
                        }
                    }
                    claimsAdapter.updateData(claims)
                    Log.d("Claims", "Total claims: ${claims.size}")
                }
                .addOnFailureListener { exception ->
                    Log.e("ServicesRequestedFragment", "Error getting claims: ", exception)
                    claimsAdapter.updateData(mutableListOf(
                        com.example.kubaduservices1.Claim(
                            claimType = "Error loading claims",
                            claimAmount = "0",
                            status = "Error",
                            claimId = "0"
                        )
                    ))
                }
        }
    }
}