import { useEffect } from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { useTheme, useThemeMode } from "@rneui/themed";

export default function Settings({ navigation }) {
  const { theme } = useTheme();
  const { mode } = useThemeMode();
  const styles = getStyles(theme);

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: mode == "light" ? "white" : "#101d23",
      },
      headerTintColor: mode == "light" ? "black" : "white",
    });
  }, [mode]);

  return (
    <View style={styles.container}>
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
