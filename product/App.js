import React, { useState, useEffect } from "react";
import * as Font from "expo-font";
import { View, ActivityIndicator } from "react-native";
import MyStack from "./src/MyStack";
import { ThemeProvider } from "./src/contexts/ThemeContext";

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    await Font.loadAsync({
      "NerkoOne-Regular": require("./assets/fonts/NerkoOne-Regular.ttf"),
    });
    setFontsLoaded(true);
  };

  useEffect(() => {
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <MyStack />
    </ThemeProvider>
  );
};

export default App;
