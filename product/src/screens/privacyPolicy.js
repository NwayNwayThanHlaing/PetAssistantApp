import React from "react";
import { ScrollView, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../styles/Theme";

const PrivacyPolicy = ({ navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.header}>PURRNOTE Privacy Policy</Text>
        <Text style={styles.date}>Last Updated: April 10, 2025</Text>

        <Text style={styles.section}>1. Introduction</Text>
        <Text style={styles.text}>
          PURRNOTE is committed to protecting your personal data. This Privacy
          Policy explains how we collect, use, and safeguard your information
          when you use our mobile application.
        </Text>

        <Text style={styles.section}>2. Information We Collect</Text>
        <Text style={styles.text}>
          We collect information that you provide directly and indirectly when
          using PURRNOTE, including:
        </Text>
        <Text
          style={
            (styles.text,
            {
              marginLeft: 10,
              lineHeight: 20,
            })
          }
        >
          • Name, email address, and profile picture (via Firebase
          Authentication){"\n"}• Pet profiles (name, breed, age, health notes,
          etc.){"\n"}• Calendar events, reminders, and diary posts{"\n"}•
          Uploaded media (images through Cloudinary){"\n"}• Location data (for
          vet locator and user discovery via Google Maps){"\n"}• Notification
          preferences (using Expo Notifications)
        </Text>

        <Text style={styles.section}>3. How We Use Your Information</Text>
        <Text style={styles.text}>
          Your data is used to personalize your app experience, send reminders,
          improve functionality, and deliver relevant services such as vet
          locations and messaging features.
        </Text>

        <Text style={styles.section}>4. Data Storage and Security</Text>
        <Text style={styles.text}>
          We store your data using secure services including Firebase and
          Cloudinary. Data is protected using HTTPS encryption, authentication
          checks, and Firestore Security Rules. Users cannot access others'
          private data.
        </Text>

        <Text style={styles.section}>5. Third-Party Services</Text>
        <Text style={styles.text}>
          We work with trusted providers such as Firebase, Cloudinary, Expo
          Notifications, and Google Maps. These services may process some data
          as part of providing functionality within the app.
        </Text>

        <Text style={styles.section}>6. Your Privacy Rights</Text>
        <Text style={styles.text}>
          You have the right to access, correct, or delete your personal data.
          You can manage this within the app (e.g., edit profile, delete
          account), or contact us if needed.
        </Text>

        <Text style={styles.section}>7. Data Retention</Text>
        <Text style={styles.text}>
          We retain your data only for as long as your account is active. Upon
          account deletion, your data will be permanently removed from our
          systems.
        </Text>

        <Text style={styles.section}>8. Children’s Privacy</Text>
        <Text style={styles.text}>
          PURRNOTE is not intended for children under 13. We do not knowingly
          collect data from children without parental consent.
        </Text>

        <Text style={styles.section}>9. Changes to This Policy</Text>
        <Text style={styles.text}>
          This policy may be updated periodically. Users will be notified of
          significant changes via the app. Continued use of the app implies
          acceptance of the updated policy.
        </Text>

        <Text style={styles.section}>10. Contact Us</Text>
        <Text style={styles.text}>
          For any questions or concerns about this Privacy Policy, please
          contact us at:{"\n"}
          <Text>Email: </Text>
          <Text style={{ color: "blue", fontWeight: "bold" }}>
            purrnote@gmail.com
          </Text>
        </Text>

        <Text style={styles.section}>11. Consent</Text>
        <Text style={styles.text}>
          By using PURRNOTE, you agree to this Privacy Policy and the collection
          and use of your data as outlined above.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  back: {
    fontSize: 16,
    color: colors.accent,
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  date: {
    fontSize: 14,
    color: "gray",
    marginBottom: 10,
  },
  section: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 6,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
});

export default PrivacyPolicy;
