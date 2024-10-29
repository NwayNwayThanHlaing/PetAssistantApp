import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class AuthService {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  /// Signs in a user with email and password.
  Future<User?> signIn(String email, String password) async {
    try {
      final UserCredential userCredential =
          await _firebaseAuth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      return userCredential.user; // Return the user on successful sign-in
    } on FirebaseAuthException catch (e) {
      // Handle specific FirebaseAuth exceptions
      throw _handleAuthException(e);
    }
  }

  /// Signs up a new user with email and password.
  Future<User?> signUp(String name, String email, String password) async {
    try {
      // Create user with email and password in Firebase Authentication
      UserCredential userCredential =
          await _firebaseAuth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      // Check if user was created
      User? user = userCredential.user;
      if (user != null) {
        // Save additional user data in Firestore
        await _firestore.collection('users').doc(user.uid).set({
          'uid': user.uid,
          'email': email,
          'name': name, // Store the username here
          'createdAt': FieldValue.serverTimestamp(),
        });
        return user; // Return the user on successful sign-up
      } else {
        throw Exception(
            'User creation failed.'); // Throw exception if user creation fails
      }
    } on FirebaseAuthException catch (e) {
      // Handle specific FirebaseAuth exceptions
      throw _handleAuthException(e);
    }
  }

  /// Signs out the currently authenticated user.
  Future<void> signOut() async {
    await _firebaseAuth.signOut(); // Sign out the user
  }

  /// Listens for authentication state changes.
  Stream<User?> get authStateChanges => _firebaseAuth.authStateChanges();

  /// Handles FirebaseAuthException and returns a user-friendly message.
  String _handleAuthException(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return 'No user found for that email.';
      case 'wrong-password':
        return 'Wrong password provided for that user.';
      case 'weak-password':
        return 'The password provided is too weak.';
      case 'email-already-in-use':
        return 'The account already exists for that email.';
      case 'invalid-email':
        return 'The email address is not valid.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}
