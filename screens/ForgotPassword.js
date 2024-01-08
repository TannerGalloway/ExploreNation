import { useState } from "react";
import { View, Text, Image, StyleSheet, Pressable, TouchableOpacity, KeyboardAvoidingView } from "react-native";
import { Button } from "@rneui/themed";
import { Formik } from "formik";
import * as Yup from "yup";
import TextInput from "../components/TextInput";

// Form Validation Schema
const validationSchema = Yup.object({
  email: Yup.string().email("Invalid Email").required(""),
});

export default function ForgotPassword({ navigation }) {
  const email_icon = require("../assets/images/email_icon.png");
  const [loading, setloading] = useState(false);

  const handleSubmit = (values) => {
    alert(`Submitting: ${JSON.stringify(values)}`);
    setloading(true);
  };

  return (
    <Formik initialValues={{ email: "" }} validateOnMount={true} validationSchema={validationSchema} validateOnChange={false} onSubmit={handleSubmit}>
      {({ handleChange, handleSubmit, handleBlur, values, errors, isValid, isSubmitting }) => (
        <KeyboardAvoidingView style={styles.container} behavior="position" keyboardVerticalOffset={-280}>
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
                <Text style={[styles.accountMessage, { color: "#2282e3" }]}>Login</Text>
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
    fontSize: 28,
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
    marginTop: 20,
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
