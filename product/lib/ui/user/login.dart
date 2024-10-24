import 'package:flutter/material.dart';
import 'package:product/app_theme.dart';

class Login extends StatefulWidget {
  const Login({super.key});

  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: 200,
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
            LoginForm(),
          ],
        ),
      ),
      bottomSheet: const SizedBox(
        height: 60,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Don\'t have an account?',
              style: TextStyle(color: AppTheme.secondaryColor),
            ),
            SizedBox(width: 10),
            Text(
              'Sign up',
              style: TextStyle(
                  color: AppTheme.primaryColor,
                  fontWeight: FontWeight.bold,
                  decoration: TextDecoration.underline,
                  decorationStyle: TextDecorationStyle.solid,
                  decorationColor: AppTheme.primaryColor),
            ),
          ],
        ),
      ),
    );
  }
}

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
          hintStyle: TextStyle(color: Colors.grey.shade400),
        )),
        TextField(
            decoration: InputDecoration(
          hintText: 'Password',
          hintStyle: TextStyle(color: Colors.grey.shade400),
        )),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryColor,
              foregroundColor: Colors.white,
            ),
            child: const Text('Login', style: AppTheme.buttonText),
          ),
        ),
      ],
    );
  }
}
