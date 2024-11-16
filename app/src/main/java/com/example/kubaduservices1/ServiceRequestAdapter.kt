package com.example.kubaduservices1

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class ServiceRequestAdapter(private val serviceRequests: MutableList<Request>) :
    RecyclerView.Adapter<ServiceRequestAdapter.ServiceRequestViewHolder>() {

    // ViewHolder class to hold the views for each request item
    inner class ServiceRequestViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val requestIdTextView: TextView = itemView.findViewById(R.id.requestIdTextView)
        val requestCategoryTextView: TextView = itemView.findViewById(R.id.requestCategoryTextView)
        val requestStatusTextView: TextView = itemView.findViewById(R.id.requestStatusTextView)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ServiceRequestViewHolder {
        // Inflate the layout for each request item
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_service_request, parent, false)
        return ServiceRequestViewHolder(view)
    }
    fun updateData(newServiceRequests: MutableList<Request>) {
        serviceRequests.clear()
        serviceRequests.addAll(newServiceRequests)
        notifyDataSetChanged()
    }
    override fun onBindViewHolder(holder: ServiceRequestViewHolder, position: Int) {
        val serviceRequest = serviceRequests[position]
        holder.requestIdTextView.text = serviceRequest.requestId
        holder.requestCategoryTextView.text = serviceRequest.requestCategory.toString()
        holder.requestStatusTextView.text = serviceRequest.requestStatus
    }

    override fun getItemCount(): Int = serviceRequests.size
}
