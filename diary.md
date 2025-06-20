## Term 2

### Week 12 (7 April 2025)

Summary:

- Added Privacy Policy page for the users' awareness of how the data collected will be utilized, stored, and the users’ privacy rights.
- Added minor features such as adding date and time for the chat messages, visualization of the chat with unread messages, 'view profile' button at the beginning of the chat, implementation of chat deletion, and direct navigation to the chat room when clicking on message button from the user account profile.
- Submitted the final report and deployed the last build of the application.

Challenges:

- Handling the submission of all deliverables in the required format and structure while ensuring nothing was missed.

### Week 11 (31 March 2025)

Summary:

- Tested all the functions of the project and prepared for the project submission, including all documentation, presentation slides, and demo video.
- Refactored and reviewed all the feature and tests in the application to ensure all core features were functional and the UI was polished.

Challenges:

- Considering potential edge cases for all implemented features and addressing them as much as possible during the final stages of development.

### Week 10 (24 March 2025)

Summary: 

- Prepared the final project report and began creating presentation materials.
- Conducted testings across all screens and devices to ensure consistent user experience.
- Implemented support for screen orientation changes to improve UI responsiveness on different devices.

Challenges: 

- Ensuring app responsiveness and proper layout behavior across both portrait and landscape orientations required additional UI adjustments and testing across devices.

Next Step: 
- Finalize demo video and perform final documentation checks 

### Week 9 (17 March 2025)

Summary: 

- Implemented chat inbox and finalized chat room with real time messaging feature when clicking on message button of user's profile, with options to delete for myself, delete for everyone and edit option the message within 3 minutes after being sent.
- Developed post uploading, media uploading up to 9 photos as a post on user's wall.
- Implemented recurring events creation and deletion with options to delete only this event, this and all future occurrences, delete entire series.
- Adjusted colors and fonts all over the application, and fixed read/unread uni not displaying for notifications.
- Started working on the project report.

Challenges: 

- To implement recurring events in different aspects such as repeat events daily, weekly, monthly, yearly for creation and deletion with respective options.

Next Step: 

- To finish final project report and conduct the final testings.

### Week 8 (10 March 2025)

Summary: 

- Implemented user discovery feature on the map.
- Developed user account profile pages and added message feature to communicate between users
- Created account profile for each user with message button and posts.

Challenges: 

- Achieving real-time messaging functionality and proper synchronization.

Next Step: 

- To implement chat inbox and chat room with messaging feature.


### Week 6 - 7 (24 February 2025)

Summary: 

- Implemented the veterinary locator feature with markers based on real-time user geolocation. 
- Successfully displayed markers representing each veterinary clinic within the user’s current location, enhancing accessibility to local veterinary services.

Challenges: 

- To ensure indicators are correctly positioned based on real-time geolocation inputs.

Next Step: 

- To show users location on the map. This allows users to view their own positions and other pet owners nearby.

### Week 5 (17 February 2025)

Summary:

- Implemented a notification inbox with a read/unread status tracking.
- Developed separate user interfaces to display read and unread notifications.
- Integrated sending alerts to the user’s device at the scheduled time of each event.
- Implemented redirection from notifications to the calendar, to view event details.

Challenges:

- Required extensive testing of different notification methods to determine the most suitable approach, which increased development time.

Next Step:

- Develop and implement a vet locator feature.
- Enable users to find other pet owners on an interactive map.

### Week 4 (10 February 2025)

Summary:

- Conducted testing on both local notifications and Firebase notifications.
- Finalized the use of local notifications via Expo Notifications for better reliability and compatibility.
- Developed a new notification inbox that retrieves and displays notification data from Firestore.

Challenges:

- Faced difficulty in selecting the best notification method due to differences in implementation and system limitations.

Next Step:

- Implement the functionality to send notifications to users at the precise time of each scheduled event.

### Week 3 (3 February 2025)

Summary:

- Tested out all the existing features and performed code refactoring to improve efficiency and maintainability.
- Researched various notification systems to identify a suitable alternative.

Challenges:

- The existing notification system, which used Native Notify, stopped working as it required a paid subscription.

Next Step:

- Remove all implemented notification-related code.
- Develop a new notification inbox with an improved approach.

### Week 2 (27 January 2025)

Summary:

- Designed the user interface, including wireframes and basic layout structures, using Figma.

Next Step:

- Refactor the notification system to improve reliability, performance, and user experience.

