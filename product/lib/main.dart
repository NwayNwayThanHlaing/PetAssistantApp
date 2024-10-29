import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:purrnote/screens/auth/signup.dart';
import 'package:purrnote/screens/auth/login.dart';
import 'package:purrnote/screens/dashboard/home_page.dart'; // Import your home page
import 'package:firebase_core/firebase_core.dart';
import 'firebase/firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Firebase initialization with error handling
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (e) {
    runApp(const ProviderScope(child: MaterialApp(home: ErrorScreen())));
    return;
  }

  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Pet Assistant App',
      initialRoute: '/login', // Set the initial route
      routes: {
        '/login': (context) => Login(),
        '/signup': (context) => const Signup(),
        '/': (context) => const HomePage(),
      },
    );
  }
}

// Error screen for Firebase initialization errors
class ErrorScreen extends StatelessWidget {
  const ErrorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Error')),
      body: const Center(child: Text('Failed to initialize Firebase.')),
    );
  }
}
