import { useState, useEffect } from "react";
import { View, ScrollView, Text, Image, StyleSheet, useWindowDimensions, FlatList, TouchableWithoutFeedback, ImageBackground } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Carousel from "react-native-reanimated-carousel";
import AnimatedDotsCarousel from "react-native-animated-dots-carousel";
import { Button } from "@rneui/themed";
import { FontAwesome } from "@expo/vector-icons";
import { SERPAPI_KEY, API_NINJAS_KEY, WEATHER_API_KEY, GOOGLE_PLACES_API_KEY } from "@env";

export default function CityDetails({ route }) {
  const width = useWindowDimensions().width;
  const height = useWindowDimensions().height;
  const [index, setIndex] = useState(0);
  const [cityData, setCityData] = useState([]);
  const [attractionData, setAttractionData] = useState([]);
  const [cityDataLoading, SetCityDataLoading] = useState(true);
  const [attractionDataLoading, SetAttractionDataLoading] = useState(true);
  let cityImgData = [];
  let popAttractionData = [];
  cityInfo = {
    city: route.params.cityName.substring(0, route.params.cityName.indexOf(",")).trim(),
    country: route.params.cityName.slice(route.params.cityName.indexOf(",") + 1).trim(),
  };
  const cityDataErrorObj = {
    photos: require("../assets/images/error_loading.jpg"),
  };
  const attDataErrorObj = {
    name: "Unknown",
    thumbnail: require("../assets/images/error_loading.jpg"),
    rating: 0,
    total_reviews: 0,
  };

  const getCityInfo = async () => {
    try {
      // Get city details
      const cityDetailsRes = await fetch(
        `https://serpapi.com/search.json?engine=google_maps&place_id=${route.params.place_id}&api_key=${SERPAPI_KEY}`
      );
      const cityDetails = await cityDetailsRes.json();

      if (cityDetails.search_metadata.status != "Success") {
        cityInfo = cityDataErrorObj;
      } else {
        // Get city photos
        const cityPhotosRes = await fetch(
          `https://serpapi.com/search.json?engine=google_maps_photos&data_id=${cityDetails.place_results.data_id}&api_key=${SERPAPI_KEY}`
        );
        const cityPhotos = await cityPhotosRes.json();

        if (cityPhotos.search_metadata.status != "Success") {
          cityInfo = cityDataErrorObj;
        } else {
          for (let i = 0; i < cityPhotos.photos.length; i++) {
            cityImgData.push(cityPhotos.photos[i].image);
          }
          cityInfo.description = cityDetails.place_results.description.snippet;
          cityInfo.photos = cityImgData;
        }
      }

      // Get Population of the selected city.
      const cityPopRes = await fetch(`https://api.api-ninjas.com/v1/city?name=${cityInfo.city}`, { headers: { "X-Api-Key": `${API_NINJAS_KEY}` } });
      const cityPop = await cityPopRes.json();
      cityInfo.population = cityPop.length != 0 ? formatPopNum(cityPop[0].population) : "Unknown";

      // Get the Language spoken and currency used in the Country of the selected city.
      const countryDetailsRes = await fetch(`https://restcountries.com/v3.1/name/${cityInfo.country}`);
      const countryDetails = await countryDetailsRes.json();
      if (countryDetails.status != 404) {
        cityInfo.language = Object.values(countryDetails[0].languages)[0];
        let cityCurrency = Object.values(countryDetails[0].currencies)[0];
        cityCurrency = cityCurrency.name.slice(cityCurrency.name.lastIndexOf(" ") + 1);
        cityInfo.currency = cityCurrency.charAt(0).toUpperCase() + cityCurrency.slice(1);
      } else {
        cityInfo.language = "Unknown";
        cityInfo.currency = "Unknown";
      }

      // Get weather info about the selected city.
      const weatherDataRes = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${route.params.latlng.lat}, ${route.params.latlng.lng}`
      );

      if (!weatherDataRes.ok) {
        cityInfo.temp = "-";
        cityInfo.weatherIcon = require("../assets/images/weather_error.png");
      } else {
        const weatherData = await weatherDataRes.json();
        cityInfo.temp = Math.round(weatherData.current.temp_f);
        cityInfo.weatherIcon =
          weatherData.current.condition.icon != null
            ? { uri: `https:${weatherData.current.condition.icon}` }
            : require("../assets/images/weather_error.png");
      }
    } catch (error) {
      console.error(error);
    }
    setCityData(cityInfo);
    SetCityDataLoading(false);
  };

  const getCityAttractionInfo = async () => {
    try {
      // Get popular attractions found in the selected city.
      const popAttactionRes = await fetch(
        `https://serpapi.com/search.json?engine=google&q=Top+sights+in+${cityInfo.city.replace(/\s/g, "+")}+
        ${cityInfo.country.replace(/\s/g, "+")}&api_key=${SERPAPI_KEY}`
      );
      const popAttaction = await popAttactionRes.json();

      for (let i = 0; i < popAttaction.top_sights.sights.length; i++) {
        // Get Place ID of each attraction.
        const attractionIDRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=
          ${popAttaction.top_sights.sights[i].title.replace(/\s/g, "+")}&inputtype=textquery&fields=place_id&key=${GOOGLE_PLACES_API_KEY}`
        );
        const attractionID = await attractionIDRes.json();

        // Get Star Rating and number of reviews of the attraction.
        const attractionRatingRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?fields=rating%2Cuser_ratings_total&place_id=${attractionID.candidates[0].place_id}&key=${GOOGLE_PLACES_API_KEY}`
        );
        const attractionRating = await attractionRatingRes.json();

        popAttractionData.push({
          name: popAttaction.top_sights.sights[i].title,
          thumbnail: { uri: popAttaction.top_sights.sights[i].thumbnail },
          rating: attractionRating.result.rating != undefined ? attractionRating.result.rating : 0,
          total_reviews: attractionRating.result.user_ratings_total != undefined ? attractionRating.result.user_ratings_total : 0,
        });
      }
    } catch (error) {
      popAttractionData = attDataErrorObj;
      console.error(error);
    }
    setAttractionData(popAttractionData);
    SetAttractionDataLoading(false);
  };

  const formatPopNum = (number) => {
    const formatter = Intl.NumberFormat("en", { notation: "compact" });
    return formatter.format(number);
  };

  // Attraction card design
  const attractionItem = ({ item }) => (
    <TouchableWithoutFeedback
      onPress={() => {
        alert("Navigate to Attraction Details");
      }}>
      <View>
        <ImageBackground style={[styles.attImgPreview, { width: width / 2.45 }]} imageStyle={styles.attBackdropBorder} source={item.thumbnail}>
          <View style={styles.attractionTextView}>
            <Text style={styles.attractionText}>{`${item.name}`}</Text>
            <View style={{ flexDirection: "row" }}>
              <FontAwesome name="star" size={13} color="#f3cc4b" style={{ marginTop: 3, marginRight: 6 }} />
              <Text style={{ color: "#d3d3d3" }}>{`${item.rating} (${item.total_reviews})`}</Text>
            </View>
          </View>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );

  useEffect(() => {
    getCityInfo();
    getCityAttractionInfo();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {cityDataLoading ? (
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
                data={cityData.photos}
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
                length={cityData.photos.length}
                currentIndex={index}
                maxIndicators={cityData.photos.length}
                activeIndicatorConfig={{
                  color: "#00A8DA",
                  margin: 3,
                  opacity: 1,
                  size: 12,
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

            {/* City Heading */}
            <View style={styles.headingView}>
              <View style={{ width: width / 2 }}>
                <Text style={styles.headingText}>{cityInfo.city}</Text>
                <Text style={styles.subHeadingText}>{cityInfo.country}</Text>
              </View>
              <View style={[styles.headingView, { position: "relative" }]}>
                <Image style={styles.weatherImageStyle} source={cityData.weatherIcon} />
                <Text style={[styles.headingText, { marginLeft: 7, marginTop: 7 }]}>{cityData.temp}°F</Text>
              </View>
            </View>

            {/* City Overview */}
            <Text style={[styles.headingText, styles.topSpacing]}>Overview</Text>
            <View style={[styles.headingView, styles.topSpacing]}>
              <View>
                <Text style={styles.headingText}>{cityData.population}</Text>
                <Text style={styles.subHeadingText}>Population</Text>
              </View>
              <View>
                <Text style={styles.headingText}>{cityData.language}</Text>
                <Text style={styles.subHeadingText}>Language</Text>
              </View>
              <View>
                <Text style={styles.headingText}>{cityData.currency}</Text>
                <Text style={styles.subHeadingText}>Currency</Text>
              </View>
            </View>
            <Text style={[styles.description, styles.topSpacing]}>{cityData.description}</Text>
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
              renderItem={attractionItem}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101d23",
    paddingHorizontal: 20,
    paddingTop: 7,
  },

  imagePagination: {
    flex: 0.1,
    alignItems: "center",
    marginTop: 20,
  },

  headingText: {
    color: "white",
    fontFamily: "RalewayBold",
    fontSize: 20,
  },

  subHeadingText: {
    color: "#919196",
    fontFamily: "RalewayMedium",
    fontSize: 16,
  },

  headingView: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  description: {
    color: "white",
    fontFamily: "RalewayRegular",
  },

  topSpacing: {
    marginTop: 20,
  },

  weatherImageStyle: {
    height: 64,
    width: 64,
  },

  attImgPreview: {
    marginBottom: 15,
    marginRight: 30,
    justifyContent: "flex-end",
    height: 130,
  },

  attBackdropBorder: {
    borderColor: "white",
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
    color: "white",
  },

  noData: {
    fontFamily: "RalewayBold",
    color: "white",
    lineHeight: 25,
  },
});
