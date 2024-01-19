import { View, StyleSheet } from "react-native";
import { Input, useTheme } from "@rneui/themed";
import { MaterialIcons } from "@expo/vector-icons";

export default function TextInput({ value, onChangeText, onBlur, error, type }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.TextInputView}>
      <Input
        inputContainerStyle={{
          borderBottomWidth: 0,
          fontFamily: "RalewayBold",
        }}
        inputStyle={{ color: theme.colors.text }}
        placeholder={type == "email" ? "Email" : "Username"}
        placeholderTextColor={theme.colors.text}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        errorStyle={{ color: "red", marginTop: 12 }}
        errorMessage={error}
        selectionColor={theme.colors.text}
        cursorColor={theme.colors.text}
        leftIcon={
          type == "email" ? (
            <MaterialIcons style={{ paddingTop: 4 }} name="email" size={24} color={theme.colors.icon} />
          ) : (
            <MaterialIcons name="edit" size={24} color={theme.colors.icon} />
          )
        }
      />
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
      marginBottom: 20,
    },
  });
};
