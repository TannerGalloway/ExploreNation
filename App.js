import { useState, useEffect } from "react";
import { TouchableWithoutFeedback } from "react-native";
import { useFonts } from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { supabase } from "./utils/supabaseClient";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { FontAwesome, Entypo } from "@expo/vector-icons";
import "react-native-gesture-handler";
import Welcome from "./screens/Welcome";
import Login from "./screens/Login";
import Register from "./screens/Register";
import ForgotPassword from "./screens/ForgotPassword";
import ResetPassword from "./screens/ResetPassword";
import CheckEmail from "./screens/CheckEmail";
import BottomTabs from "./screens/BottomTabs";
import AttractionDetails from "./screens/AttractionDetails";
import DestinationDetails from "./screens/DestinationDetails";

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
    RalewayBold: require("./assets/fonts/Raleway-Bold.ttf"),
  });

  if (!loaded) {
    return null;
  }

  const Stack = createNativeStackNavigator();

  return (
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
                component={BottomTabs}
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
                  headerRight: () => (
                    <>
                      <TouchableWithoutFeedback
                        onPress={() => {
                          console.log("Liked");
                        }}>
                        <FontAwesome name="heart-o" size={24} color="white" />
                      </TouchableWithoutFeedback>
                      <TouchableWithoutFeedback
                        onPress={() => {
                          console.log("Shared");
                        }}>
                        <Entypo name="share" style={{ marginLeft: 35, marginRight: 10 }} size={24} color="white" />
                      </TouchableWithoutFeedback>
                    </>
                  ),
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
                  headerRight: () => (
                    <>
                      <TouchableWithoutFeedback
                        onPress={() => {
                          console.log("Liked");
                        }}>
                        <FontAwesome name="heart-o" size={26} color="white" />
                      </TouchableWithoutFeedback>
                      <TouchableWithoutFeedback
                        onPress={() => {
                          console.log("Map Opened");
                        }}>
                        <FontAwesome name="map-marker" size={28} color="white" style={{ marginLeft: 35, marginRight: 10 }} />
                      </TouchableWithoutFeedback>
                    </>
                  ),
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </BottomSheetModalProvider>
    </NavigationContainer>
  );
}
