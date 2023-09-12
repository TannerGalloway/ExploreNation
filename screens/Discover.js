import { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, Keyboard, TouchableWithoutFeedback, TouchableOpacity, FlatList, useWindowDimensions } from "react-native";
import { Avatar, ListItem, Button } from "@rneui/themed";
import { FontAwesome, FontAwesome5, Feather, MaterialIcons, Foundation } from "@expo/vector-icons";
import { supabase } from "../utils/supabaseClient";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { GOOGLE_PLACES_API_KEY } from "@env";

export default function Discover({ navigation }) {
  const bottomSheetRef = useRef();
  const [modalVisable, setModalVisable] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("");
  const [loading, setLoading] = useState(true);
  const [attractions, setAttractions] = useState([]);
  const snapPoints = ["21%"];
  const errorImg = require("../assets/images/error_loading.jpg");

  const getWorldAttractions = async (filterName) => {
    let attractionList = [];
    let locationName = "";
    let locationCode = "";
    let attractionsUrl = "";
    let attThumbnail;
    try {
      const countryResponse = await fetch("https://countriesnow.space/api/v0.1/countries");
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

          const attractionDataResponse = await fetch(attractionsUrl);

          if (attractionDataResponse.ok) {
            const attractionData = await attractionDataResponse.json();

            // Select a random index from the returned data.
            let randDataIndex = genRandNum(attractionData.results.length);

            // Get the location of the attraction from the retuned plus code. If no plus code is found attempt to get another attraction with more info.
            if (attractionData.status != "OK") {
              randDataIndex = genRandNum(attractionData.results.length);
            }

            // Get the images associated with the selected attraction based on the photo reference id returned.
            if (Object.keys(attractionData.results[randDataIndex]).includes("photos")) {
              const attImageResponse = await fetch(
                `https://maps.googleapis.com/maps/api/place/photo?photoreference=${attractionData.results[randDataIndex].photos[0].photo_reference}&maxheight=205&key=${GOOGLE_PLACES_API_KEY}`
              );
              attThumbnail = attImageResponse.ok ? { uri: attImageResponse.url } : errorImg;
            } else {
              attThumbnail = errorImg;
            }

            locationCode = attractionData.results[randDataIndex].plus_code;

            // Loop through the returned data in search of a new attraction that contains a location.
            for (let i = 0; i <= attractionData.results.length; i++) {
              if (locationCode == undefined) {
                randDataIndex = genRandNum(attractionData.results.length);
                locationCode = attractionData.results[randDataIndex].plus_code;
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
              name: attractionData.results[randDataIndex].name,
              city: locationName,
              thumbnail: attThumbnail,
              rating: attractionData.results[randDataIndex].rating != undefined ? attractionData.results[randDataIndex].rating : 0,
              place_id: attractionData.results[randDataIndex].place_id != "NOT_FOUND" ? attractionData.results[randDataIndex].place_id : "NOT_FOUND",
              latlng: attractionData.results[randDataIndex].geometry.location,
              id: i,
            });
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
    setAttractions(attractionList);
    setLoading(false);
  };

  // Attraction Card Design
  const AttractionCard = ({ item }) => (
    <TouchableWithoutFeedback
      onPress={() => {
        navigation.navigate("AttractionDetails", {
          name: item.name,
          rating: item.rating,
          thumbnail: item.thumbnail,
          place_id: item.place_id,
          location: item.city,
          latlng: item.latlng,
        });
      }}>
      <View style={[styles.backdropBorder, styles.attractionCardView, item.id % 2 === 1 ? { marginRight: 0 } : { marginRight: 18 }]}>
        <TouchableWithoutFeedback
          onPress={() => {
            console.log("Liked");
          }}>
          <FontAwesome style={styles.likeBtn} name="heart-o" size={24} color="white" />
        </TouchableWithoutFeedback>
        <Image style={[styles.imgPreview, styles.backdropBorder]} source={item.thumbnail} />
        <Text style={styles.resultsHeading}>{item.name}</Text>
        <View style={styles.attractionNameView}>
          <FontAwesome name="map-marker" size={18} color="#00A8DA" style={{ marginTop: 10 }} />
          <Text style={[styles.resultsHeading, { fontFamily: "RalewayMedium" }]}>{item.city}</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

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

  const toggleModal = () => {
    setModalVisable(!modalVisable);
    if (modalVisable) {
      bottomSheetRef.current?.dismiss();
    } else {
      bottomSheetRef.current?.present();
    }
    Keyboard.dismiss();
  };

  const handleCloseModal = () => {
    setModalVisable(false);
    bottomSheetRef.current?.dismiss();
    Keyboard.dismiss();
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
    }
  };

  const FilterButton = (title) => {
    let filterIcon = {};
    switch (title.title) {
      case "Cultural":
        filterIcon = <Feather name="globe" size={24} color={selectedIcon == "Cultural" ? "#00A8DA" : "white"} />;
        break;

      case "Nature":
        filterIcon = <Foundation name="mountains" size={24} color={selectedIcon == "Nature" ? "#00A8DA" : "white"} />;
        break;

      case "Food":
        filterIcon = <FontAwesome5 name="utensils" size={24} color={selectedIcon == "Food" ? "#00A8DA" : "white"} />;
        break;

      case "Night Life":
        filterIcon = <MaterialIcons name="nightlife" size={24} color={selectedIcon == "Night Life" ? "#00A8DA" : "white"} />;
        break;

      case "Shopping":
        filterIcon = <MaterialIcons name="shopping-bag" size={24} color={selectedIcon == "Shopping" ? "#00A8DA" : "white"} />;
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
            title.title != selectedIcon ? setSelectedIcon(title.title) : setSelectedIcon("");
            setLoading(true);
            if (title.title != selectedIcon) {
              getWorldAttractions(title.title);
            } else {
              getWorldAttractions("");
            }
          }}
        />
        <Text style={styles.filterText}>{title.title}</Text>
      </View>
    );
  };

  useEffect(() => {
    getWorldAttractions("");
  }, []);

  return (
    <View style={styles.container}>
      {modalVisable ? <TouchableOpacity style={styles.overlay} onPress={handleCloseModal} /> : null}
      <View style={styles.headerRow}>
        {/* Top Left View */}
        <View>
          <Text style={styles.heading}>Discover</Text>
          <Text style={[styles.subText, { marginTop: 10 }]}>Filter</Text>
        </View>
        {/* Top Right View */}
        <View style={{ marginTop: 20 }}>
          <Avatar
            size={54}
            rounded
            renderPlaceholderContent={<FontAwesome name="user-circle" size={44} color="white" />}
            onPress={toggleModal}
            source={{
              uri: "https://randomuser.me/api/portraits/men/36.jpg",
            }}
          />
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
          renderItem={AttractionCard}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          ListEmptyComponent={<Text style={styles.noData}>Unable to load new Discoveries</Text>}
        />
      )}

      {/* Account Icon Modal */}
      <BottomSheetModal ref={bottomSheetRef} snapPoints={snapPoints} backgroundStyle={styles.listItemContainer}>
        <View>
          <TouchableWithoutFeedback onPress={() => console.log("Settings")}>
            <ListItem containerStyle={styles.listItemContainer}>
              <Feather name="settings" size={25} color="white" />
              <ListItem.Content>
                <ListItem.Title style={styles.listItemText}>Settings</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={handleSignOut}>
            <ListItem containerStyle={styles.listItemContainer}>
              <MaterialIcons name="logout" size={25} color="white" />
              <ListItem.Content>
                <ListItem.Title style={styles.listItemText}>Log Out</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          </TouchableWithoutFeedback>
        </View>
      </BottomSheetModal>
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

  heading: {
    color: "white",
    fontFamily: "RalewayBold",
    fontSize: 33,
    marginTop: 20,
  },

  subText: {
    color: "#919196",
    fontFamily: "RalewayMedium",
    fontSize: 16,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  filterButton: {
    backgroundColor: "#252B34",
    borderRadius: 30,
    width: 50,
  },

  filterText: {
    color: "white",
    fontFamily: "RalewayMedium",
    textAlign: "center",
    marginBottom: 10,
  },

  backdropBorder: {
    borderRadius: 10,
  },

  attractionCardView: {
    flex: 1,
    backgroundColor: "#252B34",
    marginTop: 18,
  },

  imgPreview: {
    height: 205,
    width: "auto",
  },

  likeBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 1,
  },

  resultsHeading: {
    fontFamily: "RalewayBold",
    fontSize: 13,
    color: "white",
    marginVertical: 7,
    paddingHorizontal: 7,
  },

  attractionNameView: {
    flexDirection: "row",
    paddingHorizontal: 7,
    paddingBottom: 7,
  },

  listItemContainer: {
    backgroundColor: "#252B34",
  },

  listItemText: {
    color: "white",
    fontFamily: "RalewayBold",
    fontSize: 20,
    paddingBottom: 5,
  },

  noData: {
    fontFamily: "RalewayBold",
    color: "white",
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
