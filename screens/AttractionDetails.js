import { useState, useEffect, useContext } from "react";
import { View, ScrollView, Text, Image, StyleSheet, useWindowDimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import AnimatedDotsCarousel from "react-native-animated-dots-carousel";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FontAwesome } from "@expo/vector-icons";
import { Button, useTheme, useThemeMode } from "@rneui/themed";
import { SERPAPI_KEY } from "@env";
import MapFragment from "../components/MapFragment";
import { AppContext } from "../utils/AppContext";

export default function AttractionDetails({ navigation }) {
  const { theme } = useTheme();
  const { mode } = useThemeMode();
  const styles = getStyles(theme);
  const width = useWindowDimensions().width;
  const height = useWindowDimensions().height;
  const [index, setIndex] = useState(0);
  const [attractionData, setAttractionData] = useState([]);
  const [attDataLoading, setAttDataLoading] = useState(true);
  const { screenData } = useContext(AppContext);
  let attImageData = [];
  let attractionInfo = {};
  const dataErrorObj = {
    attType: "Unknown",
    description: "Unable to find info.",
    photos: Object.values(screenData.att_thumbnail_url),
  };

  const getAttractionInfo = async () => {
    let attractionDetails = {};
    try {
      // Get additional attraction details that are not already present from other api calls.
      const attractionDetailsRes = await fetch(
        `https://serpapi.com/search.json?engine=google_maps&place_id=${screenData.att_place_id}&api_key=${SERPAPI_KEY}`
      );

      // Error handling api request.
      if (!attractionDetailsRes.ok) {
        attractionInfo = dataErrorObj;
      } else {
        attractionDetails = await attractionDetailsRes.json();
        if (attractionDetails.status == "INVALID_REQUEST") {
          attractionInfo = dataErrorObj;
        } else {
          attractionInfo = {
            attType: attractionDetails.place_results.type != undefined ? attractionDetails.place_results.type[0] : "Tourist Attraction",
            description:
              attractionDetails.place_results.description != undefined
                ? attractionDetails.place_results.description.snippet
                  ? attractionDetails.place_results.description.snippet
                  : attractionDetails.place_results.description
                : "Unable to find information about this attraction.",
          };
        }
      }

      // Get additional attraction photos.
      const attractionPhotosRes = await fetch(
        `https://serpapi.com/search.json?engine=google_maps_photos&data_id=${attractionDetails.place_results.data_id}&api_key=${SERPAPI_KEY}`
      );

      if (!attractionPhotosRes.ok) {
        attractionInfo = dataErrorObj;
      } else {
        const attractionPhotos = await attractionPhotosRes.json();
        for (let i = 0; i < attractionPhotos.photos.length; i++) {
          attImageData.push(attractionPhotos.photos[i].image);
        }
        attractionInfo = {
          attType: attractionDetails.place_results.type != undefined ? attractionDetails.place_results.type[0] : "Tourist Attraction",
          description:
            attractionDetails.place_results.description != undefined
              ? attractionDetails.place_results.description.snippet
                ? attractionDetails.place_results.description.snippet
                : attractionDetails.place_results.description
              : "Unable to find information about this attraction.",
          photos: attImageData,
        };
      }
    } catch (error) {
      alert("An Error has occured, please try again.");
    }
    setAttractionData(attractionInfo);
    setAttDataLoading(false);
  };

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: mode == "dark" ? "#101d23" : "white",
      },
      headerTintColor: mode == "dark" ? "white" : "black",
    });
    getAttractionInfo();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {attDataLoading ? (
          <Button
            type="clear"
            disabled={true}
            loading={true}
            loadingProps={{
              size: "large",
            }}
          />
        ) : (
          <>
            {/* Image Carousel */}
            <GestureHandlerRootView>
              <Carousel
                loop={false}
                width={width - 40}
                height={height / 3}
                data={attractionData.photos}
                scrollAnimationDuration={1000}
                pagingEnabled={true}
                onProgressChange={(offset, progress) => {
                  setIndex(Math.round(progress));
                }}
                renderItem={({ item }) => <Image style={{ height: height / 3, borderRadius: 25, margin: 5 }} source={{ uri: item }} />}
              />
            </GestureHandlerRootView>

            {/* Image Pagination Dots */}
            <View style={styles.imagePagination}>
              <AnimatedDotsCarousel
                length={attractionData.photos.length}
                currentIndex={index}
                maxIndicators={attractionData.photos.length}
                activeIndicatorConfig={{
                  color: theme.colors.active,
                  margin: 3,
                  opacity: 1,
                  size: 12,
                }}
                inactiveIndicatorConfig={{
                  color: theme.colors.text,
                  margin: 3,
                  opacity: 0.5,
                  size: 9,
                }}
                decreasingDots={[
                  {
                    config: { color: theme.colors.text, margin: 3, opacity: 0.5, size: 6 },
                    quantity: 1,
                  },
                  {
                    config: { color: theme.colors.text, margin: 3, opacity: 0.5, size: 4 },
                    quantity: 1,
                  },
                ]}
              />
            </View>

            {/* Attraction Heading*/}
            <View>
              {/* Top Heading View */}
              <View style={styles.headingView}>
                <Text style={styles.title}>{screenData.att_name}</Text>
                <View style={styles.ratingView}>
                  <FontAwesome name="star" size={15} color="#f3cc4b" style={{ marginTop: 13, marginRight: 6 }} />
                  <Text style={styles.subText}>{screenData.att_rating}</Text>
                </View>
              </View>

              {/* Bottom Heading View */}
              <View style={styles.headingView}>
                <View style={styles.mapMarkerIconView}>
                  <FontAwesome name="map-marker" size={26} color={theme.colors.active} style={{ paddingRight: 10 }} />
                  <Text style={styles.location}>{screenData.att_location}</Text>
                </View>
                <Text style={[styles.subText, { alignSelf: "flex-end" }]}>{attractionData.attType}</Text>
              </View>
            </View>

            {/* Body Content */}
            <Text style={[styles.title, styles.spacingTopBottom]}>About</Text>
            <Text style={{ color: theme.colors.subtext, fontSize: 14, marginTop: 5 }}>{attractionData.description}</Text>
            <Text style={[styles.title, styles.spacingTopBottom]}>Location</Text>
            <View style={[styles.mapView, { height: height / 3 }]}>
              <MapFragment lat={screenData.att_lat} lng={screenData.att_lng} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20,
      paddingTop: 7,
    },

    headingView: {
      flexDirection: "row",
      justifyContent: "space-between",
    },

    imagePagination: {
      flex: 0.1,
      alignItems: "center",
      marginTop: 20,
    },

    title: {
      color: theme.colors.text,
      fontFamily: "RalewayBold",
      fontSize: 18,
      maxWidth: 300,
      marginTop: 10,
    },

    mapMarkerIconView: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginTop: 20,
    },

    location: {
      color: theme.colors.subtext,
      fontFamily: "RalewayBold",
      fontSize: 15,
      maxWidth: 200,
    },

    subText: {
      color: theme.colors.subtext,
      fontSize: 15,
      fontWeight: "bold",
      marginTop: 10,
    },

    ratingView: {
      flexDirection: "row",
      marginTop: 5,
      justifyContent: "flex-end",
    },

    spacingTopBottom: {
      marginTop: 30,
      marginBottom: 15,
    },

    mapView: {
      marginBottom: 35,
      borderRadius: 25,
      overflow: "hidden",
    },
  });
};
