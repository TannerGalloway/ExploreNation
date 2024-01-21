import { useRef, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback, TouchableOpacity, FlatList } from "react-native";
import { Button, useTheme, useThemeMode } from "@rneui/themed";
import { useFocusEffect } from "@react-navigation/native";
import { FontAwesome5, Feather, MaterialIcons, Foundation } from "@expo/vector-icons";
import { GOOGLE_PLACES_API_KEY } from "@env";
import AccountIconModal from "../components/AccountIconModal";
import GenericCardDesign from "../components/GenericCardDesign";

export default function Discover({ navigation }) {
  const { theme } = useTheme();
  const { mode } = useThemeMode();
  const accountIconModalRef = useRef(null);
  const screenFirstVisit = useRef(true);
  const loadingOnScreenLeave = useRef(false);
  const apiCallInProgress = useRef(false);
  const selectedFilter = useRef("");
  const apiResController = useRef(null);
  const [modalVisable, setModalVisable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attractions, setAttractions] = useState([]);
  const styles = getStyles(theme);
  const errorImg = require("../assets/images/error_loading.jpg");
  let screenLoading = true;
  let dataError = true;

  const getWorldAttractions = async (filterName) => {
    let attractionList = [];
    let locationName = "";
    let locationCode = "";
    let attractionsUrl = "";
    let attThumbnail = null;

    if (loadingOnScreenLeave.current) {
      setLoading(true);
    }

    // If a current api call is in progress when another filter button is selected, cancel the current api call before starting a new call.
    if (apiResController.current && apiCallInProgress.current) {
      apiResController.current.abort();
    }

    // Initialize the abort controller.  Controller needs to be reinitialize after each abort operation performed.
    apiResController.current = new AbortController();

    try {
      apiCallInProgress.current = true;
      const countryResponse = await fetch("https://countriesnow.space/api/v0.1/countries", { signal: apiResController.current.signal });
      if (countryResponse.ok) {
        const countryData = await countryResponse.json();

        // Randomly select 12 countries.
        for (let i = 0; i < 12; i++) {
          let randCountryDataIndex = genRandNum(countryData.data.length);
          let selectedCountry = `${countryData.data[randCountryDataIndex].country.trim()}`;

          // Get top attractions in the selected country based on the filter selected.
          if (filterName.length != 0) {
            attractionsUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=Top+${filterName.replace(
              /\s/g,
              "+"
            )}+Destinations+in+${selectedCountry.replace(/\s/g, "+")}&key=${GOOGLE_PLACES_API_KEY}`;
          } else {
            attractionsUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=Top+Sights+in+${selectedCountry.replace(
              /\s/g,
              "+"
            )}&key=${GOOGLE_PLACES_API_KEY}`;
          }

          const attractionDataResponse = await fetch(attractionsUrl, { signal: apiResController.current.signal });

          if (attractionDataResponse.ok) {
            const attractionData = await attractionDataResponse.json();

            // Select a random index from the returned data.
            let randDataIndex = genRandNum(attractionData.results.length);

            // Get the location of the attraction from the retuned plus code. If no plus code is found attempt to get another attraction with more info.
            if (attractionData.status != "OK") {
              randDataIndex = genRandNum(attractionData.results.length);
            }

            // Get the images associated with the selected attraction based on the photo reference id returned.
            if (Object.keys(attractionData.results[randDataIndex] != undefined ? attractionData.results[randDataIndex] : {}).includes("photos")) {
              const attImageResponse = await fetch(
                `https://maps.googleapis.com/maps/api/place/photo?photoreference=${attractionData.results[randDataIndex].photos[0].photo_reference}&maxheight=205&key=${GOOGLE_PLACES_API_KEY}`,
                { signal: apiResController.current.signal }
              );
              attThumbnail = attImageResponse.ok ? { uri: attImageResponse.url } : errorImg;
            } else {
              attThumbnail = errorImg;
            }

            locationCode = attractionData.results[randDataIndex].plus_code != undefined ? attractionData.results[randDataIndex].plus_code : undefined;

            // Loop through the returned data in search of a new attraction that contains a location.
            for (let i = 0; i <= attractionData.results.length; i++) {
              if (locationCode == undefined) {
                randDataIndex = genRandNum(attractionData.results.length);
                locationCode =
                  attractionData.results[randDataIndex].plus_code != undefined ? attractionData.results[randDataIndex].plus_code : undefined;
                if (i == attractionData.results.length && locationCode == undefined) {
                  let locationAddress = attractionData.results[randDataIndex].formatted_address;
                  locationName = getCityCountry(locationAddress);
                  locationCode = {};
                }
              }
            }

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

            attractionList.push({
              name:
                attractionData.results[randDataIndex].name > 30
                  ? attractionData.results[randDataIndex].name.substring(0, 30) + "..."
                  : attractionData.results[randDataIndex].name,
              location: locationName,
              thumbnail: attThumbnail,
              rating: attractionData.results[randDataIndex].rating != undefined ? attractionData.results[randDataIndex].rating : 0,
              place_id: attractionData.results[randDataIndex].place_id != "NOT_FOUND" ? attractionData.results[randDataIndex].place_id : "NOT_FOUND",
              latlng: attractionData.results[randDataIndex].geometry.location,
              id: i,
            });
          }
        }
      }
      screenLoading = false;
      apiCallInProgress.current = false;
      setAttractions(attractionList);
      setLoading(false);
    } catch (error) {
      alert("An Error has occured, please try again.");
      console.error(error);
      if (error.name == "AbortError") {
        apiCallInProgress.current = false;
        attractionList = [];
        setAttractions([]);
        setLoading(true);
      } else {
        apiCallInProgress.current = false;
        dataError = true;
        setLoading(false);
      }
    }
  };

  // Generate a random number with the limit being the parameter given.
  const genRandNum = (limit) => {
    return Math.floor(Math.random() * limit);
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

  // Link the modal visable state with the state of the model component. It's needed to render the dark overlay correctly when the modal is active.
  const modalVisability = (visable) => {
    setModalVisable(!visable);
  };

  const FilterButton = (title) => {
    let filterIcon = {};
    switch (title.title) {
      case "Cultural":
        filterIcon = <Feather name="globe" size={24} color={selectedFilter.current == "Cultural" ? theme.colors.active : theme.colors.text} />;
        break;

      case "Nature":
        filterIcon = <Foundation name="mountains" size={24} color={selectedFilter.current == "Nature" ? theme.colors.active : theme.colors.text} />;
        break;

      case "Food":
        filterIcon = <FontAwesome5 name="utensils" size={24} color={selectedFilter.current == "Food" ? theme.colors.active : theme.colors.text} />;
        break;

      case "Night Life":
        filterIcon = (
          <MaterialIcons name="nightlife" size={24} color={selectedFilter.current == "Night Life" ? theme.colors.active : theme.colors.text} />
        );
        break;

      case "Shopping":
        filterIcon = (
          <MaterialIcons name="shopping-bag" size={24} color={selectedFilter.current == "Shopping" ? theme.colors.active : theme.colors.text} />
        );
        break;
    }
    return (
      <View>
        <Button
          icon={filterIcon}
          TouchableComponent={TouchableWithoutFeedback}
          buttonStyle={styles.filterButton}
          containerStyle={{ marginTop: 10 }}
          onPress={() => {
            if (!loading) {
              setLoading(true);
            }

            if (title.title != selectedFilter.current) {
              selectedFilter.current = title.title;
              getWorldAttractions(title.title);
            } else {
              selectedFilter.current = "";
              getWorldAttractions("");
            }
          }}
        />
        <Text style={styles.filterText}>{title.title}</Text>
      </View>
    );
  };

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerStyle: {
          backgroundColor: mode == "light" ? "white" : "#101d23",
        },
        headerTintColor: mode == "light" ? "black" : "white",
      });

      // Inital call to run on first visit of the screen.
      if (screenFirstVisit.current) {
        getWorldAttractions(selectedFilter.current);

        // Check if the user has left the screen while data is loading.
      } else if (loadingOnScreenLeave.current) {
        loadingOnScreenLeave.current = false;
        getWorldAttractions(selectedFilter.current);
      }

      // When leaving the screen, cancel any api requests that are currently in progress.
      return () => {
        screenFirstVisit.current = false;
        if (apiResController.current && screenLoading) {
          loadingOnScreenLeave.current = true;
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
      <View style={styles.headerRow}>
        {/* Top Left View */}
        <View>
          <Text style={styles.heading}>Discover</Text>
          <Text style={[styles.subText, { marginTop: 10 }]}>Filter</Text>
        </View>
        {/* Top Right View */}
        <View style={{ marginTop: 20 }}>
          <AccountIconModal ref={accountIconModalRef} modalVisableState={modalVisability} navigation={navigation} />
        </View>
      </View>
      {/* Filter Buttons */}
      <View style={styles.headerRow}>
        <FilterButton title={"Cultural"} />
        <FilterButton title={"Nature"} />
        <FilterButton title={"Food"} />
        <FilterButton title={"Night Life"} />
        <FilterButton title={"Shopping"} />
      </View>

      {/* Attractions */}
      {loading ? (
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
          contentContainerStyle={{ paddingBottom: 20 }}
          data={attractions}
          renderItem={({ item }) => <GenericCardDesign navigation={navigation} details={item} currentScreen={"Attractions"} />}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          ListEmptyComponent={
            dataError ? (
              <View style={styles.refreshButtonView}>
                <Text style={styles.noData}>{"Oh no, an error has occured.\nLet's refresh and get you back to Discovering."}</Text>
                <Button
                  title="Refresh"
                  titleStyle={styles.refreshButtonText}
                  buttonStyle={styles.refreshButton}
                  TouchableComponent={TouchableOpacity}
                  onPress={() => {
                    screenLoading = true;
                    setLoading(true);
                    getWorldAttractions(selectedFilter.current);
                  }}
                />
              </View>
            ) : (
              <Text style={styles.noData}>Unable to load new Discoveries</Text>
            )
          }
        />
      )}
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

    heading: {
      color: theme.colors.text,
      fontFamily: "RalewayBold",
      fontSize: 33,
      marginTop: 20,
    },

    subText: {
      color: theme.colors.subtext,
      fontFamily: "RalewayMedium",
      fontSize: 16,
    },

    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },

    filterButton: {
      backgroundColor: theme.colors.secondaryBackground,
      borderRadius: 30,
      width: 50,
    },

    filterText: {
      color: theme.colors.text,
      fontFamily: "RalewayMedium",
      textAlign: "center",
      marginBottom: 10,
    },

    refreshButtonView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    refreshButtonText: {
      color: theme.colors.text,
      fontFamily: "RalewayBold",
      fontSize: 16,
    },

    refreshButton: {
      backgroundColor: theme.colors.active,
      marginTop: 15,
      height: 53,
      width: 200,
      borderRadius: 100,
    },

    noData: {
      fontFamily: "RalewayBold",
      color: theme.colors.text,
      textAlign: "center",
      lineHeight: 25,
      marginTop: 18,
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
