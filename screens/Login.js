import { useState } from "react";
import { View, Text, Image, StyleSheet, Pressable, TouchableOpacity, KeyboardAvoidingView } from "react-native";
import * as Yup from "yup";
import { Formik } from "formik";
import { Button, useTheme } from "@rneui/themed";
import { supabase } from "../utils/supabaseClient";
import TextInput from "../components/TextInput";
import PasswordInput from "../components/PasswordInput";

// Form Validation Schema
const validationSchema = Yup.object({
  email: Yup.string().email("Invalid Email").required(""),
  password: Yup.string()
    .required("")
    .min(8, "Password must be 8 characters long")
    .matches(/[0-9]/, "Password requires a number")
    .matches(/[a-z]/, "Password requires a lowercase letter")
    .matches(/[A-Z]/, "Password requires an uppercase letter")
    .matches(/[^\w]/, "Password requires a symbol"),
});

export default function Login({ navigation }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const email_icon = require("../assets/images/email_icon.png");
  const [loading, setloading] = useState(false);

  // Submit form to server.
  const handleSubmit = async (values) => {
    setloading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      alert(error.message);
      setloading(false);
    }
  };

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validateOnMount={true}
      validationSchema={validationSchema}
      validateOnChange={false}
      onSubmit={handleSubmit}>
      {({ handleChange, handleSubmit, handleBlur, values, errors, isValid, isSubmitting }) => (
        // Moves screen up so screen keyboard does not overlap other componenents.
        <KeyboardAvoidingView style={styles.container} behavior="position" keyboardVerticalOffset={-150}>
          <Image style={styles.icon} source={email_icon} />

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
        </KeyboardAvoidingView>
      )}
    </Formik>
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
