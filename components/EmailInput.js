import { View, StyleSheet } from "react-native";
import { Input } from "@rneui/themed";
import { MaterialIcons } from "@expo/vector-icons";

export default function EmailInput({ value, onChangeText, onBlur, error }) {
  return (
    <View style={styles.TextInputView}>
      <Input
        inputContainerStyle={{
          borderBottomWidth: 0,
          fontFamily: "RalewayBold",
        }}
        inputStyle={{ color: "white" }}
        placeholder="Email"
        placeholderTextColor="white"
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        errorStyle={{ color: "red" }}
        errorMessage={error}
        selectionColor="white"
        cursorColor="white"
        leftIcon={
          <MaterialIcons
            style={{ paddingTop: 4 }}
            name="email"
            size={24}
            color="white"
          />
        }
      />
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
    marginBottom: 20,
  },
});
