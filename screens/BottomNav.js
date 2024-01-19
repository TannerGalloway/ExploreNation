import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome, FontAwesome5, Entypo, Ionicons } from "@expo/vector-icons";
import { useTheme } from "@rneui/themed";
import Home from "./Home";
import Discover from "./Discover";
import Favorites from "./Favorites";
import Map from "./Map";

const Tab = createBottomTabNavigator();

export default function BottomNav() {
  const { theme } = useTheme();
  const styles = getStyles(theme);

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
              return <Entypo name="home" size={24} color={focused ? theme.colors.active : theme.colors.text} />;

            case "Discover":
              return <Ionicons name="compass" size={24} color={focused ? theme.colors.active : theme.colors.text} />;

            case "Favorites":
              return <FontAwesome name="heart" size={24} color={focused ? theme.colors.active : theme.colors.text} />;

            case "Map":
              return <FontAwesome5 name="map-marked-alt" size={24} color={focused ? theme.colors.active : theme.colors.text} />;
          }
        },
      })}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Discover" component={Discover} />
      <Tab.Screen name="Favorites" component={Favorites} />
      <Tab.Screen name="Map" component={Map} />
    </Tab.Navigator>
  );
}

const getStyles = (theme) => {
  return StyleSheet.create({
    tabsContainer: {
      backgroundColor: theme.colors.secondaryBackground,
      borderTopColor: theme.colors.secondaryBackground,
    },

    tabLabel: {
      color: theme.colors.text,
      fontFamily: "RalewayBold",
      fontSize: 16,
    },
  });
};
