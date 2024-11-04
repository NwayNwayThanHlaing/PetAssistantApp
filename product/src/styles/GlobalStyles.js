import { StyleSheet } from "react-native";
import { colors } from "./Theme";

export const AppBarStyles = StyleSheet.create({
  safeArea: {
    flex: 0, // Prevent the SafeAreaView from taking up unnecessary space
    backgroundColor: colors.background, // Match with AppBar background color
  },
  container: {
    backgroundColor: colors.background,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    color: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLightest,
  },
  title: {
    fontSize: 18,
    marginLeft: 10,
    fontWeight: "bold",
    color: colors.primary,
  },
});
export const BottomNavBarStyles = StyleSheet.create({
  iconText: {
    color: colors.primary,
    fontSize: 12,
    paddingTop: 2,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: colors.primaryLightest,
    paddingVertical: 10,
    position: "relative",
  },
  button: {
    flex: 1, // Each button takes equal width
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },
  accentBar: {
    position: "absolute",
    top: 0,
    height: 4,
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
});
export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GlobalStyles;
