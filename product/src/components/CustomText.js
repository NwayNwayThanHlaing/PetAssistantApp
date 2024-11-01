// src/components/CustomText.js
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
    fontSize: 16, // Define any default styles you want, like font size
    // You can add other global text styles here, like lineHeight, fontFamily, etc.
  },
});

export default CustomText;
