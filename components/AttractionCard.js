import { View, Text, ImageBackground, StyleSheet, TouchableWithoutFeedback, useWindowDimensions } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function AttractionCard({ navigation, details }) {
  const width = useWindowDimensions().width;

  const formatPopNum = (number) => {
    const formatter = Intl.NumberFormat("en", { notation: "compact" });
    return formatter.format(number);
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        navigation.navigate("AttractionDetails", {
          name: details.name,
          rating: details.rating,
          thumbnail: details.thumbnail,
          place_id: details.place_id,
          location: details.location,
          latlng: details.latlng,
        });
      }}>
      <View>
        <ImageBackground style={[styles.attImgPreview, { width: width / 2.45 }]} imageStyle={styles.backdropBorder} source={details.thumbnail}>
          <View style={styles.attractionTextView}>
            <Text style={styles.attractionText}>{`${details.name}`}</Text>
            <View style={{ flexDirection: "row" }}>
              <FontAwesome name="star" size={13} color="#f3cc4b" style={{ marginTop: 3, marginRight: 6 }} />
              <Text style={{ color: "#d3d3d3" }}>{`${details.rating} (${formatPopNum(details.total_reviews)})`}</Text>
            </View>
          </View>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  attImgPreview: {
    marginBottom: 15,
    marginRight: 30,
    justifyContent: "flex-end",
    height: 130,
  },

  backdropBorder: {
    borderColor: "white",
    borderRadius: 10,
    borderWidth: 1,
  },

  attractionTextView: {
    backgroundColor: "rgba(52, 52, 52, 0.6)",
    paddingHorizontal: 5,
    paddingBottom: 3,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },

  attractionText: {
    fontFamily: "RalewayBold",
    fontSize: 13,
    color: "white",
  },
});
