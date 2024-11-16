package com.example.kubaduservices1

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.MenuItem
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.core.view.GravityCompat
import androidx.drawerlayout.widget.DrawerLayout
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.navigateUp
import androidx.navigation.ui.setupActionBarWithNavController
import androidx.navigation.ui.setupWithNavController
import com.google.android.material.navigation.NavigationView
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.auth.FirebaseAuth
import com.example.kubaduservices1.GradientTextView
import com.squareup.picasso.Picasso
import com.squareup.picasso.Callback
import de.hdodenhof.circleimageview.CircleImageView

class ServicesActivity : AppCompatActivity() {
    private lateinit var drawerLayout: DrawerLayout
    private lateinit var navigationView: NavigationView
    private lateinit var navController: NavController
    private lateinit var appBarConfiguration: AppBarConfiguration
    private lateinit var auth: FirebaseAuth
    private lateinit var firestore: FirebaseFirestore

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_services)

        // Initialize Firebase instances
        auth = FirebaseAuth.getInstance()
        firestore = FirebaseFirestore.getInstance()

        // Set up toolbar
        val toolbar = findViewById<Toolbar>(R.id.toolbar)
        setSupportActionBar(toolbar)

        // Initialize views
        drawerLayout = findViewById(R.id.drawerLayout)
        navigationView = findViewById(R.id.nav_view)

        // Set up Navigation
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        navController = navHostFragment.navController

        // Configure app bar
        appBarConfiguration = AppBarConfiguration(
            setOf(
                R.id.homeFragment,
                R.id.loanFragment,
                R.id.funeralPolicyFragment,
                R.id.claimsFragment,
                R.id.ServicesRequestedFragment,
                R.id.ProfileFragment,
                R.id.SettingsFragment
            ),
            drawerLayout
        )

        setupActionBarWithNavController(navController, appBarConfiguration)
        navigationView.setupWithNavController(navController)

        // Set up user name in navigation header
        setupUserNameInHeader()
        loadProfileImage()

        // Set up navigation item click listener
        navigationView.setNavigationItemSelectedListener { menuItem ->
            when (menuItem.itemId) {
                R.id.nav_home -> {
                    navController.navigate(R.id.homeFragment)
                }
                R.id.nav_loans -> {
                    navController.navigate(R.id.loanFragment)
                }
                R.id.nav_funeral_policy -> {
                    navController.navigate(R.id.funeralPolicyFragment)
                }
                R.id.nav_claims -> {
                    navController.navigate(R.id.claimsFragment)
                }
                R.id.nav_requests -> {
                    navController.navigate(R.id.ServicesRequestedFragment)
                }
                R.id.nav_profile -> {
                    navController.navigate(R.id.ProfileFragment)
                }
                R.id.nav_settings -> {
                    navController.navigate(R.id.SettingsFragment)
                }
                R.id.nav_logout -> {
                    // Sign out from Firebase Auth
                    try {
                        auth.signOut()
                        // Clear any stored user data or preferences if needed
                        
                        // Redirect to login and clear the back stack
                        val intent = Intent(this, LoginActivity::class.java)
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intent)
                        finish()
                    } catch (e: Exception) {
                        Log.e("ServicesActivity", "Error during logout", e)
                        Toast.makeText(this, "Error during logout. Please try again.", Toast.LENGTH_SHORT).show()
                    }
                }
            }
            drawerLayout.closeDrawer(GravityCompat.START)
            true
        }
    }

    private fun loadProfileImage() {
        val headerView = navigationView.getHeaderView(0)
        val profileImageView = headerView.findViewById<de.hdodenhof.circleimageview.CircleImageView>(R.id.imageViewProfile)

        auth.currentUser?.let { user ->
            firestore.collection("Customers").document(user.uid)
                .get()
                .addOnSuccessListener { document ->
                    if (document != null && document.exists()) {
                        val profileImageUrl = document.getString("profileImageUrl")
                        if (!profileImageUrl.isNullOrEmpty()) {
                            Picasso.get()
                                .load(profileImageUrl)
                                .placeholder(R.drawable.placeholder)
                                .error(R.drawable.placeholder)
                                .into(profileImageView, object : Callback {
                                    override fun onSuccess() {
                                        Log.d("ServicesActivity", "Profile image loaded successfully")
                                    }
                                    override fun onError(e: Exception) {
                                        Log.e("ServicesActivity", "Error loading profile image", e)
                                        // Set placeholder on error
                                        profileImageView.setImageResource(R.drawable.placeholder)
                                    }
                                })
                        } else {
                            // Set placeholder if no image URL
                            profileImageView.setImageResource(R.drawable.placeholder)
                        }
                    }
                }
                .addOnFailureListener { e ->
                    Log.e("ServicesActivity", "Error getting user profile", e)
                    // Set placeholder on error
                    profileImageView.setImageResource(R.drawable.placeholder)
                }
        }
    }

    private fun setupUserNameInHeader() {
        try {
            val headerView = navigationView.getHeaderView(0)
            Log.d("ServicesActivity", "Header view found: ${headerView != null}")

            val userNameTextView = headerView?.findViewById<GradientTextView>(R.id.textViewUsername)
            Log.d("ServicesActivity", "Username TextView found: ${userNameTextView != null}")

            if (userNameTextView == null) {
                Log.e("ServicesActivity", "Failed to find username TextView")
                return
            }

            auth.currentUser?.let { user ->
                Log.d("ServicesActivity", "Current user found: ${user.uid}")
                
                firestore.collection("Customers").document(user.uid)
                    .get()
                    .addOnSuccessListener { document ->
                        Log.d("ServicesActivity", "Firestore document exists: ${document.exists()}")
                        if (document != null && document.exists()) {
                            val firstName = document.getString("Name") ?: ""
                            val lastName = document.getString("Surname") ?: ""
                            Log.d("ServicesActivity", "Name: $firstName, Surname: $lastName")
                            
                            val fullName = if (firstName.isNotEmpty() && lastName.isNotEmpty()) {
                                "$firstName $lastName"
                            } else {
                                user.email ?: "User"
                            }
                            userNameTextView.text = fullName
                            Log.d("ServicesActivity", "Set username to: $fullName")
                        } else {
                            userNameTextView.text = user.email ?: "User"
                            Log.d("ServicesActivity", "Using fallback name: ${user.email}")
                        }
                    }
                    .addOnFailureListener { e ->
                        Log.e("ServicesActivity", "Error getting user data", e)
                        userNameTextView.text = user.email ?: "User"
                    }
            } ?: run {
                Log.e("ServicesActivity", "No current user found")
                userNameTextView.text = "Guest"
            }
        } catch (e: Exception) {
            Log.e("ServicesActivity", "Error in setupUserNameInHeader", e)
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        return navController.navigateUp(appBarConfiguration) || super.onSupportNavigateUp()
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        if (item.itemId == android.R.id.home) {
            if (drawerLayout.isDrawerOpen(GravityCompat.START)) {
                drawerLayout.closeDrawer(GravityCompat.START)
            } else {
                drawerLayout.openDrawer(GravityCompat.START)
            }
            return true
        }
        return super.onOptionsItemSelected(item)
    }
}
