import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';
import '../controllers/auth_controller.dart';

// Auth Providers
// Create a Provider for AuthService
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

// Create a StateNotifierProvider for AuthController
final authControllerProvider =
    StateNotifierProvider<AuthController, User?>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthController(authService);
});
