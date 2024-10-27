import 'package:flutter/material.dart';
import 'package:purrnote/screens/auth/widgets/components.dart';
import 'widgets/signup_form.dart';

class Signup extends StatelessWidget {
  const Signup({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AuthAppBar(),
      body: Padding(
        padding: const EdgeInsets.all(50),
        child: SignupForm(),
      ),
      bottomNavigationBar: const AuthNavBar(),
    );
  }
}
