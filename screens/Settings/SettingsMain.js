import { useEffect, useContext } from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback, StatusBar } from "react-native";
import { useTheme, useThemeMode } from "@rneui/themed";
import { AppContext } from "../../utils/AppContext";

export default function Settings({ navigation }) {
  const { theme } = useTheme();
  const { mode } = useThemeMode();
  const styles = getStyles(theme);
  const { statusBarStyle } = useContext(AppContext);

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: mode == "dark" ? "#101d23" : "white",
      },
      headerTintColor: mode == "dark" ? "white" : "black",
    });
  }, [mode]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={statusBarStyle} backgroundColor="transparent" translucent={true} />
      {/* Account Tab*/}
      <TouchableWithoutFeedback onPress={() => navigation.navigate("SettingsSubMenu", { selection: "Account" })}>
        <View>
          <Text style={styles.title}>Account</Text>
          <Text style={styles.subtitle}>Profile</Text>
        </View>
      </TouchableWithoutFeedback>

      {/* Preferences Tab*/}
      <TouchableWithoutFeedback onPress={() => navigation.navigate("SettingsSubMenu", { selection: "Preferences" })}>
        <View style={styles.sectionView}>
          <Text style={styles.title}>Preferences</Text>
          <Text style={styles.subtitle}>App Theme, Temperature Display</Text>
        </View>
      </TouchableWithoutFeedback>

      {/* Security Tab*/}
      <TouchableWithoutFeedback onPress={() => navigation.navigate("SettingsSubMenu", { selection: "Security" })}>
        <View style={styles.sectionView}>
          <Text style={styles.title}>Security</Text>
          <Text style={styles.subtitle}>Password</Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const getStyles = (theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20,
      paddingTop: 20,
    },

    sectionView: {
      marginTop: 30,
    },

    title: {
      fontFamily: "RalewayBold",
      color: theme.colors.text,
      fontSize: 18,
    },

    subtitle: {
      fontFamily: "RalewayMedium",
      color: theme.colors.subtext,
      fontSize: 14,
    },
  });
};
