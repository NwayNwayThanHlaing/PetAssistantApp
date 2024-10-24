import 'package:flutter/material.dart';
import 'package:purrnote/app_theme.dart';

class SignupForm extends StatelessWidget {
  const SignupForm({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Sign Up',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: AppTheme.secondaryColor,
          ),
        ),
        const Text("Create a new account."),
        const SizedBox(height: 20),
        TextField(
          decoration: InputDecoration(
            hintText: 'Name',
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
        ),
        const SizedBox(height: 20),
        TextField(
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
        ),
        const SizedBox(height: 20),
        TextField(
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
        ),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryColor,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Sign Up',
                  style:
                      AppTheme.buttonText.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(width: 10),
                const Icon(Icons.pets),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
