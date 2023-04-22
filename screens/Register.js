import { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
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

  passwordConfirm: Yup.string()
    .required("")
    .oneOf([Yup.ref("password"), null], "Passwords don't match"),
});

export default function Register({ navigation }) {
  let email_icon = require("../assets/images/email_icon.png");
  const [loading, setloading] = useState(false);

  // Submit form to server.
  const handleSubmit = async (values) => {
    setloading(true);
    const { error } = await supabase.auth.signUp({
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
      initialValues={{ email: "", password: "", passwordConfirm: "" }}
      validateOnMount={true}
      validationSchema={validationSchema}
      validateOnChange={false}
      onSubmit={handleSubmit}>
      {({
        handleChange,
        handleSubmit,
        handleBlur,
        values,
        errors,
        isValid,
        isSubmitting,
      }) => (
        <KeyboardAvoidingView
          style={styles.container}
          behavior="position"
          keyboardVerticalOffset={-92}>
          <Image style={styles.icon} source={email_icon} />

          {/* Heading */}
          <View>
            <Text style={styles.heading}>Begin your Journey</Text>
            <Text style={styles.subheading}>
              You're 1 step closer to Adventure.
            </Text>
          </View>

          <EmailInput
            value={values.email}
            onChangeText={handleChange("email")}
            onBlur={handleBlur("email")}
            error={errors.email}
          />

          {/* Password */}
          <PasswordInput
            placeholder="Password"
            type="Password"
            value={values.password}
            onChangeText={handleChange("password")}
            onBlur={handleBlur("password")}
            error={errors.password}
            isValid={isValid}
          />

          {/* Confirm Password */}
          <PasswordInput
            placeholder="Confirm Password"
            type="Confirm Password"
            value={values.passwordConfirm}
            onChangeText={handleChange("passwordConfirm")}
            onBlur={handleBlur("passwordConfirm")}
            error={errors.passwordConfirm}
            isValid={isValid}
          />

          {/* Sign In & Sign Up Button */}
          <View>
            <Button
              title="Register"
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
              <Text style={styles.accountMessage}>
                Already have an Account?
              </Text>
              <Pressable
                onPress={() => {
                  navigation.replace("Login");
                }}>
                <Text style={[styles.accountMessage, { color: "#2282e3" }]}>
                  Login
                </Text>
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
    fontSize: 18,
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
