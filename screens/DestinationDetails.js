import { useState, useEffect, useContext, useRef } from "react";
import { View, ScrollView, Text, Image, StyleSheet, useWindowDimensions, FlatList } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Carousel from "react-native-reanimated-carousel";
import AnimatedDotsCarousel from "react-native-animated-dots-carousel";
import { Button, useTheme, useThemeMode } from "@rneui/themed";
import { SERPAPI_KEY, API_NINJAS_KEY, WEATHER_API_KEY, GOOGLE_PLACES_API_KEY } from "@env";
import { AppContext } from "../utils/AppContext";
import AttractionCardDetailed from "../components/AttractionCardDetailed";

export default function DestinationDetails({ navigation }) {
  const { theme } = useTheme();
  const { mode } = useThemeMode();
  const styles = getStyles(theme);
  const apiResController = useRef(null);
  const width = useWindowDimensions().width;
  const height = useWindowDimensions().height;
  const [index, setIndex] = useState(0);
  const [destinationData, setDestinationData] = useState([]);
  const [attractionData, setAttractionData] = useState([]);
  const [destinationDataLoading, setDestinationDataLoading] = useState(true);
  const [attractionDataLoading, SetAttractionDataLoading] = useState(true);
  const { screenData, setScreenData, tempDisplay } = useContext(AppContext);
  let destinationImgData = [];
  let popAttractionData = [];
  let destinationInfo = {};
  const errorImg = require("../assets/images/error_loading.jpg");
  const destinationDataErrorObj = {
    photos: require("../assets/images/error_loading.jpg"),
  };
  const attDataErrorObj = {
    name: "Unknown",
    thumbnail: require("../assets/images/error_loading.jpg"),
    rating: 0,
    total_reviews: 0,
  };

  if (screenData.destination_isCountry) {
    destinationInfo.country = screenData.destination_name.trim();
  } else if (screenData.destination_name != undefined) {
    destinationInfo.city = screenData.destination_name.substring(0, screenData.destination_name.indexOf(",")).trim();
    destinationInfo.country = screenData.destination_name.substring(screenData.destination_name.lastIndexOf(",") + 1).trim();
    destinationInfo.countryFullName = screenData.destination_name.substring(screenData.destination_name.indexOf(",") + 1).trim();
  } else {
    destinationInfo.city = "Unknown";
    destinationInfo.country = "Unknown";
    destinationInfo.countryFullName = "Unknown";
  }

  // Initialize the abort controller.  Controller needs to be reinitialize after each abort operation performed.
  apiResController.current = new AbortController();

  const getDestinationInfo = async () => {
    try {
      // Get destination details
      const destinationDetailsRes = await fetch(
        `https://serpapi.com/search.json?engine=google_maps&place_id=${screenData.destination_place_id}&api_key=${SERPAPI_KEY}`,
        { signal: apiResController.current.signal }
      );

      if (!destinationDetailsRes.ok) {
        destinationInfo = destinationDataErrorObj;
      } else {
        const destinationDetails = await destinationDetailsRes.json();

        // Get destination photos
        const destinationPhotosRes = await fetch(
          `https://serpapi.com/search.json?engine=google_maps_photos&data_id=${destinationDetails.place_results.data_id}&api_key=${SERPAPI_KEY}`,
          { signal: apiResController.current.signal }
        );

        if (!destinationPhotosRes.ok) {
          destinationInfo = destinationDataErrorObj;
        } else {
          const destinationPhotos = await destinationPhotosRes.json();
          for (let i = 0; i < destinationPhotos.photos.length; i++) {
            destinationImgData.push(destinationPhotos.photos[i].image);
          }
          destinationInfo.description =
            destinationDetails.place_results.description.snippet != undefined
              ? destinationDetails.place_results.description.snippet
              : "Unable to gather information about this destination.";
          destinationInfo.photos = destinationImgData;
          setScreenData({
            destination_name: screenData.destination_name,
            destination_place_id: screenData.destination_place_id,
            destination_lat: screenData.destination_lat,
            destination_lng: screenData.destination_lng,
            destination_thumbnail: destinationInfo.photos[0],
            destination_isCountry: screenData.destination_isCountry,
          });
        }
      }

      // Get population of the selected city.
      if (!screenData.destination_isCountry) {
        const cityPopRes = await fetch(
          `https://api.api-ninjas.com/v1/city?name=${destinationInfo.city}`,
          {
            headers: { "X-Api-Key": `${API_NINJAS_KEY}` },
          },
          { signal: apiResController.current.signal }
        );

        if (!cityPopRes.ok) {
          destinationInfo.population = "Unknown";
        } else {
          const cityPop = await cityPopRes.json();
          if (cityPop.length == 0) {
            destinationInfo.population = "Unknown";
          } else {
            destinationInfo.population = cityPop[0].population != undefined ? formatPopNum(cityPop[0].population) : "Unknown";
          }
        }
      }

      // Get the language spoken, currency used, capital and flag of the country or selected city.
      const countryDetailsRes = await fetch(`https://restcountries.com/v3.1/name/${destinationInfo.country}`, {
        signal: apiResController.current.signal,
      });
      const countryDetails = await countryDetailsRes.json();

      if (!countryDetailsRes.ok) {
        destinationInfo.language = "Unknown";
        destinationInfo.currency = "Unknown";
        destinationInfo.capital = "Unknown";
        destinationInfo.population = "Unknown";
        destinationInfo.flag = require("../assets/images/error_loading.jpg");
      } else {
        destinationInfo.language = Object.values(countryDetails[0].languages)[0];
        if (screenData.destination_isCountry) {
          destinationInfo.capital = countryDetails[0].capital[0];
          destinationInfo.flag = { uri: countryDetails[0].flags.png };
          destinationInfo.countryFullName = countryDetails[0].name.common;
          destinationInfo.population = formatPopNum(countryDetails[0].population);
        } else {
          let cityCurrency = Object.values(countryDetails[0].currencies)[0];
          cityCurrency = cityCurrency.name.substring(cityCurrency.name.lastIndexOf(" ") + 1);
          destinationInfo.currency = cityCurrency.charAt(0).toUpperCase() + cityCurrency.substring(1);
        }
      }

      if (!screenData.destination_isCountry) {
        // Get weather info about the selected city.
        const weatherDataRes = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${screenData.destination_lat}, ${screenData.destination_lng}`,
          { signal: apiResController.current.signal }
        );

        if (!weatherDataRes.ok) {
          destinationInfo.temp = "-";
          destinationInfo.weatherIcon = require("../assets/images/weather_error.png");
        } else {
          const weatherData = await weatherDataRes.json();
          destinationInfo.temp = tempDisplay == 1 ? Math.round(weatherData.current.temp_f) : Math.round(weatherData.current.temp_c);
          destinationInfo.weatherIcon =
            weatherData.current.condition.icon != null
              ? { uri: `https:${weatherData.current.condition.icon}` }
              : require("../assets/images/weather_error.png");
        }
      }
    } catch (error) {
      destinationInfo.temp = "-";
      destinationInfo.language = "Unknown";
      destinationInfo.currency = "Unknown";
      destinationInfo.capital = "Unknown";
      destinationInfo.population = "Unknown";
      destinationInfo.flag = require("../assets/images/error_loading.jpg");
      destinationInfo.weatherIcon = require("../assets/images/weather_error.png");
      alert("An Error has occured, please try again.");
    }

    setDestinationData(destinationInfo);
    setDestinationDataLoading(false);
  };

  const getDestinationAttractionInfo = async () => {
    try {
      // Get popular attractions found in the selected destination.
      const popAttactionRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${screenData.destination_lat},${screenData.destination_lng}&radius=80468&type=tourist_attraction&key=${GOOGLE_PLACES_API_KEY}`
      );
      const popAttaction = await popAttactionRes.json();

      if (popAttaction.status == "OK") {
        for (let i = 0; i < popAttaction.results.length; i++) {
          // Get the thumbnail of each attraction returned from the api.
          if (popAttaction.results[i].photos != undefined) {
            const attImageResponse = await fetch(
              `https://maps.googleapis.com/maps/api/place/photo?photoreference=${popAttaction.results[i].photos[0].photo_reference}&maxheight=200&key=${GOOGLE_PLACES_API_KEY}`,
              { signal: apiResController.current.signal }
            );
            attThumbnail = { uri: attImageResponse.url };
          } else {
            attThumbnail = errorImg;
          }

          if (popAttaction.results.length != 0) {
            popAttractionData.push({
              name: popAttaction.results[i].name,
              rating: "rating" in popAttaction.results[i] ? popAttaction.results[i].rating : 0,
              total_reviews: "user_ratings_total" in popAttaction.results[i] ? popAttaction.results[i].user_ratings_total : 0,
              thumbnail: attThumbnail,
              location: screenData.destination_name,
              latlng: popAttaction.results[i].geometry.location,
              place_id: "place_id" in popAttaction.results[i] ? popAttaction.results[i].place_id : "NOT_FOUND",
            });
          }
        }
      }
    } catch (error) {
      popAttractionData = attDataErrorObj;
      alert("An Error has occured, please try again.");
    }

    setAttractionData(popAttractionData);
    SetAttractionDataLoading(false);
  };

  const formatPopNum = (number) => {
    const formatter = Intl.NumberFormat("en", { notation: "compact" });
    return formatter.format(number);
  };

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: mode == "dark" ? "#101d23" : "white",
      },
      headerTintColor: mode == "dark" ? "white" : "black",
    });
    getDestinationInfo();
    getDestinationAttractionInfo();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {destinationDataLoading ? (
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
                data={destinationData.photos}
                loading={true}
                scrollAnimationDuration={1000}
                pagingEnabled={true}
                onProgressChange={(offset, progress) => {
                  setIndex(Math.round(progress));
                }}
                renderItem={({ item }) => <Image style={{ height: height / 3, borderRadius: 25, margin: 5 }} source={{ uri: item }} />}
              />
            </GestureHandlerRootView>

            {/* Image Pagination Dots */}
            <View style={[styles.imagePagination, { marginBottom: 20 }]}>
              <AnimatedDotsCarousel
                length={destinationData.photos.length}
                currentIndex={index}
                maxIndicators={destinationData.photos.length}
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

            {/* Country/City Heading */}
            <View style={styles.headingView}>
              <View style={{ width: width / 2 }}>
                <Text style={styles.headingText}>{screenData.destination_isCountry ? destinationData.countryFullName : destinationData.city}</Text>
                {screenData.destination_isCountry ? null : <Text style={styles.subHeadingText}>{destinationData.countryFullName}</Text>}
              </View>
              <View style={[styles.headingView, { position: "relative" }]}>
                <Image
                  style={[styles.headerImageBase, screenData.destination_isCountry ? styles.flagIcon : styles.weatherIcon]}
                  source={screenData.destination_isCountry ? destinationData.flag : destinationData.weatherIcon}
                />
                {screenData.destination_isCountry ? null : (
                  <Text style={[styles.headingText, { marginLeft: 7, marginTop: 7 }]}>
                    {destinationData.temp}°{tempDisplay == 1 ? "F" : "C"}
                  </Text>
                )}
              </View>
            </View>

            {/* Country/City Overview */}
            <Text style={[styles.headingText, styles.topSpacing]}>Overview</Text>
            <View style={[styles.headingView, styles.topSpacing]}>
              <View>
                <Text style={styles.headingText}>{destinationData.population}</Text>
                <Text style={styles.subHeadingText}>Population</Text>
              </View>
              <View>
                <Text style={styles.headingText}>{destinationData.language}</Text>
                <Text style={styles.subHeadingText}>Language</Text>
              </View>
              <View>
                <Text style={styles.headingText}>{screenData.destination_isCountry ? destinationData.capital : destinationData.currency}</Text>
                <Text style={styles.subHeadingText}>{screenData.destination_isCountry ? "Capital" : "Currency"}</Text>
              </View>
            </View>
            <Text style={[styles.description, styles.topSpacing]}>{destinationData.description}</Text>
          </>
        )}
        {/* Popular Attractions Display */}
        <View>
          <Text style={[styles.headingText, styles.topSpacing, { marginBottom: 20 }]}>Popular Attractions</Text>
          {attractionDataLoading ? (
            <Button
              type="clear"
              disabled={true}
              loading={true}
              loadingProps={{
                size: "large",
              }}
            />
          ) : (
            <FlatList
              data={attractionData}
              renderItem={({ item }) => <AttractionCardDetailed navigation={navigation} details={item} />}
              scrollEnabled={false}
              numColumns={2}
              ListEmptyComponent={<Text style={styles.noData}>Unable to find Attractions.</Text>}
            />
          )}
        </View>
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

    imagePagination: {
      flex: 0.1,
      alignItems: "center",
      marginTop: 20,
    },

    headingText: {
      color: theme.colors.text,
      fontFamily: "RalewayBold",
      fontSize: 20,
    },

    subHeadingText: {
      color: theme.colors.subtext,
      fontFamily: "RalewayMedium",
      fontSize: 16,
    },

    headingView: {
      flexDirection: "row",
      justifyContent: "space-between",
    },

    description: {
      color: theme.colors.text,
      fontFamily: "RalewayRegular",
    },

    topSpacing: {
      marginTop: 20,
    },

    headerImageBase: {
      height: 65,
      borderRadius: 5,
    },

    flagIcon: {
      width: 94,
    },

    weatherIcon: {
      width: 75,
    },

    attImgPreview: {
      marginBottom: 15,
      marginRight: 30,
      justifyContent: "flex-end",
      height: 130,
    },

    attBackdropBorder: {
      borderColor: theme.colors.text,
      borderWidth: 1,
      borderRadius: 10,
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
      color: theme.colors.text,
    },

    noData: {
      fontFamily: "RalewayBold",
      color: theme.colors.text,
      lineHeight: 25,
      marginBottom: 20,
    },
  });
};
