import { useState } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { Feather, Entypo } from "@expo/vector-icons";
import { Input } from "@rneui/themed";

export default function PasswordInput({ placeholder, type, value, onChangeText, onBlur, error, isValid }) {
  const [hidePassword, setPwdVisable] = useState(true);

  // Password Visibility Icon Change
  let iconName = null;
  hidePassword ? (iconName = "eye") : (iconName = "eye-off");
  const pwdSubheadingStyle = isValid ? styles.pwdSubheading : styles.pwdSubheadingErrorPresent;

  return (
    <View style={styles.TextInputView}>
      <Input
        inputContainerStyle={{
          borderBottomWidth: 0,
          fontFamily: "RalewayBold",
        }}
        inputStyle={{ color: "white" }}
        placeholder={placeholder}
        placeholderTextColor="white"
        value={value}
        secureTextEntry={hidePassword}
        onChangeText={onChangeText}
        onBlur={onBlur}
        errorStyle={{ color: "red" }}
        errorMessage={error}
        selectionColor="white"
        cursorColor="white"
        leftIcon={<Entypo name="lock" size={24} color="white" />}
        rightIcon={
          // Show or Hide Password Button
          <Pressable
            onPress={() => {
              setPwdVisable(!hidePassword);
            }}>
            <Feather name={iconName} size={24} color="white" />
          </Pressable>
        }
      />
      {type == "Password" ? <Text style={pwdSubheadingStyle}>Will contain 8 characters with (A-Z, a-z, 0-9, !@#$%^&*)</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  TextInputView: {
    backgroundColor: "#252B34",
    height: 65,
    borderRadius: 15,
    paddingTop: 10,
    marginTop: 20,
    marginBottom: 30,
  },

  pwdSubheading: {
    position: "relative",
    color: "#919196",
    fontFamily: "RalewayRegular",
    fontSize: 13,
    bottom: 22,
    marginLeft: 15,
    marginTop: 10,
  },
  pwdSubheadingErrorPresent: {
    position: "relative",
    color: "#919196",
    fontFamily: "RalewayRegular",
    fontSize: 13,
    bottom: 7,
    marginLeft: 15,
  },
});
