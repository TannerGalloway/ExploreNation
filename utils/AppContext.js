import { createContext, useState } from "react";
import { useColorScheme } from "react-native";

export const AppContext = createContext(null);

export default function AppContextProvider({ children }) {
  const colorScheme = useColorScheme();
  const [screenData, setScreenData] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [appTheme, setAppTheme] = useState(colorScheme == "dark" ? 2 : 1);
  const [tempDisplay, setTempDisplay] = useState(1);
  const [prevAppTheme, setPrevAppTheme] = useState(colorScheme == "dark" ? 2 : 1);
  const [prevTempDisplay, setPrevTempDisplay] = useState(1);
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const contextValues = {
    screenData,
    setScreenData,
    currentLocation,
    setCurrentLocation,
    appTheme,
    setAppTheme,
    tempDisplay,
    setTempDisplay,
    prevAppTheme,
    setPrevAppTheme,
    prevTempDisplay,
    setPrevTempDisplay,
    username,
    setUsername,
    profilePic,
    setProfilePic,
  };

  return <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>;
}
