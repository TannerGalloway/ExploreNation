import { useRef, useState, useEffect } from "react";
import { Animated, Text, View, StyleSheet, TouchableHighlight } from "react-native";
import { useTheme } from "@rneui/themed";

export default function Welcome({ navigation }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  // Store array image index in state.
  const [currentImageIndex1, setCurrentImageIndex1] = useState(0);
  const [currentImageIndex2, setCurrentImageIndex2] = useState(0);

  // Create 2 Animated Values for each image.
  const imageOpacity1 = useRef(new Animated.Value(1));
  const imageOpacity2 = useRef(new Animated.Value(1));

  // Keeps track of what array the currently viewed image is from.
  const activeArray = useRef(1);

  // 2 Arrays of Images
  const images1 = [
    require("../assets/images/hungary.jpg"),
    require("../assets/images/desertroad.jpg"),
    require("../assets/images/snowycabin.jpg"),
    require("../assets/images/cityscape.jpg"),
    require("../assets/images/mountains.jpg"),
  ];

  const images2 = [
    require("../assets/images/coast.jpg"),
    require("../assets/images/thaicoast.jpg"),
    require("../assets/images/mtfuji.jpg"),
    require("../assets/images/castle.jpg"),
    require("../assets/images/canyon.jpg"),
  ];

  // Call the fade in fuction on a new re render when either CurrentImageIndex1 or 2 State Changes after 10 secs.
  useEffect(() => {
    activeArray.current == 0 ? (activeArray.current = 1) : (activeArray.current = 0);
    const delay = setTimeout(fadeOut, 10000);
    return () => clearTimeout(delay);
  }, [currentImageIndex1, currentImageIndex2]);

  // Fade Out Function Animation
  const fadeOut = () => {
    // 2 Animations for both rendered images.
    Animated.parallel([
      Animated.timing(
        // Target the correct image based on the active array image.
        activeArray.current == 0 ? imageOpacity1.current : imageOpacity2.current,
        {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }
      ),
      Animated.timing(activeArray.current == 1 ? imageOpacity1.current : imageOpacity2.current, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // When the animation is finished, change the current image index based on the current array the faded out image was apart of.
      activeArray.current == 0
        ? setCurrentImageIndex1((currentImageIndex1 + 1) % images1.length)
        : setCurrentImageIndex2((currentImageIndex2 + 1) % images2.length);
    });
  };

  return (
    <View style={styles.container}>
      <Animated.Image style={[styles.image, { opacity: imageOpacity1.current }]} source={images1[currentImageIndex1]} />
      <Animated.Image style={[styles.image, { opacity: imageOpacity2.current }]} source={images2[currentImageIndex2]} />
      <View style={styles.bottomScreen}>
        <Text style={[styles.textFormat, styles.heading]}>Explore the Beauty of the World with just a tap.</Text>
        <Text style={[styles.textFormat, { fontSize: 18 }]}>
          Discover popular attractions & hidden gems around you with ease, your personal guide to local adventures.
        </Text>
        <View style={styles.buttonsView}>
          <TouchableHighlight
            style={[styles.button, { backgroundColor: theme.colors.active }]}
            underlayColor="#005e70"
            onPress={() => {
              navigation.replace("Register");
            }}>
            <View>
              <Text style={[styles.buttonText, { color: "white" }]}>Register</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            style={[styles.button, { backgroundColor: theme.colors.background }]}
            underlayColor="#0A1317"
            onPress={() => {
              navigation.replace("Login");
            }}>
            <View>
              <Text style={styles.buttonText}>Login</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );
}

const getStyles = (theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },

    image: {
      position: "absolute",
      height: "100%",
      width: "100%",
    },

    bottomScreen: {
      flex: 1,
      justifyContent: "flex-end",
      margin: 17,
    },

    buttonsView: {
      flexDirection: "row",
      justifyContent: "space-between",
    },

    button: {
      marginBottom: 20,
      width: 150,
      height: 61,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 100,
    },

    buttonText: {
      color: theme.colors.text,
      fontFamily: "RalewayBold",
      fontSize: 16,
    },

    textFormat: {
      marginBottom: 40,
      color: "white",
      fontFamily: "RalewayMedium",
    },

    heading: {
      fontSize: 38,
      width: 268,
      marginBottom: 15,
    },
  });
};
