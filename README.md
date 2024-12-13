# Final Year Project - Pet Assistant App, Purrnote

# Project Directory Structure

This directory contains all the necessary files for the project. Below is a description of the structure and the contents of each directory and file. Once you have cloned the repository, it will contain these files in the folder.

/PROJECT
    ├── diary.md              # A Markdown file that logs your weekly progress with summary, challenges and next step
    ├── /documents/           # Contains submitted documents such as reports and planning files
    │   ├── NwayNwayThanHlaing-plan.pdf  # Submitted project plan
    │   ├── NwayNwayThanHlaing.Interim.pdf  # Interim report of the project
    ├── /product/             # This is the app’s main folder, the actual source code to run
    ├── README.md             # This file, which explains the structure of the project


## Project Source Code Folder
The folder product in the PROJECT folder contains the main source code of the app with the following structure:

/product
    ├── .expo/                # Contains Expo related files and build data
    ├── /assets/              # Contains static files such as images, fonts, and icons
    │   ├── /fonts/           # Custom fonts used in the app 
    |   |   ├── NerkoOne-Regular.ttf    # NerkoOne-Regular font file to set the custom font globally   
    │   ├── adaptive-icon.png 
    │   ├── calendar.png      
    │   ├── dog.png           
    │   ├── favicon.png       
    │   ├── home.jpg          
    │   ├── icon.png          
    │   ├── logo.png          
    │   ├── nothing.png       
    │   ├── profile.jpg       
    │   ├── splash.png        
    │   ├── vet.png           
    ├── /node_modules/        # Contains installed npm dependencies
    ├── /src/                 # Source code folder for the application
    │   ├── /actions/         # Contains authentication and user action-related files
    │   │   ├── authActions.js  # Handles authentication actions
    │   │   ├── userActions.js  # Handles user-related actions
    │   ├── /auth/            # Handles authentication logic and Firebase integration
    │   │   ├── firebaseConfig.js  # Firebase configuration settings
    │   │   ├── login.js         # Login screen and logic
    │   │   ├── signup.js        # Signup screen and logic
    │   ├── /components/       # Reusable components used across screens
    │   │   ├── AppBar.js      # AppBar component
    │   │   ├── BottomNavBar.js  # Bottom navigation bar component
    │   │   ├── CustomText.js  # Custom text component for setting up global theme
    │   ├── /contexts/         # Contains context providers for state management
    │   │   ├── ThemeContext.js  # Manages theme-related context
    │   ├── /screens/          # Contains screen components
    │   │   ├── /calendar/     # Calendar-related components and screens
    │   │   │   ├── addEventModal.js  # Modal to add events to the calendar
    │   │   │   ├── calendar.js      # Main calendar Screen
    │   │   │   ├── eventList.js     # Event listing component used in calendar page
    │   │   │   ├── firestoreService.js  # Service for interacting with Firestore
    │   │   │   ├── updateEventModal.js  # Modal for updating events
    │   │   ├── /pets/          # Pet-related components and screens
    │   │   │   ├── addPet.js   # Modal to add pet
    │   │   │   ├── booking.js  # Booking Screen
    │   │   │   ├── pets.js     # All pets Screen
    │   │   │   ├── profile.js  # Individual pet profile Screen
    │   │   ├── dashboard.js  # Main dashboard Screen
    │   │   ├── home.js     # Home Screen
    │   │   ├── notification.js  # notification inbox Screen
    │   │   ├── reminder.js    # reminder component used in home page
    │   ├── /styles/           # Contains global styles for the app
    │   │   ├── AuthStyles.js  # Styles for authentication screens
    │   │   ├── GlobalStyles.js  # General app-wide styles
    │   │   ├── ProfileStyles.js  # Styles for user profile-related screens
    │   │   ├── Theme.js       # App theme configuration
    │   │   ├── MyStack.js     # Navigation stack configuration
    ├── .gitignore             # Specifies which files should not be tracked by Git
    ├── App.js                 # Main entry point of the app
    ├── app.json               # Configuration file for Expo
    ├── babel.config.js        # Babel configuration for React Native
    ├── package-lock.json      # Locks the dependencies versions
    ├── package.json           # Defines project dependencies and scripts
