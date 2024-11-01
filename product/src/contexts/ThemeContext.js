import React, { createContext, useContext } from "react";
import { colors } from "../styles/Theme";

const ThemeContext = createContext({
  textColor: colors.primary, // Default text color globally
});

export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ textColor: colors.primary }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
