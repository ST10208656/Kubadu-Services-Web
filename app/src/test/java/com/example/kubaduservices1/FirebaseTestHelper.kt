package com.example.kubaduservices1

import com.google.android.gms.tasks.Task
import com.google.android.gms.tasks.Tasks
import com.google.firebase.auth.AuthResult
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.firestore.DocumentReference
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestore
import org.mockito.Mockito.mock
import org.mockito.Mockito.`when`

object FirebaseTestHelper {
    fun mockFirebaseAuth(): FirebaseAuth {
        val auth = mock(FirebaseAuth::class.java)
        val user = mock(FirebaseUser::class.java)
        
        `when`(user.uid).thenReturn("test-uid")
        `when`(user.email).thenReturn("test@example.com")
        `when`(auth.currentUser).thenReturn(user)
        
        return auth
    }

    fun mockFirestore(): FirebaseFirestore {
        val firestore = mock(FirebaseFirestore::class.java)
        val docRef = mock(DocumentReference::class.java)
        val docSnapshot = mock(DocumentSnapshot::class.java)
        
        `when`(docSnapshot.exists()).thenReturn(true)
        `when`(docSnapshot.getString("Name")).thenReturn("John")
        `when`(docSnapshot.getString("Email")).thenReturn("john.doe@example.com")
        
        val successTask = Tasks.forResult(docSnapshot)
        `when`(docRef.get()).thenReturn(successTask)
        
        val collectionMock = mock(com.google.firebase.firestore.CollectionReference::class.java)
        `when`(collectionMock.document("test-uid")).thenReturn(docRef)
        `when`(firestore.collection("Customers")).thenReturn(collectionMock)
        
        return firestore
    }

    fun mockSuccessfulAuth(): Task<AuthResult> {
        val authResult = mock(AuthResult::class.java)
        return Tasks.forResult(authResult)
    }

    fun mockFailedAuth(): Task<AuthResult> {
        return Tasks.forException(Exception("Auth failed"))
    }

    fun mockDocumentSnapshot(exists: Boolean = true, data: Map<String, Any> = emptyMap()): DocumentSnapshot {
        val snapshot = mock(DocumentSnapshot::class.java)
        `when`(snapshot.exists()).thenReturn(exists)
        data.forEach { (key, value) ->
            when (value) {
                is String -> `when`(snapshot.getString(key)).thenReturn(value)
                is Long -> `when`(snapshot.getLong(key)).thenReturn(value)
                is Boolean -> `when`(snapshot.getBoolean(key)).thenReturn(value)
            }
        }
        return snapshot
    }
}
