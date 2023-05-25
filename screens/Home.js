import { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  Keyboard,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../utils/supabaseClient";
import { Avatar, ListItem } from "@rneui/themed";
import { FontAwesome, Feather, MaterialIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GOOGLE_PLACES_API_KEY } from "@env";

export default function Home() {
  const bottomSheetRef = useRef(null);
  const [modalVisable, setModalVisable] = useState(false);
  const snapPoints = ["21%"];

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

  const cityData = [
    {
      image: "https://picsum.photos/id/49/100",
      city: "Patras, Greece",
    },
    {
      image: "https://picsum.photos/id/234/100",
      city: "Paris, France",
    },
    {
      image: "https://picsum.photos/id/351/100",
      city: "Taipei, Taiwan",
    },
    {
      image: "https://picsum.photos/id/369/100",
      city: "Venice, Italy",
    },
    {
      image: "https://picsum.photos/id/392/100",
      city: "San Francisco, USA",
    },
  ];

  const attractionData = [
    {
      image: "https://picsum.photos/id/142/70",
      name: "Balmoral Castle",
      city: "Scotland, UK",
      distance: "3.5km",
    },
    {
      image: "https://picsum.photos/id/218/70",
      name: "Ko Samui",
      city: "Pattaya, Thailand",
      distance: "4.2km",
    },
    {
      image: "https://picsum.photos/id/274/70",
      name: "Time Square",
      city: "New York, USA",
      distance: "1.8km",
    },
    {
      image: "https://picsum.photos/id/318/70",
      name: "Eiffel Tower",
      city: "Paris, France",
      distance: "10km",
    },
    {
      image: "https://picsum.photos/id/512/70",
      name: "Blue Lagoon",
      city: "Reykjanes, Iceland",
      distance: "0.5km",
    },
  ];

  const cityItem = ({ item }) => (
    <View style={[styles.citiesView, styles.backdropBorder]}>
      <Image
        style={[styles.imgPreview, styles.backdropBorder]}
        source={{
          uri: item.image,
        }}
      />
      <View style={styles.cityNameView}>
        <FontAwesome
          name="map-marker"
          size={18}
          color="#00A8DA"
          style={{ marginTop: 10 }}
        />
        <Text style={styles.homeResultsHeading}>{item.city}</Text>
      </View>
    </View>
  );

  const attractionItem = ({ item }) => (
    <View style={{ flexDirection: "row" }}>
      <Image
        style={[styles.imgPreview, styles.attImgPreview, styles.backdropBorder]}
        source={{
          uri: item.image,
        }}
      />
      <View style={{ marginTop: 20, flex: 1 }}>
        <Text style={styles.homeResultsHeading}>{item.name}</Text>
        <View style={{ flexDirection: "row" }}>
          <FontAwesome
            name="map-marker"
            size={14}
            color="#00A8DA"
            style={{ marginTop: 10, marginLeft: 7 }}
          />
          <Text style={styles.citySubHeading}>{item.city}</Text>
        </View>
      </View>
      <Text
        style={[
          styles.homeResultsHeading,
          { justifyContent: "flex-end", marginTop: 25 },
        ]}>
        {item.distance}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {modalVisable ? (
        <TouchableOpacity style={styles.overlay} onPress={handleCloseModal} />
      ) : null}
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
            renderPlaceholderContent={
              <FontAwesome name="user-circle" size={44} color="white" />
            }
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
              <FontAwesome
                name="map-marker"
                size={18}
                color="#00A8DA"
                style={{ paddingRight: 10 }}
              />
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
      <Text style={styles.sectionHeading}>Explore Cities</Text>
      <FlatList
        data={cityData}
        renderItem={cityItem}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.noData}>No Cities Found to Explore.</Text>
        }
      />

      {/* Nearby Attractions */}
      <View
        style={[
          styles.attractionBackground,
          { height: useWindowDimensions().height > 755 ? 275 : 223 },
        ]}>
        <Text style={styles.sectionHeading}>Nearby Attractions</Text>
        <FlatList
          data={attractionData}
          renderItem={attractionItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.noData}>No Attractions Found Nearby.</Text>
          }
        />
      </View>

      {/* Account Icon Modal */}
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        backgroundStyle={styles.ListItemContainer}>
        <View>
          <TouchableWithoutFeedback onPress={() => console.log("Settings")}>
            <ListItem containerStyle={styles.ListItemContainer}>
              <Feather name="settings" size={25} color="white" />
              <ListItem.Content>
                <ListItem.Title style={styles.ListItemText}>
                  Settings
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={handleSignOut}>
            <ListItem containerStyle={styles.ListItemContainer}>
              <MaterialIcons name="logout" size={25} color="white" />
              <ListItem.Content>
                <ListItem.Title style={styles.ListItemText}>
                  Log Out
                </ListItem.Title>
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
    height: 150,
    width: 130,
    marginRight: 20,
  },

  homeResultsHeading: {
    fontFamily: "RalewayBold",
    color: "white",
    marginTop: 7,
    paddingLeft: 7,
  },

  citySubHeading: {
    fontFamily: "RalewayRegular",
    color: "#919196",
    marginTop: 7,
    paddingLeft: 7,
  },

  cityNameView: {
    flexDirection: "row",
    paddingLeft: 7,
    paddingRight: 7,
    paddingBottom: 7,
  },

  backdropBorder: {
    borderRadius: 10,
  },

  imgPreview: {
    height: 100,
    borderColor: "white",
    borderWidth: 1,
  },

  attImgPreview: {
    height: 70,
    width: 70,
    marginVertical: 10,
    marginRight: 7,
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

  attractionBackground: {
    backgroundColor: "#252B34",
    marginTop: 18,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingLeft: 12,
    paddingRight: 12,
  },

  noData: {
    height: 100,
    fontFamily: "RalewayBold",
    color: "white",
    marginTop: 20,
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
