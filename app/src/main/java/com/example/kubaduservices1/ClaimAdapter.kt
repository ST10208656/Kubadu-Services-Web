package com.example.kubaduservices1

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class ClaimAdapter(private val claims: MutableList<Claim>) :
    RecyclerView.Adapter<ClaimAdapter.ClaimViewHolder>() {

    inner class ClaimViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val claimIdTextView: TextView = itemView.findViewById(R.id.claimIdTextView)
        val claimCategoryTextView: TextView = itemView.findViewById(R.id.claimCategoryTextView)
        val claimStatusTextView: TextView = itemView.findViewById(R.id.claimStatusTextView)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ClaimViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_claim, parent, false)
        return ClaimViewHolder(view)
    }

    override fun onBindViewHolder(holder: ClaimViewHolder, position: Int) {
        val claim = claims[position]
        holder.claimIdTextView.text = "Claim ID: ${claim.claimId}"
        holder.claimCategoryTextView.text = "Category: ${claim.claimType} (R${claim.claimAmount})"
        holder.claimStatusTextView.text = "Status: ${claim.status}"
    }

    override fun getItemCount(): Int = claims.size

    fun updateData(newClaims: List<Claim>) {
        claims.clear()
        claims.addAll(newClaims)
        notifyDataSetChanged()
    }
}
