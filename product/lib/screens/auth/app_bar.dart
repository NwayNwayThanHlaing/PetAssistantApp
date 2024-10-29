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
      automaticallyImplyLeading: false,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(220);
}
