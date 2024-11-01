// src/contexts/ThemeContext.js
import React, { createContext, useContext } from "react";

// Define the ThemeContext
const ThemeContext = createContext({
  textColor: "#4B4947", // Default text color
});

export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ textColor: "#4B4947" }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
