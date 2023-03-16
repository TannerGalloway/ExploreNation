import Welcome from "./screens/Welcome";
import { useFonts } from "expo-font";

export default function App() {
  // Load Fonts
  const [loaded] = useFonts({
    RalewayRegular: require("./assets/fonts/Raleway-Regular.ttf"),
    RalewayMedium: require("./assets/fonts/Raleway-Medium.ttf"),
    RalewaySemiBold: require("./assets/fonts/Raleway-SemiBold.ttf"),
    RalewayBold: require("./assets/fonts/Raleway-SemiBold.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return <Welcome />;
}
