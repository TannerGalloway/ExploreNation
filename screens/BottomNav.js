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
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabsContainer,
        tabBarLabelStyle: styles.tabLabel,
      }}>
      <Tab.Screen name="Home" options={{ tabBarIcon: () => <Entypo name="home" size={24} color="white" /> }} component={Home} />
      <Tab.Screen name="Discover" options={{ tabBarIcon: () => <Ionicons name="compass" size={24} color="white" /> }} component={Discover} />
      <Tab.Screen name="Favorites" options={{ tabBarIcon: () => <FontAwesome name="heart" size={24} color="white" /> }} component={Favorites} />
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
