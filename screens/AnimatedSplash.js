import { useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

export default function AnimatedSplash({ navigation }) {
  const animation = useRef(null);

  useEffect(() => {
    animation.current?.play();
  }, []);

  return (
    <View style={styles.animationContainer}>
      <LottieView
        source={require("../assets/SplashAnimation.json")}
        ref={animation}
        loop={false}
        style={{
          width: 200,
          height: 200,
          backgroundColor: "#101d23",
        }}
        onAnimationFinish={() => {
          navigation.navigate("Welcome");
        }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  animationContainer: {
    flex: 1,
    backgroundColor: "#101d23",
    justifyContent: "center",
    alignItems: "center",
  },
});
