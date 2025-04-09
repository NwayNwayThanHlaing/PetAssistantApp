import { StyleSheet } from "react-native";
import { colors } from "./Theme";

const AuthStyles = StyleSheet.create({
  // logo image
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  logoContainer: {
    backgroundColor: colors.primaryLightest,
    height: 250,
    borderBottomLeftRadius: 90,
    borderBottomRightRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
  },
  logo: {
    width: 110,
    height: 110,
    resizeMode: "contain",
  },
  // logo title
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  // form container
  formContainer: {
    paddingHorizontal: 30,
    marginTop: 50,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color: colors.primary,
  },
  subheading: {
    fontSize: 18,
    color: colors.primaryLighter,
    marginBottom: 30,
  },
  input: {
    height: 60,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: colors.light,
    fontSize: 18,
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.accent,
    height: 60,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 5,
  },
  icon: {
    alignSelf: "center",
  },
  loginText: {
    textAlign: "center",
    fontSize: 16,
    color: colors.primary,
  },
  loginLink: {
    color: colors.accent,
    fontWeight: "bold",
  },
});

export default AuthStyles;
