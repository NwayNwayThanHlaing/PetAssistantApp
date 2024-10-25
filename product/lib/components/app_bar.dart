import 'package:flutter/material.dart';
import '/app_theme.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;

  const CustomAppBar({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: AppTheme.barColor,
      title: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              const SizedBox(width: 5),
              Image.asset(
                'assets/logo.png',
                width: 50,
                height: 50,
              ),
              const SizedBox(width: 10),
              Text(
                title,
                style: AppTheme.headline1,
              ),
            ],
          ),
          const Icon(
            Icons.notifications_none,
            color: AppTheme.secondaryColor,
          ),
        ],
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
