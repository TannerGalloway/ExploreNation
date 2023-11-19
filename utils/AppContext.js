import { createContext, useState } from "react";

export const AppContext = createContext(null);

export default function AppContextProvider({ children }) {
  const [screenData, setScreenData] = useState(null);
  const contextValues = { screenData, setScreenData };

  return <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>;
}
