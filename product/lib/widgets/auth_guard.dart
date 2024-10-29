import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:purrnote/providers/auth_provider.dart';
import 'package:purrnote/screens/auth/login.dart';

class AuthGuard extends ConsumerWidget {
  final Widget child;

  const AuthGuard({required this.child, super.key, required Center body});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider);

    // Check if user is authenticated
    if (user != null) {
      return child; // Display the protected page
    } else {
      // Redirect to login if user is not authenticated
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (context) => Login()),
          (route) => false, // Clear the navigation stack
        );
      });
      return const SizedBox.shrink(); // Return an empty widget temporarily
    }
  }
}
