import { useState, useRef, useContext } from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { Dialog, CheckBox } from "@rneui/themed";
import { AppContext } from "../../utils/AppContext";

export default function SettingsSubMenu({ navigation, route }) {
  const [appThemeModalVisable, setAppThemeModalVisable] = useState(false);
  const [tempDisplayModalVisable, setTempDisplayModalVisable] = useState(false);
  const modalSelection = useRef("App Theme");
  const modalOptions = useRef(["Light", "Dark"]);
  const { appTheme, setAppTheme, tempDisplay, setTempDisplay, prevAppTheme, setPrevAppTheme, prevTempDisplay, setPrevTempDisplay } =
    useContext(AppContext);

  const togglePrefModal = (selection) => {
    if (selection == "App Theme") {
      modalSelection.current = "App Theme";
      modalOptions.current = ["Light", "Dark"];
      setAppThemeModalVisable(!appThemeModalVisable);
    } else {
      modalSelection.current = "Temperature Display";
      modalOptions.current = ["Fahrenheit", "Celsius"];
      setTempDisplayModalVisable(!tempDisplayModalVisable);
    }
  };

  const cancelSelection = (title) => {
    if (title == "App Theme") {
      if (appTheme != 1 || prevAppTheme != appTheme) {
        setAppTheme(prevAppTheme);
      }
    } else {
      if (tempDisplay != 1 || prevTempDisplay != tempDisplay) {
        setTempDisplay(prevTempDisplay);
      }
    }
  };

  const PreferencesModal = ({ title, options }) => (
    <Dialog
      isVisible={title == "App Theme" ? appThemeModalVisable : tempDisplayModalVisable}
      onBackdropPress={() => {
        cancelSelection(title);
        title == "App Theme" ? setAppThemeModalVisable(!appThemeModalVisable) : setTempDisplayModalVisable(!tempDisplayModalVisable);
      }}
      overlayStyle={{ backgroundColor: "#252B34" }}>
      <Dialog.Title title={title} titleStyle={{ color: "white" }} />
      {options.map((option, index) => (
        <CheckBox
          key={index}
          title={option}
          titleProps={{ style: { color: "white", marginLeft: 10, fontWeight: 700 } }}
          containerStyle={{ backgroundColor: "#252B34", borderWidth: 0 }}
          checkedIcon="dot-circle-o"
          uncheckedIcon="circle-o"
          checked={title == "App Theme" ? appTheme === index + 1 : tempDisplay === index + 1}
          onPress={() => {
            title == "App Theme" ? setAppTheme(index + 1) : setTempDisplay(index + 1);
          }}
        />
      ))}

      <Dialog.Actions>
        <Dialog.Button
          title="CONFIRM"
          onPress={() => {
            if (title == "App Theme") {
              setPrevAppTheme(appTheme);
              setAppThemeModalVisable(!appThemeModalVisable);
            } else {
              setPrevTempDisplay(tempDisplay);
              setTempDisplayModalVisable(!tempDisplayModalVisable);
            }
          }}
        />
        <Dialog.Button
          title="CANCEL"
          onPress={() => {
            cancelSelection(title);
            title == "App Theme" ? setAppThemeModalVisable(!appThemeModalVisable) : setTempDisplayModalVisable(!tempDisplayModalVisable);
          }}
        />
      </Dialog.Actions>
    </Dialog>
  );

  const RouteRender = () => {
    switch (route.params.selection) {
      case "Account":
        return (
          <TouchableWithoutFeedback onPress={() => navigation.navigate("AccountSettings")}>
            <View>
              <Text style={styles.title}>Edit Profile</Text>
              <Text style={styles.subtitle}>Update Profile Picture or Username.</Text>
            </View>
          </TouchableWithoutFeedback>
        );

      case "Preferences":
        return (
          <View>
            <TouchableWithoutFeedback onPress={() => togglePrefModal("App Theme")}>
              <View>
                <Text style={styles.title}>App Theme</Text>
                <Text style={styles.subtitle}>Choose between light and dark color palettes.</Text>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => togglePrefModal("Temperature Display")}>
              <View style={styles.sectionView}>
                <Text style={styles.title}>Temperature Display</Text>
                <Text style={styles.subtitle}>Choose the temperature format to be displayed.</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        );

      case "Security":
        return (
          <TouchableWithoutFeedback onPress={() => navigation.navigate("PasswordSettings")}>
            <View>
              <Text style={styles.title}>Change Password</Text>
              <Text style={styles.subtitle}>Update current password.</Text>
            </View>
          </TouchableWithoutFeedback>
        );

      default:
        return null;
    }
  };
  return (
    <View style={styles.container}>
      <RouteRender />
      <PreferencesModal title={modalSelection.current} options={modalOptions.current} />
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
    fontSize: 16,
  },

  subtitle: {
    fontFamily: "RalewayMedium",
    color: "#919196",
    fontSize: 14,
  },
});
