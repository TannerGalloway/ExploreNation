import { useState, useEffect } from "react";
import { useFonts } from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { supabase } from "./utils/supabaseClient";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import "react-native-gesture-handler";
import Welcome from "./screens/Welcome";
import Login from "./screens/Login";
import Register from "./screens/Register";
import ForgotPassword from "./screens/ForgotPassword";
import ResetPassword from "./screens/ResetPassword";
import CheckEmail from "./screens/CheckEmail";
import BottomNav from "./screens/BottomNav";
import AttractionDetails from "./screens/AttractionDetails";
import DestinationDetails from "./screens/DestinationDetails";
import Discover from "./screens/Discover";
import ScreenHeader from "./components/ScreenHeader";
import AppContextProvider from "./utils/AppContext";
import Favorites from "./screens/Favorites";
import Map from "./screens/Map";
import Settings from "./screens/Settings/SettingsMain";
import SettingsSubMenu from "./screens/Settings/SettingsSubMenu";
import PasswordSettings from "./screens/Settings/SettingsSecurity";
import AccountSettings from "./screens/Settings/SettingsAccount";

export default function App() {
  const [session, setSession] = useState(null);

  // Check session status of current user.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });
  }, []);

  // Load Fonts
  const [fontsLoaded] = useFonts({
    RalewayRegular: require("./assets/fonts/Raleway-Regular.ttf"),
    RalewayMedium: require("./assets/fonts/Raleway-Medium.ttf"),
    RalewaySemiBold: require("./assets/fonts/Raleway-SemiBold.ttf"),
    RalewayBold: require("./assets/fonts/Raleway-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  const Stack = createNativeStackNavigator();

  return (
    <AppContextProvider>
      <NavigationContainer>
        <BottomSheetModalProvider>
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
              headerShown: false,
            }}>
            {session == null ? (
              <>
                <Stack.Screen
                  name="Welcome"
                  component={Welcome}
                  options={{
                    animationTypeForReplace: session ? "push" : "pop",
                  }}
                />
                <Stack.Screen name="Register" component={Register} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
                <Stack.Screen name="ResetPassword" component={ResetPassword} />
                <Stack.Screen name="CheckEmail" component={CheckEmail} />
              </>
            ) : (
              <>
                <Stack.Screen
                  name="Current Tab"
                  component={BottomNav}
                  options={{
                    animationTypeForReplace: session ? "push" : "pop",
                  }}
                />
                <Stack.Screen
                  name="AttractionDetails"
                  component={AttractionDetails}
                  options={{
                    headerShown: true,
                    title: "",
                    headerStyle: {
                      backgroundColor: "#101d23",
                    },
                    headerTintColor: "#fff",
                    headerShadowVisible: false,
                    headerRight: () => <ScreenHeader ScreenType={"AttractionDetails"} />,
                  }}
                />
                <Stack.Screen
                  name="DestinationDetails"
                  component={DestinationDetails}
                  options={{
                    headerShown: true,
                    title: "",
                    headerStyle: {
                      backgroundColor: "#101d23",
                    },
                    headerTintColor: "#fff",
                    headerShadowVisible: false,
                    headerRight: () => <ScreenHeader ScreenType={"DestinationDetails"} />,
                  }}
                />
                <Stack.Screen
                  name="Discover"
                  component={Discover}
                  options={{
                    headerShown: true,
                    title: "",
                    headerStyle: {
                      backgroundColor: "#101d23",
                    },
                    headerTintColor: "#fff",
                    headerShadowVisible: false,
                  }}
                />
                <Stack.Screen
                  name="Favorites"
                  component={Favorites}
                  options={{
                    headerShown: true,
                    title: "",
                    headerStyle: {
                      backgroundColor: "#101d23",
                    },
                    headerTintColor: "#fff",
                    headerShadowVisible: false,
                  }}
                />
                <Stack.Screen
                  name="Map"
                  component={Map}
                  options={{
                    title: "",
                    headerShown: true,
                    headerTransparent: true,
                    cardOverlayEnabled: true,
                    headerTintColor: "#fff",
                  }}
                />
                <Stack.Screen
                  name="Settings"
                  component={Settings}
                  options={{
                    headerShown: true,
                    title: "Settings",
                    headerStyle: {
                      backgroundColor: "#101d23",
                    },
                    headerTintColor: "#fff",
                    headerShadowVisible: false,
                  }}
                />
                <Stack.Screen
                  name="SettingsSubMenu"
                  component={SettingsSubMenu}
                  options={{
                    headerShown: true,
                    title: "",
                    headerStyle: {
                      backgroundColor: "#101d23",
                    },
                    headerTintColor: "#fff",
                    headerShadowVisible: false,
                  }}
                />
                <Stack.Screen
                  name="PasswordSettings"
                  component={PasswordSettings}
                  options={{
                    headerShown: true,
                    title: "",
                    headerStyle: {
                      backgroundColor: "#101d23",
                    },
                    headerTintColor: "#fff",
                    headerShadowVisible: false,
                  }}
                />
                <Stack.Screen
                  name="AccountSettings"
                  component={AccountSettings}
                  options={{
                    headerShown: true,
                    title: "",
                    headerStyle: {
                      backgroundColor: "#101d23",
                    },
                    headerTintColor: "#fff",
                    headerShadowVisible: false,
                  }}
                />
              </>
            )}
          </Stack.Navigator>
        </BottomSheetModalProvider>
      </NavigationContainer>
    </AppContextProvider>
  );
}
