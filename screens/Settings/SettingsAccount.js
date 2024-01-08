import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Avatar } from "@rneui/themed";
import { FontAwesome } from "@expo/vector-icons";
import * as Yup from "yup";
import { Formik } from "formik";
import { Button } from "@rneui/themed";
import { supabase } from "../../utils/supabaseClient";
import TextInput from "../../components/TextInput";

// Form Validation Schema
const validationSchema = Yup.object({
  username: Yup.string().min(1).max(16),
});

export default function AccountSettings() {
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
  };

  return (
    <Formik
      initialValues={{ username: "" }}
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
              renderPlaceholderContent={<FontAwesome name="user-circle" size={44} color="white" />}
              source={{ uri: "https://randomuser.me/api/portraits/men/36.jpg" }}
              onPress={() => console.log("Image Select")}>
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

  title: {
    fontFamily: "RalewayBold",
    color: "white",
    fontSize: 16,
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
