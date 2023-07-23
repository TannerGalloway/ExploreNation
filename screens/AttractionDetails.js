import { useState, useEffect } from "react";
import { View, ScrollView, Text, Image, StyleSheet, useWindowDimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import AnimatedDotsCarousel from "react-native-animated-dots-carousel";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FontAwesome } from "@expo/vector-icons";
import { Button } from "@rneui/themed";
import { SERPAPI_KEY } from "@env";
import Map from "../components/Map";

export default function AttractionDetails({ route }) {
  const width = useWindowDimensions().width - 40;
  const [index, setIndex] = useState(0);
  const [additionalattractionData, setAdditionalAttractionData] = useState([]);
  const [attDataLoading, setAttDataLoading] = useState(true);
  let attImageData = [];
  let additionalAttractionInfo = {};

  const getAttractionInfo = async () => {
    try {
      // Get additional attraction details
      fetch(`https://serpapi.com/search.json?engine=google_maps&place_id=${route.params.place_id}&api_key=${SERPAPI_KEY}`)
        .then((attractionDetailsRes) => attractionDetailsRes.json())
        .then((attractionDetails) => {
          if (attractionDetails.search_metadata.status != "Success") {
            additionalAttractionInfo = {
              attType: "Unknown",
              description: "Unable to find info.",
              photos: Object.values(route.params.thumbnail),
            };
          } else {
            additionalAttractionInfo = {
              attType: attractionDetails.place_results.type[0],
              description: attractionDetails.place_results.description,
            };
          }

          // Get additional attraction photos
          fetch(`https://serpapi.com/search.json?engine=google_maps_photos&data_id=${attractionDetails.place_results.data_id}&api_key=${SERPAPI_KEY}`)
            .then((attractionPhotosRes) => attractionPhotosRes.json())
            .then((attractionPhotos) => {
              if (attractionPhotos.search_metadata.status != "Success") {
                additionalAttractionInfo = {
                  attType: "Unknown",
                  description: "Unable to find info.",
                  photos: Object.values(route.params.thumbnail),
                };
              } else {
                for (let i = 0; i < attractionPhotos.photos.length; i++) {
                  attImageData.push(attractionPhotos.photos[i].image);
                }
                additionalAttractionInfo = {
                  attType: attractionDetails.place_results.type[0],
                  description: attractionDetails.place_results.description,
                  photos: attImageData,
                };
              }
              setAdditionalAttractionData(additionalAttractionInfo);
              setAttDataLoading(false);
            });
        });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
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
                width={width}
                height={width - 80}
                data={additionalattractionData.photos}
                scrollAnimationDuration={1000}
                pagingEnabled={true}
                onProgressChange={(offset, progress) => {
                  setIndex(Math.round(progress));
                }}
                renderItem={({ item }) => <Image style={{ height: width - 80, borderRadius: 25, margin: 5 }} source={{ uri: item }} />}
              />
            </GestureHandlerRootView>

            {/* Image Pagination Dots */}
            <View style={styles.imagePagination}>
              <AnimatedDotsCarousel
                length={additionalattractionData.photos.length}
                currentIndex={index}
                maxIndicators={additionalattractionData.photos.length}
                activeIndicatorConfig={{
                  color: "#00A8DA",
                  margin: 3,
                  opacity: 1,
                  size: 9,
                }}
                inactiveIndicatorConfig={{
                  color: "white",
                  margin: 3,
                  opacity: 0.5,
                  size: 9,
                }}
                decreasingDots={[
                  {
                    config: { color: "white", margin: 3, opacity: 0.5, size: 6 },
                    quantity: 1,
                  },
                  {
                    config: { color: "white", margin: 3, opacity: 0.5, size: 4 },
                    quantity: 1,
                  },
                ]}
              />
            </View>

            {/* Attraction Heading*/}
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              {/* Left Heading View */}
              <View>
                <Text style={styles.title}>{route.params.name}</Text>
                <View style={{ flexDirection: "row", marginTop: 15 }}>
                  <FontAwesome name="map-marker" size={26} color="#00A8DA" style={{ paddingRight: 10 }} />
                  <Text style={styles.location}>{route.params.location}</Text>
                </View>
              </View>

              {/* Right Heading View */}
              <View>
                <View style={styles.ratingView}>
                  <FontAwesome name="star" size={15} color="#f3cc4b" style={{ marginTop: 3, marginRight: 6 }} />
                  <Text style={styles.subText}>{route.params.rating}</Text>
                </View>
                <Text style={[styles.subText, { marginTop: 15 }]}>{additionalattractionData.attType}</Text>
              </View>
            </View>

            {/* Body Content */}
            <Text style={[styles.title, styles.spacingTopBottom]}>About</Text>
            <Text style={{ color: "#919196", fontSize: 14, marginTop: 5 }}>{additionalattractionData.description}</Text>
            <Text style={[styles.title, styles.spacingTopBottom]}>Location</Text>
            <View style={[styles.mapView, { height: width - 80, width: width }]}>
              <Map latlng={route.params.latlng} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101d23",
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  imagePagination: {
    flex: 0.1,
    alignItems: "center",
    marginTop: 20,
  },

  title: {
    color: "white",
    fontFamily: "RalewayBold",
    fontSize: 18,
    maxWidth: 300,
  },

  location: {
    justifyContent: "center",
    color: "#919196",
    fontFamily: "RalewayBold",
    fontSize: 15,
  },

  subText: {
    color: "#919196",
    fontSize: 15,
    fontWeight: "bold",
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
