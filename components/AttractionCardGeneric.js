import { useState, useRef, useEffect, useContext } from "react";
import { View, Text, StyleSheet, Image, TouchableWithoutFeedback } from "react-native";
import { AppContext } from "../utils/AppContext";
import { supabase } from "../utils/supabaseClient";
import { FontAwesome } from "@expo/vector-icons";

export default function AttractionCardGeneric({ navigation, details }) {
  const [favorite, setFavorite] = useState(false);
  const { setScreenData } = useContext(AppContext);
  let favorited = useRef(false);

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

  const addFavorite = async () => {
    try {
      let attractionIDRes = await getAttractionID("add");
      let currentUser = await getLoggedinUser("add");
      let attractionID = attractionIDRes[0];

      // Get the current attraction id and create the link between the id and the user who favorited the attraction.  If the attraction is not already in the database.
      if (attractionIDRes.length == 0) {
        // Insert attraction data
        const { data } = await supabase
          .from("attractions")
          .insert({
            att_location: details.city,
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
    } catch (error) {
      likeErrorHandle(error, "add");
    }
  };

  const deleteFavorite = async () => {
    try {
      let attractionIDRes = await getAttractionID("delete");
      let currentUser = await getLoggedinUser("delete");

      // If the id appears in the database, allow the delete function to run.
      if (attractionIDRes.length > 0) {
        // Delete the attraction with the returned id.
        await supabase.from("attraction_favs").delete().eq("profile_id", currentUser).eq("attraction_id", attractionIDRes[0].id);
      }
    } catch (error) {
      likeErrorHandle(error, "delete");
    }
  };

  useEffect(() => {
    getAttractionFavStatus("Favorite");
  }, []);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setScreenData({
          att_name: details.name,
          att_location: details.city,
          att_rating: details.rating,
          att_lat: details.latlng.lat,
          att_lng: details.latlng.lng,
          att_place_id: details.place_id,
          att_thumbnail_url: details.thumbnail,
        });
        navigation.navigate("AttractionDetails");
      }}>
      <View style={[styles.backdropBorder, styles.attractionCardView, details.id % 2 === 1 ? { marginRight: 0 } : { marginRight: 18 }]}>
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
        <Text style={styles.resultsHeading}>{details.name}</Text>
        <View style={styles.attractionNameView}>
          <FontAwesome name="map-marker" size={18} color="#00A8DA" style={{ marginTop: 10 }} />
          <Text style={[styles.resultsHeading, { fontFamily: "RalewayMedium" }]}>{details.city}</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  backdropBorder: {
    borderRadius: 10,
  },

  attractionCardView: {
    flex: 1,
    backgroundColor: "#252B34",
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
    color: "white",
    marginVertical: 7,
    paddingHorizontal: 7,
  },

  attractionNameView: {
    flexDirection: "row",
    paddingHorizontal: 7,
    paddingBottom: 7,
  },
});
