import 'package:flutter/material.dart';
import 'package:purrnote/app_theme.dart';

class AuthAppBar extends StatelessWidget implements PreferredSizeWidget {
  const AuthAppBar({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBar(
      toolbarHeight: 220,
      backgroundColor: AppTheme.barColor,
      title: const Column(
        children: [
          AppTheme.logo,
          Text(
            'PurrNote',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: AppTheme.secondaryColor,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(220);
}

class AuthNavBar extends StatelessWidget {
  const AuthNavBar({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
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
              Navigator.pushReplacementNamed(
                  context, '/login'); // Change to your login route
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
    );
  }
}
