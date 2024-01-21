import { useRef, useState, useCallback, useContext } from "react";
import { View, Text, Image, StyleSheet, TouchableWithoutFeedback, useWindowDimensions, FlatList, TouchableOpacity } from "react-native";
import { supabase } from "../utils/supabaseClient";
import { Button, useTheme } from "@rneui/themed";
import { FontAwesome, Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GOOGLE_PLACES_API_KEY } from "@env";
import { AppContext } from "../utils/AppContext";
import * as Location from "expo-location";
import AttractionCardDetailed from "../components/AttractionCardDetailed";
import AccountIconModal from "../components/AccountIconModal";

export default function Home({ navigation }) {
  const { theme } = useTheme();
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
  const { setScreenData, setCurrentLocation, username, setUsername, setProfilePic } = useContext(AppContext);
  const width = useWindowDimensions().width;
  const height = useWindowDimensions().height;
  const styles = getStyles(theme);
  const errorImg = require("../assets/images/error_loading.jpg");
  let attTimeout = null;
  let locationErrorMsg = "Unable to locate attractions nearby. \nMake sure your Location Services are turned on.";
  let citySectionLoading = true;
  let attSectionLoading = true;

  const loadUserData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let defaultUserName = user.email.slice(0, user.email.indexOf("@"));

    const { data, error } = await supabase.from("profiles").select("username, profilePic_uri").match({ id: user.id });

    if (error) {
      setProfilePic(`https://ui-avatars.com/api/?name=${defaultUserName}`);
    }

    setUsername(data[0].username);
    setProfilePic(data[0].profilePic_uri);
  };

  const greeting = () => {
    let currentDate = new Date();
    let hours = currentDate.getHours();
    let greeting = "";
    if (hours < 12) {
      greeting = username == null ? "Morning" : "Morning,";
    } else if (hours >= 12 && hours <= 17) {
      greeting = username == null ? "Afternoon" : "Afternoon,";
    } else if (hours >= 17 && hours <= 24) {
      greeting = username == null ? "Evening" : "Evening,";
    }
    return (
      <Text style={styles.greeting}>
        Good {greeting} {username}
      </Text>
    );
  };

  const getCountryandCityInfo = async () => {
    let cityInfo = [];
    let cityImgIndex = 0;

    if (cityLoadingOnScreenLeave.current) {
      citySectionLoading = true;
      setCityLoading(true);
    }

    // Initialize the abort controller.  Controller needs to be reinitialize after each abort operation performed.
    apiResController.current = new AbortController();

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
                  thumbnail: cityImage.ok ? { uri: cityImage.url } : errorImg,
                  place_id: cityResData.candidates[cityImgIndex].place_id,
                  latlng: cityResData.candidates[cityImgIndex].geometry.location,
                  id: i,
                });
              } else {
                cityInfo.push({
                  city: selectedCity,
                  cityFullName: selectedCityFullName,
                  thumbnail: errorImg,
                  id: i,
                });
              }
            }
          }
        }
      }
    } catch (error) {
      alert("An Error has occured, please try again.");
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
    let attThumbnail = errorImg;

    if (attLoadingOnScreenLeave.current) {
      attSectionLoading = true;
      setAttLoading(true);
    }

    // Initialize the abort controller.  Controller needs to be reinitialize after each abort operation performed.
    apiResController.current = new AbortController();

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

    // Set current location in app context.
    setCurrentLocation({ location: position });

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
          thumbnail: errorImg,
          location: "Unknown",
        });
      } else {
        const attractionResponse = await nearbyAttrationsResponse.json();

        // Loop through the retuned data to grab info about the attractions. Data Grabbed include the name of the attaction, overall star rating, total reviews, thumbnail, location(latitude, longitude, city) and attraction id.
        for (let i = 0; i < attractionResponse.results.length; i++) {
          if (attractionResponse.results[i].photos != undefined) {
            const attImageResponse = await fetch(
              `https://maps.googleapis.com/maps/api/place/photo?photoreference=${attractionResponse.results[i].photos[0].photo_reference}&maxheight=200&key=${GOOGLE_PLACES_API_KEY}`,
              { signal: apiResController.current.signal }
            );
            attThumbnail = { uri: attImageResponse.url };
          } else {
            attThumbnail = errorImg;
          }

          const locationCode = attractionResponse.results[i].plus_code;

          // Get the Location of the Attraction from the retuned plus code, otherwise get the location from the vicinity address returned.
          locationCode == undefined
            ? (attLocation = attractionResponse.results[i].vicinity.substring(attractionResponse.results[i].vicinity.lastIndexOf(",") + 2))
            : (attLocation = locationCode.compound_code.substring(locationCode.compound_code.search(" ") + 1));

          attractionInfo.push({
            name: attractionResponse.results[i].name,
            rating: attractionResponse.results[i].rating != undefined ? attractionResponse.results[i].rating : 0,
            total_reviews: attractionResponse.results[i].user_ratings_total != undefined ? attractionResponse.results[i].user_ratings_total : 0,
            thumbnail: attThumbnail,
            location: attLocation,
            latlng: attractionResponse.results[i].geometry.location,
            place_id: attractionResponse.results[i].place_id != "NOT_FOUND" ? attractionResponse.results[i].place_id : "NOT_FOUND",
          });
        }
      }
    } catch (error) {
      alert("An Error has occured, please try again.");
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
        setScreenData({
          destination_name: item.cityFullName,
          destination_place_id: item.place_id,
          destination_lat: item.latlng.lat,
          destination_lng: item.latlng.lng,
          destination_isCountry: false,
        });

        navigation.navigate("DestinationDetails");
      }}>
      <View
        style={[
          styles.backdropBorder,
          { backgroundColor: theme.colors.secondaryBackground, width: width / 3.4 },
          item.id == 5 ? { marginRight: 0 } : { marginRight: 18 },
        ]}>
        <Image style={[styles.imgPreview, styles.cityImgBorder, styles.backdropBorder]} source={item.thumbnail} />
        <View style={styles.cityNameView}>
          <FontAwesome name="map-marker" size={18} color={theme.colors.active} style={{ marginTop: 10 }} />
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
      loadUserData();

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
          attLoadingOnScreenLeave.current = true;
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
          {greeting()}
          <Text style={styles.heading}>Where do you want to go?</Text>
        </View>

        {/* Top Right View */}
        <View style={{ marginTop: 20 }}>
          <AccountIconModal ref={accountIconModalRef} modalVisableState={modalVisability} navigation={navigation} />
        </View>
      </View>

      {/* Searchbar */}
      <View style={{ flexDirection: "row" }}>
        <Feather
          name="search"
          size={24}
          color={theme.colors.text}
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
              <FontAwesome name="map-marker" size={18} color={theme.colors.active} style={{ paddingRight: 10 }} />
              <Text style={{ color: theme.colors.text }}>{rowData.description}</Text>
            </View>
          )}
          query={{
            types: "(regions)",
            key: GOOGLE_PLACES_API_KEY,
          }}
          onPress={(data, details) => {
            setScreenData({
              destination_name: data.description,
              destination_place_id: details.place_id,
              destination_lat: details.geometry.location.lat,
              destination_lng: details.geometry.location.lng,
              destination_isCountry: data.types.includes("country"),
            });

            navigation.navigate("DestinationDetails");
          }}
          textInputProps={{
            placeholderTextColor: theme.colors.text,
          }}
          styles={{
            textInput: {
              backgroundColor: theme.colors.secondaryBackground,
              fontFamily: "RalewayBold",
              borderBottomWidth: 0,
              height: 65,
              borderRadius: 15,
              paddingLeft: 34,
              marginTop: 20,
              color: theme.colors.text,
            },
            row: {
              backgroundColor: theme.colors.secondaryBackground,
              padding: 13,
              height: 44,
              flexDirection: "row",
            },
            separator: {
              height: 1,
              backgroundColor: theme.colors.text,
              color: theme.colors.text,
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
            renderItem={({ item }) => <AttractionCardDetailed navigation={navigation} details={item} />}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            ListEmptyComponent={<Text style={styles.noData}>{locationErrorMsg == "" ? "No Attractions Found Nearby." : locationErrorMsg}</Text>}
          />
        )}
      </View>
    </View>
  );
}

