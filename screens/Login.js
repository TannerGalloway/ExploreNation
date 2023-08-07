import { useState } from "react";
import { View, Text, Image, StyleSheet, Pressable, TouchableOpacity, KeyboardAvoidingView } from "react-native";
import * as Yup from "yup";
import { Formik } from "formik";
import { Button } from "@rneui/themed";
import { supabase } from "../utils/supabaseClient";
import EmailInput from "../components/EmailInput";
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
        <KeyboardAvoidingView style={styles.container} behavior="position" keyboardVerticalOffset={-157}>
          <Image style={styles.icon} source={email_icon} />

          {/* Heading */}
          <View>
            <Text style={styles.heading}>Welcome Traveler</Text>
            <Text style={styles.subheading}>Adventure awaits...once you Login.</Text>
          </View>

          <EmailInput
            value={values.email}
            onChangeText={handleChange("email")}
            onBlur={handleBlur("email")}
            error={errors.email}
          />

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
                <Text style={[styles.accountMessage, { color: "#2282e3" }]}>Sign Up</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101d23",
    padding: 20,
  },

  icon: {
    height: 200,
    width: 200,
    position: "relative",
    left: 70,
  },

  heading: {
    color: "white",
    fontFamily: "RalewaySemiBold",
    fontSize: 30,
    textAlign: "center",
  },

  subheading: {
    color: "#919196",
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
    color: "white",
    fontFamily: "RalewayBold",
    fontSize: 14,
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
    color: "white",
    fontFamily: "RalewayBold",
    fontSize: 13,
  },
});
