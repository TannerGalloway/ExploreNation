import { useEffect } from "react";
import { View, Text, Image, StyleSheet, Pressable, TouchableHighlight, BackHandler } from "react-native";

export default function CheckEmail({ navigation }) {
  // Disable Back Button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const email_icon = require("../assets/images/email_icon.png");

  return (
    <View style={styles.container}>
      <Image style={styles.icon} source={email_icon} />

      {/* Heading */}
      <View style={{ margin: 30 }}>
        <Text style={styles.heading}>Check your Inbox</Text>
        <Text style={styles.subheading}>
          We just sent you an email to verify/reset your account/password. Tap the link inside to get started/continue your adventure.
        </Text>
      </View>

      {/* Send Button */}
      <View style={styles.footerView}>
        <TouchableHighlight
          style={styles.button}
          underlayColor="#005e70"
          onPress={() => {
            navigation.replace("Login");
          }}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableHighlight>

        {/* Sign In & Sign Up Screen Link */}
        <View style={styles.footer}>
          <Text style={styles.accountMessage}>Didn't receive the link?</Text>
          <Pressable
            onPress={() => {
              alert("Resend Verify/Reset Email");
            }}>
            <Text style={[styles.accountMessage, { color: "#2282e3" }]}>Resend</Text>
          </Pressable>
        </View>
      </View>
    </View>
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
    top: 140,
    left: 70,
  },

  heading: {
    color: "white",
    fontFamily: "RalewaySemiBold",
    fontSize: 30,
    marginTop: 100,
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
    backgroundColor: "#00a8da",
  },

  buttonText: {
    color: "white",
    fontFamily: "RalewayBold",
    fontSize: 18,
  },

  footerView: {
    flex: 1,
    marginBottom: 30,
    justifyContent: "flex-end",
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
