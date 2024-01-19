import { useContext } from "react";
import { View, Text, ImageBackground, StyleSheet, TouchableWithoutFeedback, useWindowDimensions } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useTheme } from "@rneui/themed";
import { AppContext } from "../utils/AppContext";

export default function AttractionCardDetailed({ navigation, details }) {
  const { theme } = useTheme();
  const width = useWindowDimensions().width;
  const { setScreenData } = useContext(AppContext);
  const styles = getStyles(theme);

  const formatRating = (number) => {
    const formatter = Intl.NumberFormat("en", { notation: "compact" });
    return formatter.format(number);
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setScreenData({
          att_name: details.name,
          att_location: details.location,
          att_rating: details.rating,
          att_lat: details.latlng.lat,
          att_lng: details.latlng.lng,
          att_place_id: details.place_id,
          att_total_reviews: details.total_reviews,
          att_thumbnail_url: details.thumbnail,
        });
        navigation.navigate("AttractionDetails");
      }}>
      <View>
        <ImageBackground style={[styles.attImgPreview, { width: width / 2.45 }]} imageStyle={styles.backdropBorder} source={details.thumbnail}>
          <View style={styles.attractionTextView}>
            <Text style={styles.attractionText}>{`${details.name}`}</Text>
            <View style={{ flexDirection: "row" }}>
              <FontAwesome name="star" size={13} color="#f3cc4b" style={{ marginTop: 3, marginRight: 6 }} />
              <Text style={{ color: "#d3d3d3" }}>{`${details.rating} (${formatRating(details.total_reviews)})`}</Text>
            </View>
          </View>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
}

const getStyles = (theme) => {
  return StyleSheet.create({
    attImgPreview: {
      marginBottom: 15,
      marginRight: 30,
      justifyContent: "flex-end",
      height: 130,
    },

    backdropBorder: {
      borderColor: theme.colors.cardOutline,
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
};
