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
              </>
            )}
          </Stack.Navigator>
        </BottomSheetModalProvider>
      </NavigationContainer>
    </AppContextProvider>
  );
}
