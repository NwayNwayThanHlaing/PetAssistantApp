// tailwind.config.js
module.exports = {
  content: [
    "./App.js",
    "./src/**/*.{js,jsx,ts,tsx}", // Update paths based on your project structure
  ],
  presets: [require("nativewind/preset")], // Make sure NativeWind preset is added here
  theme: {
    extend: {
      colors: {
        primary: "#4B4947", // Dark gray for primary text
        primaryLight: "#4B4947A1", // Dark gray with 63% opacity
        primaryLighter: "#4B49471A", // Dark gray with 10% opacity
        background: "#F4F3F3", // Light background color
        accent: "#EC7A5C", // Accent color
      },
    },
  },
  plugins: [],
};
