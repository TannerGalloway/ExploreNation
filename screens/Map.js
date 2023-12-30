import { useState, useContext, useRef, useCallback } from "react";
import { View, StyleSheet, Text, Image, TouchableWithoutFeedback } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import mapStyle from "../utils/mapStyleDark.json";
import { AppContext } from "../utils/AppContext";
import { GOOGLE_PLACES_API_KEY } from "@env";

export default function Map({ route, navigation }) {
  const { currentLocation, setScreenData } = useContext(AppContext);
  const apiCallInProgress = useRef(false);
  const apiResController = useRef(null);
  const [attractionLocations, setAttractionLocations] = useState([]);
  const [attractionCardShown, setAttractionCardShown] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const errorImg = require("../assets/images/error_loading.jpg");
  const [region, setRegion] = useState({
    latitude: route.params != undefined ? route.params.destination_lat : currentLocation != null ? currentLocation.location.coords.latitude : 0,
    longitude: route.params != undefined ? route.params.destination_lng : currentLocation != null ? currentLocation.location.coords.longitude : 0,
    latitudeDelta: route.params != undefined ? (route.params.destination_isCountry ? 5 : 0.15) : 5,
    longitudeDelta: route.params != undefined ? (route.params.destination_isCountry ? 5 : 0.15) : 5,
  });

  const changeRegion = async (newRegion) => {
    if (route.params == undefined || !route.params.destination_isCountry) {
      let attractionLocations = [];
      let attThumbnail = errorImg;
      let searchRadius = 0;
      let locationName = "";
      let locationCode = "";
      let attractionType = "";

      // If a current api call is in progress while udating the map, cancel the current api call before starting a new call.
      if (apiResController.current && apiCallInProgress.current) {
        apiResController.current.abort();
      }

      // Initialize the abort controller.  Controller needs to be reinitialize after each abort operation performed.
      apiResController.current = new AbortController();

      if (newRegion.latitudeDelta < 0.5) {
        searchRadius = 16093; // 10 miles
      } else if (newRegion.latitudeDelta < 1 && newRegion.latitudeDelta > 0.5) {
        searchRadius = 48281; // 30 miles
      } else if (newRegion.latitudeDelta > 1 && newRegion.latitudeDelta < 2) {
        searchRadius = 80468; //  50 miles
      }

      try {
        apiCallInProgress.current = true;
        // Get Nearby Attractions that are labled as tourist attractions and fall into a circle with a custom radius size based on the current zoom value of the map.
        const regionAttrationsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${`${newRegion.latitude},${newRegion.longitude}`}&radius=${searchRadius}&type=tourist_attraction&key=${GOOGLE_PLACES_API_KEY}`,
          { signal: apiResController.current.signal }
        );

        if (!regionAttrationsResponse.ok) {
          alert("An Error has occured, please try again.");
        } else {
          const regionAttrations = await regionAttrationsResponse.json();

          for (let i = 0; i < regionAttrations.results.length; i++) {
            // Retrieve image of attraction.
            if (regionAttrations.results[i].photos != undefined) {
              const attractionImg = await fetch(
                `https://maps.googleapis.com/maps/api/place/photo?photoreference=${regionAttrations.results[i].photos[0].photo_reference}&maxheight=200&key=${GOOGLE_PLACES_API_KEY}`,
                { signal: apiResController.current.signal }
              );
              attThumbnail = attractionImg.url;
            } else {
              attThumbnail = errorImg;
            }

            locationCode = regionAttrations.results[i].plus_code != undefined ? regionAttrations.results[i].plus_code : undefined;

            // Check if the locationCode object contins the "compound_code" key.
            if (Object.keys(locationCode).includes("compound_code")) {
              locationName = locationCode.compound_code.substring(locationCode.compound_code.search(" ") + 1);
              if (locationName == undefined) {
                locationName = "unknown";
              } else {
                // Remove any brackets or numbers found in the string and return the city and country found in the string.
                locationName = getCityCountry(locationName.replace(/(\(.*?\)|\d)/g, ""));
              }
            } else {
              if (locationName.length == 0) {
                locationName = "unknown";
              }
            }

            attractionType = regionAttrations.results[i].types[1].replace(/_/g, " ");
            attractionLocations.push({
              att_name:
                regionAttrations.results[i].name.length > 30
                  ? regionAttrations.results[i].name.substring(0, 30) + "..."
                  : regionAttrations.results[i].name,
              att_lat: regionAttrations.results[i].geometry.location.lat,
              att_lng: regionAttrations.results[i].geometry.location.lng,
              att_rating: regionAttrations.results[i].rating != undefined ? regionAttrations.results[i].rating : 0,
              att_total_reviews: formatReviewsNum(regionAttrations.results[i].user_ratings_total),
              att_type: attractionType.charAt(0).toUpperCase() + attractionType.substring(1),
              att_place_id: regionAttrations.results[i].place_id,
              att_location: locationName,
              att_thumbnail_url: { uri: attThumbnail },
            });
          }
        }
      } catch (error) {
        console.error(error);
        if (error.name == "AbortError") {
          apiCallInProgress.current = false;
        } else {
          apiCallInProgress.current = false;
          alert("An Error has occured, please try again.");
        }
      }

      apiCallInProgress.current = false;
      setRegion(newRegion);
      setAttractionLocations(attractionLocations);
    }
  };

  // Modify the string input and return the city and country from the inputed string.
  const getCityCountry = (locationStr) => {
    const regex = /\d+|[+]|\+/;
    let modLocationStr = "";
    let locationArr = locationStr.split(",");
    let cityArrLen = locationArr.length;
    cityArrLen >= 2
      ? (modLocationStr = `${locationArr[locationArr.length - 2]},${locationArr[locationArr.length - 1]}`.trim())
      : (modLocationStr = `${locationArr[locationArr.length - 1]}`.trim());
    if (regex.test(modLocationStr)) {
      modLocationStr = `${locationArr[locationArr.length - 1]}`.trim();
    }
    return modLocationStr;
  };

  const formatReviewsNum = (number) => {
    const formatter = Intl.NumberFormat("en", { notation: "compact" });
    return formatter.format(number);
  };

  const AttractionInfoCard = () => (
    <TouchableWithoutFeedback
      onPress={() => {
        setScreenData(selectedMarker);
        navigation.navigate("AttractionDetails");
      }}>
      <View style={styles.attractionCard}>
        <Image style={{ aspectRatio: 1 }} source={selectedMarker.att_thumbnail_url} />
        <View style={styles.rightContainer}>
          <Text style={styles.cardTitle}>{selectedMarker.att_name}</Text>
          <TouchableWithoutFeedback
            onPress={() => {
              setAttractionCardShown(false);
            }}>
            <View style={styles.closeBtn}>
              <View style={styles.closeBackdrop} />
              <AntDesign name="closecircle" size={24} color="#252B34" />
            </View>
          </TouchableWithoutFeedback>
          <View style={{ flexDirection: "row" }}>
            <FontAwesome name="map-marker" size={18} color="#00A8DA" style={{ marginTop: 3, marginRight: 5 }} />
            <Text style={styles.cardSubtitle}>{selectedMarker.att_location}</Text>
          </View>
          <View style={[styles.cardGroupContent, styles.cardFooter]}>
            <Text style={styles.cardTitle}>{selectedMarker.att_type}</Text>
            <View style={styles.cardGroupContent}>
              <FontAwesome name="star" size={13} color="#f3cc4b" style={{ marginTop: 7, marginRight: 3 }} />
              <Text style={styles.cardTitle}>{`${selectedMarker.att_rating} (${selectedMarker.att_total_reviews})`}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  useFocusEffect(
    useCallback(() => {
      // When leaving the screen, cancel any api requests that are currently in progress.
      return () => {
        if (apiResController.current && apiCallInProgress.current) {
          apiResController.current.abort();
        }
      };
    }, [])
  );

  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        toolbarEnabled={false}
        customMapStyle={mapStyle}
        loadingEnabled={true}
        loadingIndicatorColor="#00A8DA"
        loadingBackgroundColor="#101d23"
        region={region}
        onRegionChangeComplete={changeRegion}>
        {route.params != undefined ? (
          <Marker pinColor={"#356EED"} coordinate={{ latitude: route.params.destination_lat, longitude: route.params.destination_lng }} />
        ) : (
          attractionLocations.map((marker, index) => (
            <Marker
              key={index}
              pinColor={"#356EED"}
              coordinate={{ latitude: marker.att_lat, longitude: marker.att_lng }}
              onPress={() => {
                setAttractionCardShown(true);
                setSelectedMarker(marker);
              }}
            />
          ))
        )}
      </MapView>
      {attractionCardShown ? <AttractionInfoCard /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },

  attractionCard: {
    backgroundColor: "#101d23",
    position: "absolute",
    bottom: 30,
    left: 10,
    right: 10,
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
  },

  cardTitle: {
    fontFamily: "RalewayBold",
    color: "white",
    marginBottom: 5,
    marginRight: 10,
  },

  cardSubtitle: {
    fontFamily: "RalewayBold",
    color: "#919196",
  },

  rightContainer: {
    flex: 1,
    padding: 10,
  },

  cardGroupContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cardFooter: {
    position: "relative",
    top: 10,
    bottom: 0,
  },

  closeBackdrop: {
    height: 18,
    width: 18,
    backgroundColor: "white",
    borderRadius: 50,
    position: "absolute",
    right: 4,
    top: 4,
  },

  closeBtn: {
    position: "absolute",
    top: 5,
    right: 7,
  },
});
