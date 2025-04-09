import React from "react";
import { ScrollView, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../styles/Theme";

const PrivacyPolicy = ({ navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.header}>PURRNOTE Privacy Policy</Text>
        <Text style={styles.date}>Last Updated: April 7, 2025</Text>
        <Text style={styles.section}>1. Information We Collect</Text>
        <Text style={styles.text}>
          We collect user data like name, email, pet info, calendar events,
          uploaded content, and location data if enabled.
        </Text>
        <Text style={styles.section}>2. How We Use Your Information</Text>
        <Text style={styles.text}>
          Your data helps manage reminders, personalize features, and provide
          notifications and location services.
        </Text>
        <Text style={styles.section}>3. Data Storage and Protection</Text>
        <Text style={styles.text}>
          We use Firebase and Cloudinary with security rules and encryption to
          protect your data.
        </Text>
        <Text style={styles.section}>4. Third-Party Services</Text>
        <Text style={styles.text}>
          We use Firebase, Cloudinary, Google Maps, and Native Notify. These may
          process some data as needed.
        </Text>
        <Text style={styles.section}>5. Your Privacy Rights</Text>
        <Text style={styles.text}>
          You may access, update, or delete your data. Contact us if needed.
        </Text>
        <Text style={styles.section}>6. Data Retention</Text>
        <Text style={styles.text}>
          Data is kept while your account is active. Deleting your account
          removes your data.
        </Text>
        <Text style={styles.section}>7. Children’s Privacy</Text>
        <Text style={styles.text}>
          PURRNOTE is not for children under 13. We do not knowingly collect
          data from them.
        </Text>
        <Text style={styles.section}>8. Changes to This Policy</Text>
        <Text style={styles.text}>
          We may update this policy. We’ll notify users of any major changes
          within the app.
        </Text>
        <Text style={styles.section}>9. Contact Us</Text>
        <Text style={styles.text}>
          If you have questions, please feel free to reach us at:{" "}
          <Text
            style={{
              color: "blue",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            purrnote@gmail.com {"\n"}
          </Text>
        </Text>
        <Text style={styles.text}>
          This Privacy Policy explains how PURRNOTE collects, uses, and protects
          your information. By using our app, you agree to the collection and
          use of information in accordance with this policy. {"\n"}
          PURRNOTE is committed to protecting your privacy. We will not share
          your personal information with third parties without your consent,
          except as required by law or as necessary to provide our services.
          {"\n"}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: colors.light,
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
  },
  section: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 6,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
});

export default PrivacyPolicy;
