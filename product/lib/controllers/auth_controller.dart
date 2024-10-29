import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:purrnote/providers/auth_provider.dart';
import '../services/auth_service.dart';

class AuthController extends StateNotifier<User?> {
  final AuthService _authService;

  AuthController(this._authService) : super(null) {
    _init();
  }

  // Initialize the AuthController and check if the user is logged in
  void _init() {
    _authService.authStateChanges.listen((user) {
      state = user; // Update the state based on the authentication status
    });
  }

  // Method to sign in
  Future<bool> signIn(String email, String password) async {
    final user = await _authService.signIn(email, password);
    if (user != null) {
      state = user; // Update the state with the signed-in user
      return true;
    } else {
      return false; // Return false if sign-in fails
    }
  }

  // Method to sign up
  Future<String?> signUp(String name, String email, String password) async {
    try {
      User? user = await _authService.signUp(name, email, password);

      if (user != null) {
        // Create user document in Firestore
        await FirebaseFirestore.instance.collection('users').doc(user.uid).set({
          'name': name,
          'email': email,
          'createdAt': DateTime.now(),
        });

        state = user; // Update the state with the signed-in user after sign up
        return null; // Return null for success
      } else {
        return 'Sign up failed. Please try again.'; // Return error message
      }
    } on FirebaseAuthException catch (e) {
      switch (e.code) {
        case 'weak-password':
          return 'The password provided is too weak.';
        case 'email-already-in-use':
          return 'The account already exists for that email.';
        case 'invalid-email':
          return 'The email address is not valid.';
        default:
          return 'Sign up failed. Please try again.';
      }
    } catch (e) {
      return 'An unexpected error occurred. Please try again.';
    }
  }

  // Method to sign out the user
  Future<void> signOut() async {
    await _authService.signOut();
    state = null; // Clear the user state after signing out
  }

  // Method to check if the user is authenticated
  bool isAuthenticated() {
    return state != null; // Return true if the user is authenticated
  }
}

// Provider for the AuthController
final authControllerProvider =
    StateNotifierProvider<AuthController, User?>((ref) {
  return AuthController(ref.read(authServiceProvider)); // Pass the AuthService
});
