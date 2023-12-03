import { useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, FlatList } from "react-native";
import { Button } from "@rneui/themed";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../utils/supabaseClient";
import AccountIconModal from "../components/AccountIconModal";
import AttractionCardGeneric from "../components/GenericCardDesign";

export default function Favorites({ navigation }) {
  const accountIconModalRef = useRef(null);
  const screenFirstVisit = useRef(true);
  const loadingOnScreenLeave = useRef(false);
  const apiCallInProgress = useRef(false);
  const apiResController = useRef(null);
  const selectedFilter = useRef("Destinations");
  const [modalVisable, setModalVisable] = useState(false);
  const [favorites, setfavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  let screenLoading = true;
  let dataError = true;

  const getLoggedinUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user.id;
    } catch (error) {
      console.error(error);
    }
  };

  const getDestinationFavs = async () => {
    let destinationList = [];

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
      const currentUser = await getLoggedinUser();
      const desDataResIDs = await supabase
        .from("destination_favs")
        .select("destination_id")
        .eq("profile_id", currentUser)
        .abortSignal(apiResController.current.signal);

      for (let i = 0; i < desDataResIDs.data.length; i++) {
        const { data, error } = await supabase
          .from("destinations")
          .select()
          .eq("id", desDataResIDs.data[i].destination_id)
          .abortSignal(apiResController.current.signal);
        if (error == null) {
          destinationList.push({
            location: data[0].destination_name,
            place_id: data[0].destination_place_id,
            lat: data[0].destination_lat,
            lng: data[0].destination_lng,
            thumbnail: { uri: data[0].destination_thumbnail },
            isCountry: data[0].destination_isCountry,
            id: i,
          });
        }
      }

      screenLoading = false;
      apiCallInProgress.current = false;
      selectedFilter.current == "Destinations" ? setfavorites(destinationList) : setfavorites([]);
      setLoading(false);
    } catch (error) {
      console.error(error);
      if (error.name == "AbortError") {
        apiCallInProgress.current = false;
        destinationList = [];
        setfavorites([]);
        setLoading(true);
      } else {
        apiCallInProgress.current = false;
        dataError = true;
        setLoading(false);
      }
    }
  };

  const getAttractionFavs = async () => {
    let attractionList = [];

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
      const currentUser = await getLoggedinUser();
      const attDataResIDs = await supabase
        .from("attraction_favs")
        .select("attraction_id")
        .eq("profile_id", currentUser)
        .abortSignal(apiResController.current.signal);

      for (let i = 0; i < attDataResIDs.data.length; i++) {
        const { data, error } = await supabase
          .from("attractions")
          .select()
          .eq("id", attDataResIDs.data[i].attraction_id)
          .abortSignal(apiResController.current.signal);
        if (error == null) {
          attractionList.push({
            name: data[0].att_name,
            location: data[0].att_location,
            rating: data[0].att_rating,
            latlng: { lat: data[0].att_lat, lng: data[0].att_lng },
            place_id: data[0].att_place_id,
            total_reviews: data[0].att_total_reviews,
            thumbnail: { uri: data[0].att_thumbnail_url },
            id: i,
          });
        }
      }

      screenLoading = false;
      apiCallInProgress.current = false;
      selectedFilter.current == "Attractions" ? setfavorites(attractionList) : setfavorites([]);
      setLoading(false);
    } catch (error) {
      console.error(error);
      if (error.name == "AbortError") {
        apiCallInProgress.current = false;
        attractionList = [];
        setfavorites([]);
        setLoading(true);
      } else {
        apiCallInProgress.current = false;
        dataError = true;
        setLoading(false);
      }
    }
  };

  // Link the modal visable state with the state of the model component. It's needed to render the dark overlay correctly when the modal is active.
  const modalVisability = (visable) => {
    setModalVisable(!visable);
  };

  useFocusEffect(
    useCallback(() => {
      // Inital call to run on first visit of the screen.
      if (screenFirstVisit.current) {
        getDestinationFavs();

        // Check if the user has left the screen while data is loading.
      } else if (loadingOnScreenLeave.current) {
        loadingOnScreenLeave.current = false;
        selectedFilter.current == "Attractions" ? getAttractionFavs() : getDestinationFavs();
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
          <Text style={styles.heading}>Favorites</Text>
          <Text style={[styles.subText, { marginTop: 10 }]}>Filter</Text>
        </View>
        {/* Top Right View */}
        <View style={{ marginTop: 20 }}>
          <AccountIconModal ref={accountIconModalRef} modalVisableState={modalVisability} />
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterRow}>
        <Button
          title="Destinations"
          TouchableComponent={TouchableWithoutFeedback}
          buttonStyle={[
            styles.filterButton,
            selectedFilter.current == "Destinations" ? { backgroundColor: "#00A8DA" } : { backgroundColor: "#252B34" },
          ]}
          containerStyle={{ marginVertical: 10 }}
          titleStyle={styles.filterText}
          onPress={() => {
            if (!loading) {
              setLoading(true);
            }
            selectedFilter.current = "Destinations";
            getDestinationFavs();
          }}
        />
        <Button
          title="Attractions"
          TouchableComponent={TouchableWithoutFeedback}
          buttonStyle={[
            styles.filterButton,
            selectedFilter.current == "Attractions" ? { backgroundColor: "#00A8DA" } : { backgroundColor: "#252B34" },
          ]}
          containerStyle={{ marginVertical: 10 }}
          titleStyle={styles.filterText}
          onPress={() => {
            if (!loading) {
              setLoading(true);
            }
            selectedFilter.current = "Attractions";
            getAttractionFavs();
          }}
        />
      </View>

      {/* Favorites */}
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
          data={favorites}
          renderItem={({ item }) => <AttractionCardGeneric navigation={navigation} details={item} currentScreen={selectedFilter.current} />}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          ListEmptyComponent={
            dataError ? (
              <View style={styles.refreshButtonView}>
                <Text style={styles.noData}>{"An error occured when retrieving your favorites."}</Text>
                <Button
                  title="Refresh"
                  titleStyle={styles.refreshButtonText}
                  buttonStyle={styles.refreshButton}
                  TouchableComponent={TouchableOpacity}
                  onPress={() => {
                    screenLoading = true;
                    setLoading(true);
                    selectedFilter.current == "Attractions" ? getAttractionFavs() : getDestinationFavs();
                  }}
                />
              </View>
            ) : (
              <Text style={styles.noData}>No favorites were found.</Text>
            )
          }
        />
      )}
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

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  filterRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
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

  filterButton: {
    borderRadius: 30,
    marginRight: 10,
  },

  filterText: {
    color: "white",
    fontFamily: "RalewayMedium",
    marginHorizontal: 10,
  },

  refreshButtonView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  refreshButtonText: {
    color: "white",
    fontFamily: "RalewayBold",
    fontSize: 16,
  },

  refreshButton: {
    marginTop: 15,
    height: 53,
    width: 200,
    borderRadius: 100,
    backgroundColor: "#00A8DA",
  },

  noData: {
    fontFamily: "RalewayBold",
    color: "white",
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
