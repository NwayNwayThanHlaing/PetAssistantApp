import 'package:flutter/material.dart';
import 'package:purrnote/app_theme.dart';
import 'package:purrnote/components/forms/signup_form.dart';

class Signup extends StatefulWidget {
  const Signup({super.key});

  @override
  State<Signup> createState() => _SignupState();
}

class _SignupState extends State<Signup> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: 220,
        backgroundColor: AppTheme.barColor,
        title: const Column(
          children: [
            AppTheme.logo,
            Text(
              'PurrNote',
              style: TextStyle(
                  fontWeight: FontWeight.bold, color: AppTheme.secondaryColor),
            ),
          ],
        ),
      ),
      body: const Padding(
        padding: EdgeInsets.all(50),
        child: Column(
          children: [
            SignupForm(),
          ],
        ),
      ),
      bottomNavigationBar: SizedBox(
        height: 60,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Already have an account?',
              style: TextStyle(color: AppTheme.secondaryColor),
            ),
            const SizedBox(width: 10),
            GestureDetector(
              onTap: () {
                Navigator.pushReplacementNamed(context, '/login');
              },
              child: RichText(
                text: const TextSpan(
                  text: 'Login',
                  style: TextStyle(
                    color: AppTheme.primaryColor,
                    fontWeight: FontWeight.bold,
                    decoration: TextDecoration.underline,
                    decorationStyle: TextDecorationStyle.solid,
                    decorationColor: AppTheme.primaryColor,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
