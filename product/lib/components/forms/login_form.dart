import 'package:flutter/material.dart';
import 'package:purrnote/app_theme.dart';

class LoginForm extends StatelessWidget {
  const LoginForm({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
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
            onPressed: () {
              // go to home page
              // Navigator.push(
              //   context,
              //   MaterialPageRoute(builder: (context) => Home()),
              // );
            },
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
                  'Login',
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
