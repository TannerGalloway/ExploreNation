import { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import * as Yup from "yup";
import { Formik } from "formik";
import { Button } from "@rneui/themed";
import { supabase } from "../../utils/supabaseClient";
import PasswordInput from "../../components/PasswordInput";

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

export default function PasswordSettings() {
  const [loading, setloading] = useState(false);

  // Submit form to server.
  const handleSubmit = async (values) => {
    setloading(true);
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      alert(error.message);
      setloading(false);
    }

    values.password = "";
    values.passwordConfirm = "";
    setloading(false);
  };

  return (
    <Formik
      initialValues={{ password: "", passwordConfirm: "" }}
      validateOnMount={true}
      validationSchema={validationSchema}
      validateOnChange={false}
      onSubmit={handleSubmit}>
      {({ handleChange, handleSubmit, handleBlur, values, errors, isValid, isSubmitting }) => (
        <View style={styles.container}>
          {/* New Password */}
          <PasswordInput
            placeholder="New Password"
            type="Password"
            value={values.password}
            onChangeText={handleChange("password")}
            onBlur={handleBlur("password")}
            error={errors.password}
            isValid={isValid}
          />

          {/* Confirm New Password */}
          <PasswordInput
            placeholder="Confirm New Password"
            type="Confirm Password"
            value={values.passwordConfirm}
            onChangeText={handleChange("passwordConfirm")}
            onBlur={handleBlur("passwordConfirm")}
            error={errors.passwordConfirm}
            isValid={isValid}
          />

          {/* Submit Button*/}
          <View>
            <Button
              title="Change Password"
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  button: {
    marginBottom: 30,
    marginTop: 10,
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
