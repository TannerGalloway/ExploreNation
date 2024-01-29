import { useState, useContext } from "react";
import { View, Text, Image, StyleSheet, Pressable, TouchableOpacity, StatusBar } from "react-native";
import { Button, useTheme } from "@rneui/themed";
import { Formik } from "formik";
import * as Yup from "yup";
import TextInput from "../components/TextInput";
import { AppContext } from "../utils/AppContext";

// Form Validation Schema
const validationSchema = Yup.object({
  email: Yup.string().email("Invalid Email").required(""),
});

export default function ForgotPassword({ navigation }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [loading, setloading] = useState(false);
  const { statusBarStyle } = useContext(AppContext);
  const email_icon = require("../assets/images/email_icon.png");

  const handleSubmit = (values) => {
    alert(`Submitting: ${JSON.stringify(values)}`);
    setloading(true);
  };

  return (
    <>
      <StatusBar barStyle={statusBarStyle} backgroundColor="transparent" translucent={true} />
      <Formik
        initialValues={{ email: "" }}
        validateOnMount={true}
        validationSchema={validationSchema}
        validateOnChange={true}
        onSubmit={handleSubmit}>
        {({ handleChange, handleSubmit, handleBlur, values, errors, isValid, isSubmitting }) => (
          <View style={styles.container}>
            <Image style={styles.icon} source={email_icon} />

            {/* Heading */}
            <View>
              <Text style={styles.heading}>Forgot your Password?</Text>
              <Text style={styles.subheading}>Enter the Email associated with your account and we'll get you back to Exploring.</Text>
            </View>

            <TextInput value={values.email} onChangeText={handleChange("email")} onBlur={handleBlur("email")} error={errors.email} type={"email"} />

            {/* Send Button */}
            <View>
              <Button
                title="Send"
                titleStyle={styles.buttonText}
                buttonStyle={styles.button}
                disabledStyle={{ backgroundColor: "#476D8E" }}
                disabled={!isValid || isSubmitting}
                TouchableComponent={TouchableOpacity}
                loading={loading}
                onPress={handleSubmit}
              />

              {/* Sign In & Sign Up Screen Link */}
              <View style={styles.footer}>
                <Text style={styles.accountMessage}>Remembered your Password?</Text>
                <Pressable
                  onPress={() => {
                    navigation.replace("Login");
                  }}>
                  <Text style={[styles.accountMessage, { color: theme.colors.active }]}>Login</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </Formik>
    </>
  );
}

const getStyles = (theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 20,
    },

    icon: {
      height: 200,
      width: 200,
      position: "relative",
      left: 70,
    },

    heading: {
      color: theme.colors.text,
      fontFamily: "RalewaySemiBold",
      fontSize: 28,
      textAlign: "center",
    },

    subheading: {
      color: theme.colors.subtext,
      fontFamily: "RalewayRegular",
      fontSize: 14,
      marginTop: 10,
      textAlign: "center",
    },

    button: {
      marginTop: 20,
      marginBottom: 30,
      height: 61,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 100,
      backgroundColor: theme.colors.active,
    },

    buttonText: {
      color: theme.colors.text,
      fontFamily: "RalewayBold",
      fontSize: 18,
    },

    footer: {
      flexDirection: "row",
      justifyContent: "space-evenly",
    },

    accountMessage: {
      color: theme.colors.text,
      fontFamily: "RalewayBold",
      fontSize: 13,
    },
  });
};
