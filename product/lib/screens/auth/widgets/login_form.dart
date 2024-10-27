import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:purrnote/providers/auth_provider.dart';
import '../../../app_theme.dart';

class LoginForm extends ConsumerWidget {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  LoginForm({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authController = ref.watch(
        authControllerProvider.notifier); // Use ref.watch to get the notifier

    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Login',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppTheme.secondaryColor,
            ),
          ),
          const Text("Please login to continue."),
          const SizedBox(height: 20),
          TextFormField(
            controller: emailController,
            decoration: InputDecoration(
              hintText: 'Email',
              hintStyle: const TextStyle(
                color: AppTheme.lightTextColor,
                fontWeight: FontWeight.bold,
              ),
              fillColor: AppTheme.barColor,
              filled: true,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide.none,
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your email';
              }
              return null;
            },
          ),
          const SizedBox(height: 20),
          TextFormField(
            controller: passwordController,
            obscureText: true, // Hide password
            decoration: InputDecoration(
              hintText: 'Password',
              hintStyle: const TextStyle(
                color: AppTheme.lightTextColor,
                fontWeight: FontWeight.bold,
              ),
              fillColor: AppTheme.barColor,
              filled: true,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide.none,
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your password';
              }
              return null;
            },
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: () async {
                if (_formKey.currentState?.validate() ?? false) {
                  final isSuccess = await authController.signIn(
                    emailController.text,
                    passwordController.text,
                  );

                  // Check if the widget is still mounted before using context
                  if (context.mounted) {
                    if (isSuccess) {
                      // Handle successful login
                      Navigator.pushNamed(context, '/home');
                    } else {
                      // Handle login error
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Login failed.')),
                      );
                    }
                  }
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Login',
                    style: AppTheme.buttonText,
                  ),
                  SizedBox(width: 10),
                  Icon(Icons.pets),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
