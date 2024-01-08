import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";

export default function Settings({ navigation }) {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101d23",
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  sectionView: {
    marginTop: 30,
  },

  title: {
    fontFamily: "RalewayBold",
    color: "white",
    fontSize: 18,
  },

  subtitle: {
    fontFamily: "RalewayMedium",
    color: "#919196",
    fontSize: 14,
  },
});
