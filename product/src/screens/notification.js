import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import {
  getIndieNotificationInbox,
  deleteIndieNotificationInbox,
} from "native-notify";
import { auth } from "../auth/firebaseConfig";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../styles/Theme";

export default function IndieNotificationInbox({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const userId = auth.currentUser.uid;

  // Function to fetch notifications from Native Notify
  const fetchNotifications = async () => {
    try {
      const response = await getIndieNotificationInbox(
        userId,
        25248,
        "wtOK6Mg9wWTJpjgjr1qH0v",
        10,
        0
      );

      const notifications = Array.isArray(response) ? response : [];
      if (notifications.length > 0) {
        setData(notifications);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications: ", error);
      setLoading(false);
      Alert.alert("Error", "Failed to load notifications.");
    }
  };

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Function to delete a notification by ID
  const handleDeleteNotification = async (notificationId) => {
    const notifications = await deleteIndieNotificationInbox(
      userId,
      notificationId,
      25248,
      "wtOK6Mg9wWTJpjgjr1qH0v"
    );
    setData(notifications);
    setModalVisible(false);
  };

  // Function to handle the modal confirmation
  const showDeleteAlert = (notificationId) => {
    setSelectedNotificationId(notificationId);
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        {
          text: "Cancel",
          onPress: () => setModalVisible(false),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => handleDeleteNotification(notificationId),
          style: "destructive",
        },
      ]
    );
  };

  const renderNotifications = data.map((item, index) => {
    const dateParts = item.date.split("-");
    const [month, day, year] = dateParts;
    const formattedDate = `${day}-${month}-${year}`; // Convert to dd-mm-yyyy

    return (
      <View key={item.notification_id} style={styles.notificationItem}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={styles.notificationTitle}>{item.title}</Text>

          {/* Three dots button */}
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <MaterialIcons name="more-vert" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationDate}>
          {formattedDate} {item.time}
        </Text>
      </View>
    );
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.back}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Notification Inbox</Text>

          {loading ? (
            <Text>Loading...</Text>
          ) : data.length > 0 ? (
            renderNotifications
          ) : (
            <Text
              style={{
                textAlign: "center",
                fontSize: 16,
                color: colors.primaryLighter,
              }}
            >
              No notifications found.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Modal for delete confirmation */}
      {modalVisible && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalBackground}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalHeader}>Delete Notification</Text>
                  <Text style={styles.modalText}>
                    Are you sure you want to delete this notification?
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => showDeleteAlert(selectedNotificationId)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  notificationItem: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  notificationMessage: {
    fontSize: 16,
    color: colors.primaryLight,
    marginTop: 3,
  },
  notificationDate: {
    fontSize: 16,
    color: colors.primaryLight,
    marginTop: 3,
  },
  deleteButton: {
    backgroundColor: "#f00",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.primary,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    color: colors.primary,
  },
});
