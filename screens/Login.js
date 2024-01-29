import { useState, useContext } from "react";
import { View, Text, Image, StyleSheet, Pressable, TouchableOpacity, StatusBar } from "react-native";
import * as Yup from "yup";
import { Formik } from "formik";
import { Button, useTheme } from "@rneui/themed";
import { supabase } from "../utils/supabaseClient";
import TextInput from "../components/TextInput";
import PasswordInput from "../components/PasswordInput";
import { AppContext } from "../utils/AppContext";

// Form Validation Schema
const validationSchema = Yup.object({
  email: Yup.string().email("Invalid Email").required(""),
  password: Yup.string()
    .required("")
    .min(8, "Password must be 8 characters long")
    .max(16, "Must be at less than 16 characters long")
    .matches(/[0-9]/, "Password requires a number")
    .matches(/[a-z]/, "Password requires a lowercase letter")
    .matches(/[A-Z]/, "Password requires an uppercase letter")
    .matches(/[^\w]/, "Password requires a symbol"),
});

export default function Login({ navigation }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [loading, setloading] = useState(false);
  const { statusBarStyle } = useContext(AppContext);
  const globe_icon = require("../assets/images/icon.png");

  // Submit form to database.
  const handleSubmit = async (values) => {
    setloading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setloading(false);
      alert("An Error has occured, please try again.");
    }
  };

  return (
    <>
      <StatusBar barStyle={statusBarStyle} backgroundColor="transparent" translucent={true} />
      <Formik
        initialValues={{ email: "", password: "" }}
        validateOnMount={true}
        validationSchema={validationSchema}
        validateOnChange={false}
        onSubmit={handleSubmit}>
        {({ handleChange, handleSubmit, handleBlur, values, errors, isValid, isSubmitting }) => (
          <View style={styles.container}>
            <Image style={styles.icon} source={globe_icon} />

            {/* Heading */}
            <View>
              <Text style={styles.heading}>Welcome Traveler</Text>
              <Text style={styles.subheading}>Adventure awaits...once you Login.</Text>
            </View>

            <TextInput value={values.email} onChangeText={handleChange("email")} onBlur={handleBlur("email")} error={errors.email} type={"email"} />

            <PasswordInput
              placeholder="Password"
              type="Password"
              value={values.password}
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
              error={errors.password}
              isValid={isValid}
            />

            {/* Forgot Password Link */}
            <View style={styles.forgotPwdView}>
              <Pressable
                onPress={() => {
                  navigation.replace("ForgotPassword");
                }}>
                <Text style={styles.forgotPwdText}>Forgot Password?</Text>
              </Pressable>
            </View>

            {/* Sign In & Sign Up Button */}
            <View>
              <Button
                title="Login"
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
                <Text style={styles.accountMessage}>Don't have an Account?</Text>
                <Pressable
                  onPress={() => {
                    navigation.replace("Register");
                  }}>
                  <Text style={[styles.accountMessage, { color: theme.colors.active }]}>Sign Up</Text>
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
      left: 80,
    },

    heading: {
      color: theme.colors.text,
      fontFamily: "RalewaySemiBold",
      fontSize: 30,
      textAlign: "center",
    },

    subheading: {
      color: theme.colors.subtext,
      fontFamily: "RalewayRegular",
      fontSize: 14,
      marginTop: 10,
      textAlign: "center",
    },

    forgotPwdView: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 15,
      marginRight: 5,
      marginBottom: 30,
    },

    forgotPwdText: {
      color: theme.colors.text,
      fontFamily: "RalewayBold",
      fontSize: 14,
      marginTop: 10,
    },

    button: {
      marginBottom: 30,
      height: 61,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 100,
      backgroundColor: "#00A8DA",
    },

    buttonText: {
      color: "white",
      fontFamily: "RalewayBold",
      fontSize: 16,
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
