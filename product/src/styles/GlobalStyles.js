import { StyleSheet } from "react-native";
import { colors } from "./Theme";
export const AppBarStyles = StyleSheet.create({
  safeArea: {
    flex: 0,
    backgroundColor: colors.accent,
  },
  container: {
    backgroundColor: colors.background,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
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
    fontSize: 14,
    paddingTop: 2,
  },
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: colors.primaryLightest,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    paddingBottom: 20,
    zIndex: 10,
  },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
