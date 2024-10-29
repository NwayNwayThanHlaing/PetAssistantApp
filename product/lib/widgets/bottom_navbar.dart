import 'package:flutter/material.dart';
import 'package:purrnote/screens/dashboard/home_page.dart';
import 'package:purrnote/screens/dashboard/calendar_page.dart';
import 'package:purrnote/screens/dashboard/pets_page.dart';
import 'package:purrnote/screens/dashboard/vet_page.dart';
import 'package:purrnote/screens/dashboard/profile_page.dart';
import '/app_theme.dart';

class CustomBottomNavigationBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const CustomBottomNavigationBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  final List<Widget> _pages = const [
    HomePage(),
    CalendarPage(),
    PetsPage(),
    VetPage(),
    ProfilePage(),
  ];

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      currentIndex: currentIndex,
      onTap: (index) {
        navigateToPage(context, index);
        onTap(index);
      },
      items: const <BottomNavigationBarItem>[
        BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: 'Home',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.calendar_month),
          label: 'Calendar',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.pets),
          label: 'Pets',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.local_hospital),
          label: 'Vet',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person),
          label: 'Profile',
        ),
      ],
      backgroundColor: AppTheme.barColor,
      selectedItemColor: const Color(0xffEC7A5C),
      selectedFontSize: 13,
      selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold),
      unselectedItemColor: const Color.fromARGB(255, 59, 57, 57),
    );
  }

  void navigateToPage(BuildContext context, int index) {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => _pages[index]),
    );
  }
}
