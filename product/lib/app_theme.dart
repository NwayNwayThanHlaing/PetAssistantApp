import 'package:flutter/material.dart';

class AppTheme {
  // Define your colors here
  static const Color primaryColor = Color(0xffEC7A5C);
  static const Color secondaryColor = Color.fromARGB(255, 59, 57, 57);
  static const Color hoverColor = Color.fromARGB(255, 206, 96, 69);
  static const Color backgroundColor = Color.fromARGB(255, 206, 200, 200);
  static const Color barColor = Color.fromARGB(255, 226, 224, 227);

  // Define text styles here
  static const TextStyle headline1 = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: secondaryColor,
  );

  static const TextStyle bodyText = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.normal,
    color: Colors.black,
  );

  static const TextStyle buttonText = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  );

  static const Image logo = Image(
    image: AssetImage('assets/logo.png'),
    height: 100,
  );
}
