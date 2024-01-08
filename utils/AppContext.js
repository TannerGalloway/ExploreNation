import { createContext, useState } from "react";

export const AppContext = createContext(null);

export default function AppContextProvider({ children }) {
  const [screenData, setScreenData] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [appTheme, setAppTheme] = useState(2);
  const [tempDisplay, setTempDisplay] = useState(1);
  const [prevAppTheme, setPrevAppTheme] = useState(2);
  const [prevTempDisplay, setPrevTempDisplay] = useState(1);
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
  };

  return <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>;
}