const getStyles = (theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20,
      paddingTop: 20,
    },

    topElements: {
      flexDirection: "row",
      justifyContent: "space-between",
    },

    greeting: {
      color: theme.colors.subtext,
      fontFamily: "RalewayBold",
      fontSize: 20,
      marginTop: 20,
      marginBottom: 10,
      maxWidth: 200,
    },

    heading: {
      color: theme.colors.text,
      fontFamily: "RalewayBold",
      fontSize: 33,
      width: 225,
    },

    sectionHeading: {
      fontFamily: "RalewayBold",
      color: theme.colors.text,
      fontSize: 18,
      marginVertical: 10,
    },

    homeResultsHeading: {
      fontFamily: "RalewayBold",
      fontSize: 13,
      color: theme.colors.text,
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
      borderColor: theme.colors.text,
      borderWidth: 1,
    },

    attImgPreview: {
      marginBottom: 15,
      marginRight: 30,
      justifyContent: "flex-end",
      height: 130,
    },

    ListItemContainer: {
      backgroundColor: theme.colors.secondaryBackground,
    },

    ListItemText: {
      color: theme.colors.text,
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
      color: theme.colors.text,
    },

    noData: {
      fontFamily: "RalewayBold",
      color: theme.colors.text,
      lineHeight: 25,
    },

    noResults: {
      fontFamily: "RalewayBold",
      color: theme.colors.text,
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
};
