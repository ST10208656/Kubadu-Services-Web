package com.example.kubaduservices1

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class ClaimsAdapter(private var claims: List<Claim>) :
    RecyclerView.Adapter<ClaimsAdapter.ClaimViewHolder>() {

    class ClaimViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val claimTypeTextView: TextView = view.findViewById(R.id.claimTypeTextView)
        val claimAmountTextView: TextView = view.findViewById(R.id.claimAmountTextView)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ClaimViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.claim_item, parent, false)
        return ClaimViewHolder(view)
    }

    override fun onBindViewHolder(holder: ClaimViewHolder, position: Int) {
        val claim = claims[position]
        holder.claimTypeTextView.text = claim.claimType
        holder.claimAmountTextView.text = "R${claim.claimAmount}"
    }

    override fun getItemCount() = claims.size

    fun updateClaims(newClaims: List<Claim>) {
        claims = newClaims
        notifyDataSetChanged()
    }
}
