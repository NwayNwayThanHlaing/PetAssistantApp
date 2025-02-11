import React from "react";
import { Text as RNText, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

const CustomText = ({ style, children, ...props }) => {
  const { textColor } = useTheme(); // Get the global color from ThemeContext

  return (
    <RNText
      style={[{ color: textColor }, styles.defaultText, style]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    fontSize: 16,
  },
});

export default CustomText;
