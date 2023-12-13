import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome, Entypo, Ionicons } from "@expo/vector-icons";
import Home from "./Home";
import Discover from "./Discover";
import Favorites from "./Favorites";

const Tab = createBottomTabNavigator();

export default function BottomNav() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabsContainer,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => {
          switch (route.name) {
            case "Home":
              return <Entypo name="home" size={24} color={focused ? "#00A8DA" : "white"} />;

            case "Discover":
              return <Ionicons name="compass" size={24} color={focused ? "#00A8DA" : "white"} />;

            case "Favorites":
              return <FontAwesome name="heart" size={24} color={focused ? "#00A8DA" : "white"} />;
          }
        },
      })}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Discover" component={Discover} />
      <Tab.Screen name="Favorites" component={Favorites} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    backgroundColor: "#252B34",
    borderTopColor: "#252B34",
  },

  tabLabel: {
    color: "white",
    fontFamily: "RalewayBold",
    fontSize: 16,
  },
});
