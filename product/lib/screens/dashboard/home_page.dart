import 'package:flutter/material.dart';
import 'package:purrnote/widgets/app_bar.dart';
import 'package:purrnote/widgets/bottom_navbar.dart';
import 'package:purrnote/screens/dashboard/calendar_page.dart';
import 'package:purrnote/screens/dashboard/pets_page.dart';
import 'package:purrnote/screens/dashboard/vet_page.dart';
import 'package:purrnote/screens/dashboard/profile_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  HomePageState createState() => HomePageState();
}

class HomePageState extends State<HomePage> {
  int _selectedIndex = 0;

  final List<Widget> _pages = const [
    HomeScreen(),
    CalendarPage(),
    PetsPage(),
    VetPage(),
    ProfilePage(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: "Purrnote"),
      body: _pages[_selectedIndex],
      bottomNavigationBar: CustomBottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
      ),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text(
        "Welcome to the Home Page!",
        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
      ),
    );
  }
}
