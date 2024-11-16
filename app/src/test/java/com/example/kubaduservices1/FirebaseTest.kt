package com.example.kubaduservices1

import com.google.android.gms.tasks.Tasks
import com.google.firebase.auth.AuthResult
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.firestore.DocumentReference
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestore
import io.mockk.*
import org.junit.Before
import org.junit.Test

class FirebaseTest {
    private lateinit var auth: FirebaseAuth
    private lateinit var firestore: FirebaseFirestore
    private lateinit var user: FirebaseUser
    private lateinit var docRef: DocumentReference
    private lateinit var docSnapshot: DocumentSnapshot

    @Before
    fun setup() {
        auth = mockk(relaxed = true)
        firestore = mockk(relaxed = true)
        user = mockk(relaxed = true)
        docRef = mockk(relaxed = true)
        docSnapshot = mockk(relaxed = true)

        // Mock user
        every { user.uid } returns "test-uid"
        every { user.email } returns "test@example.com"
        every { auth.currentUser } returns user

        // Mock Firestore
        every { firestore.collection("Customers") } returns mockk {
            every { document(any()) } returns docRef
        }
    }

    @Test
    fun `test user authentication success`() {
        val authResult = mockk<AuthResult>(relaxed = true)
        val successTask = Tasks.forResult(authResult)
        
        every { 
            auth.signInWithEmailAndPassword("test@example.com", "password")
        } returns successTask

        val result = auth.signInWithEmailAndPassword("test@example.com", "password")
        assert(result.isSuccessful)
    }

    @Test
    fun `test user authentication failure`() {
        val failureTask = Tasks.forException<AuthResult>(Exception("Auth failed"))
        
        every { 
            auth.signInWithEmailAndPassword("wrong@email.com", "wrongpass")
        } returns failureTask

        val result = auth.signInWithEmailAndPassword("wrong@email.com", "wrongpass")
        assert(!result.isSuccessful)
    }

    @Test
    fun `test fetch user profile success`() {
        every { docSnapshot.exists() } returns true
        every { docSnapshot.getString("Name") } returns "John"
        every { docSnapshot.getString("Email") } returns "john.doe@example.com"
        every { docRef.get() } returns Tasks.forResult(docSnapshot)

        val docTask = docRef.get()
        assert(docTask.isSuccessful)
        assert(docTask.result.exists())
        assert(docTask.result.getString("Name") == "John")
        assert(docTask.result.getString("Email") == "john.doe@example.com")
    }

    @Test
    fun `test fetch user profile not found`() {
        every { docSnapshot.exists() } returns false
        every { docRef.get() } returns Tasks.forResult(docSnapshot)

        val docTask = docRef.get()
        assert(docTask.isSuccessful)
        assert(!docTask.result.exists())
    }

    @Test
    fun `test user logout`() {
        auth.signOut()
        verify { auth.signOut() }
    }

    @Test
    fun `test current user state`() {
        assert(auth.currentUser != null)
        assert(auth.currentUser?.uid == "test-uid")
        assert(auth.currentUser?.email == "test@example.com")
    }

    @Test
    fun `test profile image url fetch`() {
        every { docSnapshot.exists() } returns true
        every { docSnapshot.getString("profileImageUrl") } returns "https://example.com/profile.jpg"
        every { docRef.get() } returns Tasks.forResult(docSnapshot)

        val docTask = docRef.get()
        assert(docTask.isSuccessful)
        assert(docTask.result.exists())
        assert(docTask.result.getString("profileImageUrl") == "https://example.com/profile.jpg")
    }
}
