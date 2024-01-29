import { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, BackHandler, TouchableOpacity } from "react-native";
import { Button } from "@rneui/themed";
import { Formik } from "formik";
import * as Yup from "yup";
import PasswordInput from "../components/PasswordInput";

// Form Validation Schema
const validationSchema = Yup.object({
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

export default function ResetPassword() {
  const [loading, setloading] = useState(false);
  const email_icon = require("../assets/images/email_icon.png");

  // Disable Back Button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const handleSubmit = (values) => {
    alert(`Submitting: ${JSON.stringify(values)}`);
    setloading(true);
  };

  return (
    <Formik
      initialValues={{ password: "", passwordConfirm: "" }}
      validateOnMount={true}
      validationSchema={validationSchema}
      validateOnChange={true}
      onSubmit={handleSubmit}>
      {({ handleChange, handleSubmit, handleBlur, values, errors, isValid, isSubmitting }) => (
        <View style={styles.container}>
          <Image style={styles.icon} source={email_icon} />

          {/* Heading */}
          <View>
            <Text style={styles.heading}>Reset Password</Text>
            <Text style={styles.subheading}>Adventure awaits! Enter your new password to continue Exploring.</Text>
          </View>

          {/* Password */}
          <PasswordInput
            placeholder="New Password"
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

          {/* Submit Reset Button */}
          <View>
            <Button
              title="Reset Password"
              titleStyle={styles.buttonText}
              buttonStyle={styles.button}
              disabledStyle={{ backgroundColor: "#476D8E" }}
              disabled={!isValid || isSubmitting}
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
});