### Week 1 (20 January 2025)

Summary:

- Documented detailed project requirements and outlined additional features to be developed.
- Defined a structured project plan to ensure alignment with project goals.

Next Step:

- Redesign the user interface to integrate with the existing application smoothly.

## Term 1 (12 Weeks)

### Week 12 (9 December 2024)

Summary: - Refactored the app for improvements and fixed bugs. - Completed the report, demonstration video, diary, and documentation. - Conducted testing on the app to ensure stability. - Completed the presentation for the project.
Challenges: - No issues encountered.
Next Step: - Continue work on Term 2, focusing on social networking features and backend integration.

### Week 11 (2 December 2024)

Summary: - Tested NativeNotify in a different project for testing purposes. - Implemented the reminder notification feature. - Created the notification inbox to manage reminders. - Added month and year selectors for the calendar. - Added a flexible date selector for event creation in the calendar. - Completed preparations for the presentation and demonstration video. - Made a release and tagged the first version of the Minimum Viable Product.
Challenges: - No issues encountered.
Next Step: - Continue with the report and refine the presentation.

### Week 10 (24 November 2024)

Summary: - Ensured all features had a consistent UI design. - Improved the calendar feature by displaying appointments for better user experience. - Modified vet appointment database models for easier access. - Refactored the home page for better navigation. - Tested each feature for functionality and user experience.
Challenges: - Encountered challenges with implementing notifications, as Firebase stopped providing certain features for free.
Next Step: - Test the notification system with NativeNotify. - Refactor layouts and UI designs. - Begin working on the report and presentation.

### Week 9 (18 November 2024)

Summary: - Implemented the reminder page to manage pet care reminders. - Fixed layout issues and performed UI touch-ups for all pages. - Researched notification systems to find a suitable solution.
Challenges: - No challenges encountered.
Next Step: - Conduct testing and refactor as needed.

### Week 8 (11 November 2024)

Summary: - Fixed bugs from previously implemented pages (calendar and events) to align with the updated code. - Implemented calendar events with features like DatePicker and EventPicker. - Designed event CRUD modals for easier management. - Updated calendar events to change instantly when updated in the database. - Created the reminder page to display data from the database.
Challenges: - Everything worked as expected.
Next Step: - Finalize the reminder system and implement the notification page. - Test all existing pages.

### Week 7 (4 November 2024)

Summary: - Implemented the pet profile feature, allowing for multiple profiles. - Connected to cloud image upload for user and pet profile photos. - Designed the calendar with basic CRUD functionalities for events. - Displayed events on the calendar for better user interaction. - Developed CRUD functionality for events on the calendar. - Developed the vet appointment page and connected it to the database.
Challenges: - Initially implemented a yearly view for the calendar, but it was less effective than the monthly view. - Opted to implement a monthly view with the ability to scroll left and right, which proved more user-friendly.
Next Step: - Implement reminders for the events in the calendar.

### Week 6 (28 October 2024)

Summary: - Implemented user profile features including password change and account deletion using Flutter. - Switched the framework to React Native, as Flutter was not compatible with the project’s requirements. - Implemented authentication features: login and signup.
Challenges: - Encountered difficulties with Firebase integration in Flutter, which led to the switch to React Native. - Switching required redoing the setup and pages, but it improved the development process.
Next Step: - Continue developing pet profiles and calendar functionality.

### Week 5 (21 October 2024)

Summary: - Created a structured layout, aligned with GitLab guidelines. - Implemented login and signup pages with authentication. - Created the dashboard or landing page for user interaction.
Challenges: - Implementing authentication took a significant amount of time due to complexity.
Next Step: - Continue with the dashboard implementation.

### Week 4 (14 October 2024)

Summary: - Initiated small projects to test the most suitable technologies. - Tested Flutter and Firebase by creating mock projects like a to-do list and counter. - Researched Flutter Riverpod for state management.
Challenges: - Lack of familiarity with Flutter.
Next Step: - Start structuring the project layout and implement authentication.

### Week 3 (7 October 2024)

Summary: - Designed the UI/UX of the app.
Next step: - Test the intended technology stack for the project.

### Week 2 (1 October 2024)

Summary: - Listed all user requirements. - Drafted the project plan document.
Next Step: - Begin structuring the project and researching technologies.

### Week 1 (23 September 2024)

Summary: - Conducted research on similar apps to understand the key features and competitive landscape.
Next Step: - Continue refining the project plan based on findings.
