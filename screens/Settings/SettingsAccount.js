import { useState, useRef, useEffect, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Avatar, useThemeMode } from "@rneui/themed";
import { FontAwesome } from "@expo/vector-icons";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import { Formik } from "formik";
import { Button, useTheme } from "@rneui/themed";
import { supabase } from "../../utils/supabaseClient";
import TextInput from "../../components/TextInput";
import { AppContext } from "../../utils/AppContext";

// Form Validation Schema
const validationSchema = Yup.object({
  username: Yup.string()
    .min(3, "Must be at least 3 characters long")
    .max(16, "Must be at less than 16 characters long")
    .matches(/^[a-zA-Z0-9_]*$/, "Special Characters are not allowed in username")
    .test("empty", " ", (value) => {
      if (value == undefined || value.length < 3 || value.length > 16) {
        return false;
      } else {
        return true;
      }
    }),
});

export default function AccountSettings({ navigation }) {
  const { theme } = useTheme();
  const { mode } = useThemeMode();
  const styles = getStyles(theme);
  const [loading, setloading] = useState(false);
  const { username, setUsername, profilePic, setProfilePic } = useContext(AppContext);
  let profilePicValid = useRef(false);

  // Submit form to server.
  const handleSubmit = async (values) => {
    let dbError = {};
    setloading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (profilePicValid.current) {
      const { error } = await supabase.from("profiles").update({ username: values.username, profilePic_uri: profilePic }).eq("id", user.id);
      dbError = error;
    } else {
      const { error } = await supabase.from("profiles").update({ username: values.username }).eq("id", user.id);
      dbError = error;
    }

    if (dbError) {
      alert(dbError.message);
      setloading(false);
      profilePicValid.current = false;
    }

    setUsername(values.username);
    profilePicValid.current = false;
    setloading(false);
  };

  const pickImage = async () => {
    let selectedImage = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!selectedImage.canceled) {
      profilePicValid.current = true;
      setProfilePic(selectedImage.assets[0].uri);
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
    <Formik
      initialValues={{ username: username == null ? "" : username }}
      validateOnMount={true}
      validationSchema={validationSchema}
      validateOnChange={true}
      onSubmit={handleSubmit}>
      {({ handleChange, handleSubmit, handleBlur, values, errors, isValid, isSubmitting }) => (
        <View style={styles.container}>
          <Text style={styles.title}>Profile Picture</Text>
          <View style={{ alignItems: "center" }}>
            <Avatar
              size={85}
              rounded
              renderPlaceholderContent={<FontAwesome name="user-circle" size={75} color={theme.colors.icon} />}
              source={profilePic == null ? profilePic : { uri: profilePic }}
              onPress={pickImage}>
              <Avatar.Accessory size={23} />
            </Avatar>
          </View>
          <Text style={[styles.title, { marginTop: 30 }]}>Username</Text>
          <TextInput value={values.username} onChangeText={handleChange("username")} onBlur={handleBlur("username")} error={errors.username} />

          {/* Save Changes Button*/}
          <View>
            <Button
              title="Save"
              titleStyle={styles.buttonText}
              buttonStyle={styles.button}
              disabledStyle={{ backgroundColor: "#476D8E" }}
              disabled={(!isValid && !profilePicValid.current) || isSubmitting}
              TouchableComponent={TouchableOpacity}
              loading={loading}
              onPress={handleSubmit}
            />
          </View>
        </View>
      )}
    </Formik>
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

    title: {
      fontFamily: "RalewayBold",
      color: theme.colors.text,
      fontSize: 16,
    },

    button: {
      marginBottom: 30,
      marginTop: 10,
      height: 61,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 100,
      backgroundColor: theme.colors.active,
    },

    buttonText: {
      color: "white",
      fontFamily: "RalewayBold",
      fontSize: 18,
    },
  });
};
