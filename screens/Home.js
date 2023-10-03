import { useRef, useState, useCallback } from "react";
import { View, Text, Image, StyleSheet, TouchableWithoutFeedback, useWindowDimensions, FlatList, TouchableOpacity } from "react-native";
import { Button } from "@rneui/themed";
import { FontAwesome, Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GOOGLE_PLACES_API_KEY } from "@env";
import * as Location from "expo-location";
import AttractionCard from "../components/AttractionCard";
import AccountIconModal from "../components/AccountIconModal";

export default function Home({ navigation }) {
  const accountIconModalRef = useRef(null);
  const searchbarRef = useRef(null);
  const screenFirstVisit = useRef(true);
  const cityLoadingOnScreenLeave = useRef(false);
  const attLoadingOnScreenLeave = useRef(false);
  const apiResController = useRef(null);
  const [modalVisable, setModalVisable] = useState(false);
  const [cityData, setcityData] = useState([]);
  const [attractionData, setAttractionData] = useState([]);
  const [cityLoading, setCityLoading] = useState(true);
  const [attLoading, setAttLoading] = useState(true);
  const width = useWindowDimensions().width;
  const height = useWindowDimensions().height;
  const errorImg = require("../assets/images/error_loading.jpg");
  let attTimeout = null;
  let locationErrorMsg = "Unable to locate attractions nearby. \nMake sure your Location Services are turned on.";
  let citySectionLoading = true;
  let attSectionLoading = true;

  const getCountryandCityInfo = async () => {
    let cityInfo = [];
    let cityImgIndex = 0;

    if (cityLoadingOnScreenLeave) {
      citySectionLoading = true;
      setCityLoading(true);
    }

    try {
      const countryResponse = await fetch("https://countriesnow.space/api/v0.1/countries", { signal: apiResController.current.signal });
      if (countryResponse.ok) {
        const countryData = await countryResponse.json();

        // Randomly Select 6 coutries and cities. Ignoring any countries that contains no cities.
        for (let i = 0; i < 6; i++) {
          cityImgIndex = 0;
          let randCountryDataIndex = genRandNum(countryData.data.length);

          while (countryData.data[randCountryDataIndex].cities.length == 0) {
            randCountryDataIndex = genRandNum(countryData.data.length);
          }

          let randCityDataIndex = genRandNum(countryData.data[randCountryDataIndex].cities.length);

          // Format City and Country string. Remove any whitespace at the beginning or end of the two strings before they are merged.
          let selectedCity = `${countryData.data[randCountryDataIndex].cities[randCityDataIndex].trim()}, ${countryData.data[
            randCountryDataIndex
          ].country.trim()}`;

          // Remove any brackets found in the returned string.
          selectedCity = selectedCity.replace(/\(.*?\)/g, "");

          // Remove any additional spaces found.
          selectedCity = selectedCity.replace(/\s(?=\,)/, "");

          // Save full city name for city details screen.
          let selectedCityFullName = selectedCity;

          // Get city image ref ID and place ID.
          const cityDataResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${selectedCity}&inputtype=textquery&fields=photos,place_id,geometry&key=${GOOGLE_PLACES_API_KEY}`,
            { signal: apiResController.current.signal }
          );

          // Add an ellipsis to any overflow text.
          if (selectedCity.length > 30) {
            selectedCity = selectedCity.substring(0, 30) + "...";
          }

          if (cityDataResponse.ok) {
            const cityResData = await cityDataResponse.json();
            if (cityResData.status == "OK") {
              // If the data returned contains more than 1 images, randomly select 1 of the images and check for empty data before changing the data index.
              if (cityResData.candidates.length > 1) {
                cityImgIndex = genRandNum(cityResData.candidates.length);

                while (!Object.keys(cityResData.candidates[cityImgIndex]).includes("photos")) {
                  cityImgIndex = genRandNum(cityResData.candidates.length);
                }
              }

              // Check if the "photos" key is in the response.
              if (Object.keys(cityResData.candidates[cityImgIndex]).includes("photos")) {
                // Get the city image using the ref ID from the previous call.
                const cityImage = await fetch(
                  `https://maps.googleapis.com/maps/api/place/photo?photoreference=${cityResData.candidates[cityImgIndex].photos[0].photo_reference}&maxheight=200&key=${GOOGLE_PLACES_API_KEY}`,
                  { signal: apiResController.current.signal }
                );
                cityInfo.push({
                  city: selectedCity,
                  cityFullName: selectedCityFullName,
                  image: cityImage.ok ? { uri: cityImage.url } : errorImg,
                  place_id: cityResData.candidates[cityImgIndex].place_id,
                  latlng: cityResData.candidates[cityImgIndex].geometry.location,
                  id: i,
                });
              } else {
                cityInfo.push({
                  city: selectedCity,
                  cityFullName: selectedCityFullName,
                  image: errorImg,
                  id: i,
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    }

    citySectionLoading = false;
    setcityData(cityInfo);
    setCityLoading(false);
  };

  // Generate a random number with the limit being the parameter given.
  const genRandNum = (limit) => {
    return Math.floor(Math.random() * limit);
  };

  const getNearbyAttractions = async () => {
    let attractionInfo = [];
    let attLocation = "";

    if (attLoadingOnScreenLeave) {
      attSectionLoading = true;
      setAttLoading(true);
    }

    // Ask for location permission.
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status == "denied") {
      attSectionLoading = false;
      setAttLoading(false);
      return;
    }

    locationErrorMsg = "";

    // Timeout if current location takes too long to be recieved.
    attTimeout = setTimeout(() => {
      if (attSectionLoading) {
        getNearbyAttractions();
      }
    }, 10000);

    // Get the user's current location if user accepts the location propmpt.
    let position = await Location.getCurrentPositionAsync({});

    try {
      // Get Nearby Attractions that are labled as tourist attractions and fall into a circle with a radius of 10 miles centered around the user's current location.
      const nearbyAttrationsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${`${position.coords.latitude},${position.coords.longitude}`}&radius=16093&type=tourist_attraction&key=${GOOGLE_PLACES_API_KEY}`,
        { signal: apiResController.current.signal }
      );

      if (!nearbyAttrationsResponse.ok) {
        attractionInfo.push({
          name: "Unknown",
          rating: 0,
          total_reviews: 0,
          image: errorImg,
          location: "Unknown",
        });
      } else {
        const attractionResponse = await nearbyAttrationsResponse.json();

        // Loop through the retuned data to grab info about the attractions. Data Grabbed include the name of the attaction, overall star rating, total reviews, thumbnail, location(latitude, longitude, city) and attraction id.
        for (let i = 0; i < attractionResponse.results.length; i++) {
          const attImageResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/photo?photoreference=${attractionResponse.results[i].photos[0].photo_reference}&maxheight=200&key=${GOOGLE_PLACES_API_KEY}`,
            { signal: apiResController.current.signal }
          );

          const locationCode = attractionResponse.results[i].plus_code;

          // Get the Location of the Attraction from the retuned plus code, otherwise get the location from the vicinity address returned.
          locationCode == undefined
            ? (attLocation = attractionResponse.results[i].vicinity.substring(attractionResponse.results[i].vicinity.lastIndexOf(",") + 2))
            : (attLocation = locationCode.compound_code.substring(locationCode.compound_code.search(" ") + 1));

          attractionInfo.push({
            name: attractionResponse.results[i].name,
            rating: attractionResponse.results[i].rating != undefined ? attractionResponse.results[i].rating : 0,
            total_reviews: attractionResponse.results[i].user_ratings_total != undefined ? attractionResponse.results[i].user_ratings_total : 0,
            thumbnail: attImageResponse.ok ? { uri: attImageResponse.url } : errorImg,
            location: attLocation,
            latlng: attractionResponse.results[i].geometry.location,
            place_id: attractionResponse.results[i].place_id != "NOT_FOUND" ? attractionResponse.results[i].place_id : "NOT_FOUND",
          });
        }
      }
    } catch (error) {
      console.error(error);
    }

    attSectionLoading = false;
    setAttractionData(attractionInfo);
    setAttLoading(false);
  };

  // City card design
  const cityItem = ({ item }) => (
    <TouchableWithoutFeedback
      onPress={() => {
        navigation.navigate("DestinationDetails", {
          name: item.cityFullName,
          place_id: item.place_id,
          latlng: item.latlng,
        });
      }}>
      <View
        style={[styles.backdropBorder, { backgroundColor: "#252B34", width: width / 3.4 }, item.id == 5 ? { marginRight: 0 } : { marginRight: 18 }]}>
        <Image style={[styles.imgPreview, styles.cityImgBorder, styles.backdropBorder]} source={item.image} />
        <View style={styles.cityNameView}>
          <FontAwesome name="map-marker" size={18} color="#00A8DA" style={{ marginTop: 10 }} />
          <Text style={styles.homeResultsHeading}>{item.city}</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  const NoResults = ({ errorMsg }) => (
    <View style={{ flex: 1 }}>
      <Text style={styles.noResults}>{errorMsg}</Text>
    </View>
  );

  // Link the modal visable state with the state of the model component. It's needed to render the dark overlay correctly when the modal is active.
  const modalVisability = (visable) => {
    setModalVisable(!visable);
  };

  useFocusEffect(
    useCallback(() => {
      // Clear the searchbar when navigating to the home screen.
      const searchBarClear = navigation.addListener("focus", () => searchbarRef.current?.clear());

      // Inital call to run on first visit of the screen.
      if (screenFirstVisit.current) {
        getCountryandCityInfo();
        getNearbyAttractions();

        // Check if the user has left the screen while data is loading.
      } else if (cityLoadingOnScreenLeave.current) {
        cityLoadingOnScreenLeave.current = false;
        getCountryandCityInfo();
      } else if (attLoadingOnScreenLeave.current) {
        attLoadingOnScreenLeave.current = false;
        getNearbyAttractions();
      } else if (cityLoadingOnScreenLeave.current && attLoadingOnScreenLeave.current) {
        getCountryandCityInfo();
        getNearbyAttractions();
      }

      // When leaving the screen, cancel any api requests that are currently in progress.
      return () => {
        searchBarClear;
        clearTimeout(attTimeout);
        screenFirstVisit.current = false;
        if (apiResController.current && citySectionLoading) {
          cityLoadingOnScreenLeave.current = true;
          apiResController.current.abort();
        } else if (apiResController.current && attSectionLoading) {
          attLoadingOnScreenLeave = true;
          apiResController.current.abort();
        }
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      {modalVisable ? (
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => {
            accountIconModalRef.current.handleCloseModal();
          }}
        />
      ) : null}
      <View style={styles.topElements}>
        {/* Top Left View */}
        <View>
          <Text style={styles.greeting}>Good Evening</Text>
          <Text style={styles.heading}>Where do you want to go?</Text>
        </View>

        {/* Top Right View */}
        <View style={{ marginTop: 20 }}>
          <AccountIconModal ref={accountIconModalRef} modalVisableState={modalVisability} />
        </View>
      </View>

      {/* Searchbar */}
      <View style={{ flexDirection: "row" }}>
        <Feather
          name="search"
          size={24}
          color="white"
          style={{
            paddingTop: 40,
            paddingLeft: 5,
            position: "absolute",
            zIndex: 1,
          }}
        />
        <GooglePlacesAutocomplete
          placeholder="Search Destinations"
          enablePoweredByContainer={false}
          fetchDetails={true}
          ref={searchbarRef}
          onFail={() => <NoResults errorMsg={"An error has occurred"} />}
          onNotFound={() => <NoResults errorMsg={"No results were found"} />}
          listEmptyComponent={() => <NoResults errorMsg={"No results were found"} />}
          renderRow={(rowData) => (
            <View style={{ flexDirection: "row" }}>
              <FontAwesome name="map-marker" size={18} color="#00A8DA" style={{ paddingRight: 10 }} />
              <Text style={{ color: "white" }}>{rowData.description}</Text>
            </View>
          )}
          query={{
            types: "(regions)",
            key: GOOGLE_PLACES_API_KEY,
          }}
          onPress={(data, details) => {
            navigation.navigate("DestinationDetails", {
              name: data.description,
              place_id: details.place_id,
              latlng: details.geometry.location,
              country: data.types.includes("country"),
            });
          }}
          textInputProps={{
            placeholderTextColor: "white",
          }}
          styles={{
            textInput: {
              backgroundColor: "#252B34",
              fontFamily: "RalewayBold",
              borderBottomWidth: 0,
              height: 65,
              borderRadius: 15,
              paddingLeft: 34,
              marginTop: 20,
              color: "white",
            },
            row: {
              backgroundColor: "#252B34",
              padding: 13,
              height: 44,
              flexDirection: "row",
            },
            separator: {
              height: 1,
              backgroundColor: "white",
              color: "white",
            },
          }}
        />
      </View>

      {/* Cities View */}
      <View>
        <Text style={styles.sectionHeading}>Cities to Explore</Text>
        {cityLoading ? (
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
            data={cityData}
            renderItem={cityItem}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={<Text style={styles.noData}>Unable to Find Cities to Explore.</Text>}
          />
        )}
      </View>

      {/* Nearby Attractions */}
      <View>
        <Text style={styles.sectionHeading}>Nearby Attractions</Text>
        {attLoading ? (
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
            contentContainerStyle={cityData.length == 0 ? { paddingBottom: height / 2.1 } : { paddingBottom: height / 1.7 }}
            data={attractionData}
            renderItem={({ item }) => <AttractionCard navigation={navigation} details={item} />}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            ListEmptyComponent={<Text style={styles.noData}>{locationErrorMsg == "" ? "No Attractions Found Nearby." : locationErrorMsg}</Text>}
          />
        )}
      </View>
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

  topElements: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  greeting: {
    color: "#919196",
    fontFamily: "RalewayBold",
    fontSize: 20,
    marginTop: 20,
    marginBottom: 10,
  },

  heading: {
    color: "white",
    fontFamily: "RalewayBold",
    fontSize: 33,
    width: 225,
  },

  sectionHeading: {
    fontFamily: "RalewayBold",
    color: "white",
    fontSize: 18,
    marginVertical: 10,
  },

  homeResultsHeading: {
    fontFamily: "RalewayBold",
    fontSize: 13,
    color: "white",
    marginTop: 7,
    paddingHorizontal: 7,
  },

  cityNameView: {
    flexDirection: "row",
    paddingHorizontal: 7,
    paddingBottom: 7,
  },

  backdropBorder: {
    borderRadius: 10,
  },

  imgPreview: {
    height: 85,
    width: 115,
  },

  cityImgBorder: {
    borderColor: "white",
    borderWidth: 1,
  },

  attImgPreview: {
    marginBottom: 15,
    marginRight: 30,
    justifyContent: "flex-end",
    height: 130,
  },

  ListItemContainer: {
    backgroundColor: "#252B34",
  },

  ListItemText: {
    color: "white",
    fontFamily: "RalewayBold",
    fontSize: 20,
    paddingBottom: 5,
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

  noResults: {
    fontFamily: "RalewayBold",
    color: "white",
    marginBottom: 5,
    paddingLeft: 5,
  },

  overlay: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
});
