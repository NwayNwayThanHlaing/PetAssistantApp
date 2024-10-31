# Final Year Project

This repository has been created to store your final year project.

You may edit it as you like, but please do not remove the default topics or the project members list. These need to stay as currently defined in order for your supervisor to be able to find your project.

# Pet Assistant

**Pet Assistant** is an application designed to help pet owners manage their pets' health, appointments, and daily activities. This app aims to provide a convenient platform for users to keep track of their pets' needs and schedules.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Project Overview

The **Pet Assistant** app allows users to:

- Create and manage pet profiles
- Schedule appointments and reminders
- Keep track of vaccinations and health records
- Access the calendar to view and schedule daily tasks for pets
- Connect with veterinarians and pet services

## Features

- User authentication with Firebase Auth
- Cloud Firestore integration for data storage
- Intuitive user interface for managing pet information
- Notifications for important pet-related events

## Technologies Used

- **React Native**: UI toolkit for building natively compiled applications
- **Firebase**: Backend services for authentication and database
- **React Context API**: Simple state management solution for React Native

## Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

Expo - a developer tool for creating experiences with interactive gestures and graphics using JavaScript and React.

- Download Expo Go app on your android or ios device

### Installation

1. Clone the repository:

   ```bash
   git clone https://gitlab.cim.rhul.ac.uk/wlis130/PROJECT.git
   cd PROJECT/product
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

## Running the App

To run the React Native app on an iOS simulator, follow these steps:

1. **Open Xcode**:

   - Launch Xcode and open the iOS Simulator from **Xcode > Open Developer Tool > Simulator** if you would like to use simulator.

2. **Run the App**:

   - Open your terminal and navigate to the root of the project directory.
   - Use the following command to run the app:

     ```bash
     npm expo start
     ```

     or

     ```bash
     npm start
     ```

   - Scan the QR code shown on the terminal with your camera, it will then lead to Expo Go app and then will display the app.

## Usage

Once the app is launched, you can:

- **Sign Up / Log In**: Create a new account or log in with existing credentials.
- **Manage Pet Profiles**: Add and edit information about your pets, including health records and vaccination history.
- **Schedule Appointments**: Use the calendar feature to set reminders for vet visits or grooming sessions.
- **Notifications**: Receive alerts for important events related to your pets.

## License

This project is an individual project and is not licensed for redistribution. All rights reserved.
