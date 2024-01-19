import { useState, useRef, useContext, useEffect } from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { Dialog, CheckBox, useTheme, useThemeMode } from "@rneui/themed";
import { AppContext } from "../../utils/AppContext";

export default function SettingsSubMenu({ navigation, route }) {
  const { theme } = useTheme();
  const { mode, setMode } = useThemeMode();
  const [appThemeModalVisable, setAppThemeModalVisable] = useState(false);
  const [tempDisplayModalVisable, setTempDisplayModalVisable] = useState(false);
  const modalSelection = useRef("App Theme");
  const modalOptions = useRef(["Light", "Dark"]);
  const { appTheme, setAppTheme, tempDisplay, setTempDisplay, prevAppTheme, setPrevAppTheme, prevTempDisplay, setPrevTempDisplay } =
    useContext(AppContext);
  const styles = getStyles(theme);

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
        setMode(prevAppTheme == 1 ? "light" : "dark");
        navigation.setOptions({
          headerStyle: {
            backgroundColor: prevAppTheme == 1 ? "white" : "#101d23",
          },
          headerTintColor: prevAppTheme == 1 ? "black" : "white",
        });
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
      overlayStyle={{ backgroundColor: theme.colors.secondaryBackground }}>
      <Dialog.Title title={title} titleStyle={{ color: theme.colors.text }} />
      {options.map((option, index) => (
        <CheckBox
          key={index}
          title={option}
          titleProps={{ style: { color: theme.colors.text, marginLeft: 10, fontWeight: 700 } }}
          containerStyle={{ backgroundColor: theme.colors.secondaryBackground, borderWidth: 0 }}
          checkedIcon="dot-circle-o"
          uncheckedIcon="circle-o"
          checked={title == "App Theme" ? appTheme === index + 1 : tempDisplay === index + 1}
          onPress={() => {
            if (title == "App Theme") {
              setAppTheme(index + 1);
              setMode(index + 1 == 1 ? "light" : "dark");
              navigation.setOptions({
                headerStyle: {
                  backgroundColor: index + 1 == 1 ? "white" : "#101d23",
                },
                headerTintColor: index + 1 == 1 ? "black" : "white",
              });
            } else {
              setTempDisplay(index + 1);
            }
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

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: mode == "light" ? "white" : "#101d23",
      },
      headerTintColor: mode == "light" ? "black" : "white",
    });
  }, []);

  return (
    <View style={styles.container}>
      <RouteRender />
      <PreferencesModal title={modalSelection.current} options={modalOptions.current} />
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
      fontSize: 16,
    },

    subtitle: {
      fontFamily: "RalewayMedium",
      color: theme.colors.subtext,
      fontSize: 14,
    },
  });
};
