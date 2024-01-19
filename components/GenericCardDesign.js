import { useState, useRef, useEffect, useContext } from "react";
import { View, Text, StyleSheet, Image, TouchableWithoutFeedback } from "react-native";
import { useTheme } from "@rneui/themed";
import { AppContext } from "../utils/AppContext";
import { supabase } from "../utils/supabaseClient";
import { FontAwesome } from "@expo/vector-icons";

export default function AttractionCardGeneric({ navigation, details, currentScreen }) {
  const { theme } = useTheme();
  const [favorite, setFavorite] = useState(false);
  const { setScreenData } = useContext(AppContext);
  let favorited = useRef(false);
  const styles = getStyles(theme);

  const getLoggedinUser = async (funcCallName) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user.id;
    } catch (error) {
      likeErrorHandle(error, funcCallName);
    }
  };

  const likeErrorHandle = (error, funcCallName) => {
    if (funcCallName == "add") {
      favorited.current = false;
      setFavorite(favorited.current);
    } else if (funcCallName == "delete") {
      favorited.current = true;
      setFavorite(favorited.current);
    } else {
      console.error(error);
      console.error(funcCallName);
    }
  };

  const getAttractionID = async (funcCallName) => {
    try {
      // Get the id of the selected attraction.
      const { data } = await supabase.from("attractions").select("id").eq("att_place_id", details.place_id);
      return data;
    } catch (error) {
      likeErrorHandle(error, funcCallName);
    }
  };

  const getDestinationID = async (funcCallName) => {
    try {
      // Get the id of the selected destination.
      const { data } = await supabase.from("destinations").select("id").eq("destination_place_id", details.place_id);
      return data;
    } catch (error) {
      likeErrorHandle(error, funcCallName);
    }
  };

  // Check to see if the attraction is currently favorited in the database.
  const getAttractionFavStatus = async (funcCallName) => {
    try {
      let attractionIDRes = await getAttractionID("FavStatus");
      let currentUser = await getLoggedinUser("user");

      if (attractionIDRes.length != 0) {
        // Check to see if the current attraction id has been favorited by the current user.
        const { data } = await supabase
          .from("attraction_favs")
          .select("attraction_id")
          .eq("profile_id", currentUser)
          .eq("attraction_id", attractionIDRes[0].id);

        // Set the heart icon to active/inactive if the attraction is found/not found in the attraction_favs table.
        if (data.length > 0) {
          favorited.current = true;
          setFavorite(favorited.current);
        } else {
          favorited.current = false;
          setFavorite(favorited.current);
        }
      }
    } catch (error) {
      likeErrorHandle(error, funcCallName);
    }
  };

  // Implement the differences between addFavorite for attractions and destinations.
  const addFavorite = async () => {
    try {
      if (currentScreen == "Attractions") {
        let attractionIDRes = await getAttractionID("add");
        let currentUser = await getLoggedinUser("add");
        let attractionID = attractionIDRes[0];

        // Get the current attraction id and create the link between the id and the user who favorited the attraction.  If the attraction is not already in the database.
        if (attractionIDRes.length == 0) {
          // Insert attraction data
          const { data } = await supabase
            .from("attractions")
            .insert({
              att_location: details.location,
              att_name: details.name,
              att_rating: details.rating,
              att_lat: details.latlng.lat,
              att_lng: details.latlng.lng,
              att_place_id: details.place_id,
              att_thumbnail_url: details.thumbnail.uri,
            })
            .select("id");
          attractionID = data[0];
        }

        // Insert data into the database. Link the current user with the favorited attraction id.
        await supabase.from("attraction_favs").insert({
          attraction_id: attractionID.id,
          profile_id: currentUser,
        });
      } else {
        // Destination
        let destinationIDRes = await getDestinationID("add");
        let currentUser = await getLoggedinUser("add");
        let destinationID = destinationIDRes[0];

        // Get the current destination id and create the link between the id and the user who favorited the destination.  If the destination is not already in the database.
        if (destinationIDRes.length == 0) {
          // Insert destination data into the database.
          const { data } = await supabase
            .from("destinations")
            .insert({
              destination_name: details.location,
              destination_place_id: details.place_id,
              destination_lat: details.lat,
              destination_lng: details.lng,
              destination_thumbnail: details.thumbnail,
              destination_isCountry: details.destination_isCountry,
            })
            .select("id");
          destinationID = data[0];
        }

        //  Link the current user with the favorited destination id.
        await supabase.from("destination_favs").insert({
          destination_id: destinationID.id,
          profile_id: currentUser,
        });
      }
    } catch (error) {
      likeErrorHandle(error, "add");
    }
  };

  const deleteFavorite = async () => {
    try {
      if (currentScreen == "Attractions") {
        let attractionIDRes = await getAttractionID("delete");
        let currentUser = await getLoggedinUser("delete");

        // If the id appears in the database, allow the delete function to run.
        if (attractionIDRes.length > 0) {
          // Delete the attraction with the returned id.
          await supabase.from("attraction_favs").delete().eq("profile_id", currentUser).eq("attraction_id", attractionIDRes[0].id);
        }
      } else {
        let destinationIDRes = await getDestinationID("delete");
        let currentUser = await getLoggedinUser("delete");

        if (destinationIDRes.length > 0) {
          await supabase.from("destination_favs").delete().eq("profile_id", currentUser).eq("destination_id", destinationIDRes[0].id);
        }
      }
    } catch (error) {
      likeErrorHandle(error, "delete");
    }
  };

  useEffect(() => {
    currentScreen == "Attractions" ? getAttractionFavStatus("Favorite") : (favorited.current = true);
    setFavorite(favorited.current);
  }, []);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (currentScreen == "Attractions") {
          setScreenData({
            att_name: details.name,
            att_location: details.location,
            att_rating: details.rating,
            att_lat: details.latlng.lat,
            att_lng: details.latlng.lng,
            att_place_id: details.place_id,
            att_thumbnail_url: details.thumbnail,
          });

          navigation.navigate("AttractionDetails");
        } else {
          setScreenData({
            destination_name: details.location,
            destination_place_id: details.place_id,
            destination_lat: details.lat,
            destination_lng: details.lng,
            destination_thumbnail: details.thumbnail,
            destination_isCountry: details.isCountry,
          });

          navigation.navigate("DestinationDetails");
        }
      }}>
      <View style={[styles.backdropBorder, styles.cardView, details.id % 2 === 1 ? { marginRight: 0 } : { marginRight: 18 }]}>
        <TouchableWithoutFeedback
          onPress={() => {
            favorited.current = !favorited.current;
            setFavorite(!favorite);
            if (favorited.current) {
              addFavorite();
            } else {
              deleteFavorite();
            }
          }}>
          <FontAwesome style={styles.likeBtn} name={favorite ? "heart" : "heart-o"} size={24} color={favorite ? "#ea4c8a" : "black"} />
        </TouchableWithoutFeedback>
        <Image style={[styles.imgPreview, styles.backdropBorder]} source={details.thumbnail} />
        {currentScreen == "Attractions" ? <Text style={styles.resultsHeading}>{details.name}</Text> : null}
        <View style={styles.locationNameView}>
          <FontAwesome name="map-marker" size={18} color={theme.colors.active} style={{ marginTop: 10 }} />
          <Text style={[styles.resultsHeading, { fontFamily: "RalewayMedium" }]}>{details.location}</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const getStyles = (theme) => {
  return StyleSheet.create({
    backdropBorder: {
      borderRadius: 10,
    },

    cardView: {
      flex: 1,
      backgroundColor: theme.colors.secondaryBackground,
      marginTop: 18,
    },

    likeBtn: {
      backgroundColor: "white",
      borderRadius: 30,
      padding: 3,
      position: "absolute",
      top: 5,
      right: 5,
      zIndex: 1,
    },

    imgPreview: {
      height: 205,
      width: "auto",
    },

    resultsHeading: {
      fontFamily: "RalewayBold",
      fontSize: 13,
      color: theme.colors.text,
      marginVertical: 7,
      paddingHorizontal: 7,
    },

    locationNameView: {
      flexDirection: "row",
      paddingHorizontal: 7,
      paddingBottom: 7,
    },
  });
};
