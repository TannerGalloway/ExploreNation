import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./Home";
import { Entypo } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function NavTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabsContainer,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: () => <Entypo name="home" size={24} color="white" />,
      }}>
      <Tab.Screen name="Home" component={Home} />
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
    paddingBottom: 5,
  },
});
