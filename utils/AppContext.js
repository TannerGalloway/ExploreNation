import { createContext, useState } from "react";

export const AppContext = createContext(null);

export default function AppContextProvider({ children }) {
  const [screenData, setScreenData] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const contextValues = { screenData, setScreenData, currentLocation, setCurrentLocation };

  return <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>;
}
