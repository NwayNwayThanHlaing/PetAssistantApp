import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/auth_service.dart';

class AuthController extends StateNotifier<User?> {
  final AuthService _authService;

  AuthController(this._authService) : super(null);

  Future<bool> signIn(String email, String password) async {
    final user = await _authService.signIn(email, password);
    if (user != null) {
      state = user; // Update state if sign-in is successful
      return true; // Indicate success
    } else {
      return false; // Indicate failure
    }
  }

  Future<bool> signUp(String name, String email, String password) async {
    final user = await _authService.signUp(name, email, password);
    if (user != null) {
      state = user; // Update state if sign-up is successful
      return true; // Indicate success
    } else {
      return false; // Indicate failure
    }
  }
}
