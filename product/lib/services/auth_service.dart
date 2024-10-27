import 'package:firebase_auth/firebase_auth.dart';

class AuthService {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;

  Future<User?> signIn(String email, String password) async {
    try {
      final UserCredential userCredential =
          await _firebaseAuth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      return userCredential.user; // Return the user on successful sign-in
    } on FirebaseAuthException {
      // print('Sign-in error: ${e.message}');
      return null; // Return null if sign-in fails
    }
  }

  Future<User?> signUp(String name, String email, String password) async {
    try {
      final UserCredential userCredential =
          await _firebaseAuth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      return userCredential.user; // Return the user on successful sign-up
    } on FirebaseAuthException {
      // print('Sign-up error: ${e.message}');
      return null; // Return null if sign-up fails
    }
  }
}
