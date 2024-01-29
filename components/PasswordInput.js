import { useState } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { Feather, Entypo } from "@expo/vector-icons";
import { Input, useTheme } from "@rneui/themed";

export default function PasswordInput({ placeholder, type, value, onChangeText, onBlur, error, isValid }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
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
        inputStyle={{ color: theme.colors.text }}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text}
        value={value}
        secureTextEntry={hidePassword}
        onChangeText={onChangeText}
        onBlur={onBlur}
        errorStyle={{ color: "red", marginTop: 12 }}
        errorMessage={error}
        selectionColor={theme.colors.text}
        cursorColor={theme.colors.text}
        leftIcon={<Entypo name="lock" size={24} color={theme.colors.icon} />}
        rightIcon={
          // Show or Hide Password Button
          <Pressable
            onPress={() => {
              setPwdVisable(!hidePassword);
            }}>
            <Feather name={iconName} size={24} color={theme.colors.icon} />
          </Pressable>
        }
      />
      {type == "Password" ? <Text style={pwdSubheadingStyle}>Must contain 8 characters with (A-Z, a-z, 0-9, !@#$%^&*)</Text> : null}
    </View>
  );
}

const getStyles = (theme) => {
  return StyleSheet.create({
    TextInputView: {
      backgroundColor: theme.colors.secondaryBackground,
      height: 65,
      borderRadius: 15,
      paddingTop: 10,
      marginTop: 20,
      marginBottom: 30,
    },

    pwdSubheading: {
      position: "relative",
      color: theme.colors.subtext,
      fontFamily: "RalewayRegular",
      fontSize: 13,
      bottom: 15,
      marginLeft: 10,
    },

    pwdSubheadingErrorPresent: {
      position: "relative",
      color: theme.colors.subtext,
      fontFamily: "RalewayRegular",
      fontSize: 13,
      bottom: 5,
      marginLeft: 15,
    },
  });
};
