import { useState, useEffect } from "react";
import { useFonts } from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { supabase } from "./utils/supabaseClient";
import Welcome from "./screens/Welcome";
import Login from "./screens/Login";
import Register from "./screens/Register";
import ForgotPassword from "./screens/ForgotPassword";
import ResetPassword from "./screens/ResetPassword";
import CheckEmail from "./screens/CheckEmail";
import Home from "./screens/Home";

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
  const [loaded] = useFonts({
    RalewayRegular: require("./assets/fonts/Raleway-Regular.ttf"),
    RalewayMedium: require("./assets/fonts/Raleway-Medium.ttf"),
    RalewaySemiBold: require("./assets/fonts/Raleway-SemiBold.ttf"),
    RalewayBold: require("./assets/fonts/Raleway-SemiBold.ttf"),
  });

  if (!loaded) {
    return null;
  }

  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
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
              name="Home"
              component={Home}
              options={{
                animationTypeForReplace: session ? "push" : "pop",
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
