import { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  Keyboard,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../utils/supabaseClient";
import { Avatar, ListItem, Button } from "@rneui/themed";
import { FontAwesome, Feather, MaterialIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GOOGLE_PLACES_API_KEY } from "@env";
import * as Location from "expo-location";

export default function Home({ navigation }) {
  const bottomSheetRef = useRef();
  const [modalVisable, setModalVisable] = useState(false);
  const [cityData, setcityData] = useState([]);
  const [attractionData, setAttractionData] = useState([]);
  const [cityLoading, setCityLoading] = useState(true);
  const [attLoading, setAttLoading] = useState(true);
  const [LocationErrorMsg, setLocationErrorMsg] = useState();
  const snapPoints = ["21%"];

  const getCountryandCityInfo = async () => {
    let cityInfo = [];
    let imgRefIndex = 0;
    try {
      const countryResponse = await fetch("https://countriesnow.space/api/v0.1/countries");
      const countryData = await countryResponse.json();

      // Randomly Select 6 coutries and cities. Ignoring any countries that contains no cities.
      for (let i = 0; i < 6; i++) {
        let randCountryDataIndex = genRandNum(countryData.data.length - 1);

        while (countryData.data[randCountryDataIndex].cities.length === 0) {
          randCountryDataIndex = genRandNum(countryData.data.length - 1);
        }

        let randCityDataIndex = genRandNum(countryData.data[randCountryDataIndex].cities.length - 1);

        let selectedCity = `${countryData.data[randCountryDataIndex].cities[randCityDataIndex]}, ${countryData.data[randCountryDataIndex].country}`;

        // Get city image ref ID
        const imageRefResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${selectedCity}&inputtype=textquery&fields=photos&key=${GOOGLE_PLACES_API_KEY}`
        );
        const imgResData = await imageRefResponse.json();

        // Check returned data for errors otherwise push data to the cityInfo array.
        if (isResponseObjEmpty(imgResData.candidates).status || imgResData.status == "ZERO_RESULTS") {
          cityInfo.push({
            city: selectedCity,
            image: require("../assets/images/error_loading.jpg"),
          });
        } else {
          // If the data returned contains more than 1 images, randomly select 1 of the images and check for empty data before selecting a data index.
          if (imgResData.candidates.length > 1) {
            imgRefIndex = genRandNum(imgResData.candidates.length - 1);

            while (isResponseObjEmpty(imgResData.candidates).indexes.includes(imgRefIndex)) {
              imgRefIndex = genRandNum(imgResData.candidates.length - 1);
            }
          }

          // Get the city image using the ref ID from the previous call.
          const cityImage = await fetch(
            `https://maps.googleapis.com/maps/api/place/photo?photoreference=${imgResData.candidates[imgRefIndex].photos[0].photo_reference}&maxheight=200&key=${GOOGLE_PLACES_API_KEY}`
          );

          cityInfo.push({
            city: selectedCity,
            image: { uri: cityImage.url },
          });
        }
      }
    } catch (error) {
      console.error(error);
    }

    setcityData(cityInfo);
    setCityLoading(false);
  };

  // Check if there is an empty object in the Response.
  const isResponseObjEmpty = (objectName) => {
    let emptyIndexes = [];
    for (let i = 0; i < objectName.length; i++) {
      if (Object.keys(objectName[i]).length == 0) {
        emptyIndexes.push(i);
      }
    }
    if (emptyIndexes.length > 0) {
      return { status: true, indexes: emptyIndexes };
    } else {
      return false;
    }
  };

  // Generate a random number with the limit being the parameter given.
  const genRandNum = (limit) => {
    return Math.floor(Math.random() * limit);
  };

  const getLocation = async () => {
    let attractionInfo = [];
    let attLocation = "";

    // Ask for location permission
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocationErrorMsg("Make sure your Location Services are turned on.");
      return;
    }

    // Get the user's current location if user accepts the location propmpt.
    let position = await Location.getCurrentPositionAsync({});

    try {
      // Get Nearby Attractions that are labled as tourist attractions and fall into a circle with a radius of 10 miles centered around the user's current location.
      const nearbyAttrationsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${`${position.coords.latitude},${position.coords.longitude}`}&radius=16093&type=tourist_attraction&key=${GOOGLE_PLACES_API_KEY}`
      );
      const attractionResponse = await nearbyAttrationsResponse.json();

      if (attractionResponse.status != "OK") {
        attractionInfo.push({
          name: "Unknown",
          rating: 0,
          total_reviews: 0,
          image: require("../assets/images/error_loading.jpg"),
          location: "Unknown",
        });
      } else {
        // Loop through the retuned data to grab info about the attractions. Data Grabbed include the name of the attaction, overall star rating, total reviews, thumbnail, location(latitude, longitude, city) and attraction id.

        for (let i = 0; i < attractionResponse.results.length; i++) {
          const attImageResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/photo?photoreference=${attractionResponse.results[i].photos[0].photo_reference}&maxheight=200&key=${GOOGLE_PLACES_API_KEY}`
          );

          const locationCode = attractionResponse.results[i].plus_code;

          // Get the Location of the Attraction from the retuned plus code, otherwise get the location from the vicinity address returned.
          locationCode == undefined
            ? (attLocation = attractionResponse.results[i].vicinity.substring(attractionResponse.results[i].vicinity.lastIndexOf(",") + 2))
            : (attLocation = locationCode.compound_code.substring(locationCode.compound_code.search(" ") + 1));

          attractionInfo.push({
            name: attractionResponse.results[i].name,
            rating: attractionResponse.results[i].rating,
            total_reviews: attractionResponse.results[i].user_ratings_total,
            thumbnail: { uri: attImageResponse.url },
            location: attLocation,
            latlng: attractionResponse.results[i].geometry.location,
            place_id: attractionResponse.results[i].place_id != "NOT_FOUND" ? attractionResponse.results[i].place_id : "NOT_FOUND",
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
    setAttractionData(attractionInfo);
    setAttLoading(false);
  };

  // City card design
  const cityItem = ({ item }) => (
    <View style={[styles.citiesView, styles.backdropBorder]}>
      <Image style={[styles.imgPreview, styles.cityImgBorder, styles.backdropBorder]} source={item.image} />
      <View style={styles.cityNameView}>
        <FontAwesome name="map-marker" size={18} color="#00A8DA" style={{ marginTop: 10 }} />
        <Text style={styles.homeResultsHeading}>{item.city}</Text>
      </View>
    </View>
  );

  // Attraction card design
  const attractionItem = ({ item }) => (
    <TouchableWithoutFeedback
      onPress={() => {
        navigation.navigate("AttractionDetails", {
          name: item.name,
          rating: item.rating,
          location: item.location,
          place_id: item.place_id,
          thumbnail: item.thumbnail,
          latlng: item.latlng,
        });
      }}>
      <ImageBackground
        style={[styles.attImgPreview, { width: useWindowDimensions.width > 755 ? 150 : 140 }]}
        imageStyle={[
          styles.backdropBorder,
          {
            borderColor: "white",
            borderWidth: 1,
          },
        ]}
        source={item.thumbnail}>
        <View style={styles.attractionTextView}>
          <Text style={styles.attractionText}>{`${item.name}`}</Text>
          <View style={{ flexDirection: "row" }}>
            <FontAwesome name="star" size={13} color="#f3cc4b" style={{ marginTop: 3, marginRight: 6 }} />
            <Text
              style={{
                color: "#d3d3d3",
              }}>{`${item.rating} (${item.total_reviews})`}</Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
    }
  };

  const handleCloseModal = () => {
    setModalVisable(false);
    bottomSheetRef.current?.dismiss();
    Keyboard.dismiss();
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

  useEffect(() => {
    getCountryandCityInfo();
    getLocation();
  }, []);

  return (
    <View style={styles.container}>
      {modalVisable ? <TouchableOpacity style={styles.overlay} onPress={handleCloseModal} /> : null}
      <View style={styles.topElements}>
        {/* Top Left View */}
        <View>
          <Text style={styles.greeting}>Good Evening</Text>
          <Text style={styles.heading}>Where do you want to go?</Text>
        </View>

        {/* Top Right View */}
        <View style={{ marginTop: 25 }}>
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
          renderRow={(rowData) => (
            <View style={{ flexDirection: "row" }}>
              <FontAwesome name="map-marker" size={18} color="#00A8DA" style={{ paddingRight: 10 }} />
              <Text style={{ color: "white" }}>{rowData.description}</Text>
            </View>
          )}
          query={{
            key: GOOGLE_PLACES_API_KEY,
          }}
          onPress={(data, details) => {
            console.log(data, details);
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
            listView: {
              height: useWindowDimensions().height > 755 ? 180 : 136,
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
            contentContainerStyle={{ paddingBottom: 500 }}
            data={attractionData}
            renderItem={attractionItem}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            ListEmptyComponent={<Text style={styles.noData}>No Attractions Found Nearby. {LocationErrorMsg}</Text>}
          />
        )}
      </View>

      {/* Account Icon Modal */}
      <BottomSheetModal ref={bottomSheetRef} snapPoints={snapPoints} backgroundStyle={styles.ListItemContainer}>
        <View>
          <TouchableWithoutFeedback onPress={() => console.log("Settings")}>
            <ListItem containerStyle={styles.ListItemContainer}>
              <Feather name="settings" size={25} color="white" />
              <ListItem.Content>
                <ListItem.Title style={styles.ListItemText}>Settings</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={handleSignOut}>
            <ListItem containerStyle={styles.ListItemContainer}>
              <MaterialIcons name="logout" size={25} color="white" />
              <ListItem.Content>
                <ListItem.Title style={styles.ListItemText}>Log Out</ListItem.Title>
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

  topElements: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  greeting: {
    color: "#919196",
    fontFamily: "RalewayBold",
    fontSize: 20,
    marginTop: 35,
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

  citiesView: {
    backgroundColor: "#252B34",
    width: 130,
    marginRight: 18,
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
    height: 100,
    width: 130,
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
