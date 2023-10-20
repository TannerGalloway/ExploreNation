import { useState, useRef, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { View, Text, StyleSheet, Image, TouchableWithoutFeedback } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function AttractionCardGeneric({ navigation, details }) {
  const [favorite, setFavorite] = useState(false);
  let favorited = useRef(false);

  const getLoggedinUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user.id;
  };

  const getAttractionID = async () => {
    try {
      // Get the id of the selected attraction.
      const { data } = await supabase.from("attractions").select("id").eq("att_place_id", details.place_id);
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  let attractionIDRes = getAttractionID();
  let currentUser = getLoggedinUser();

  const getAttractionFavID = async () => {
    try {
      // Get the id of the selected attraction form the attraction_favs table in the database.
      const { data } = await supabase.from("attraction_favs").select("attraction_id").eq("profile_id", currentUser._j);
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  let attractionFavIDRes = getAttractionFavID();

  const addFavorite = async () => {
    let attractionID = attractionIDRes._j[0];
    try {
      // If the attraction is already in the database don't insert the attraction. Get the current attraction id and create the link between the id and the user who favorited the attraction.
      if (attractionIDRes._j.length == 0) {
        // Insert attraction data
        const { data } = await supabase
          .from("attractions")
          .insert({
            att_city: details.city,
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

      // Insert data into the attraction_favs table. Link the current user with the favorited attraction id.
      await supabase.from("attraction_favs").insert({
        attraction_id: attractionID.id,
        profile_id: currentUser._j,
      });
    } catch (error) {
      favorited.current = false;
      setFavorite(favorited.current);
      console.error(error);
    }
  };

  const deleteFavorite = async () => {
    try {
      // Get the id of the selected attraction.
      const { data } = await supabase.from("attractions").select("id").eq("att_place_id", details.place_id);

      // If the id appears in the attractions table, allow the delete function to run.
      if (data.length > 0) {
        // Delete the attraction with the returned id from the previous query.
        await supabase.from("attraction_favs").delete().eq("profile_id", currentUser._j).eq("attraction_id", data[0].id);
      }
    } catch (error) {
      favorited.current = true;
      setFavorite(favorited.current);
      console.error(error);
    }
  };

  useEffect(() => {
    // Set the heart icon to active if the attraction is found in the attraction_favs table.
    if (attractionFavIDRes._j != null) {
      favorited.current = true;
      setFavorite(favorited.current);
    }
  }, [attractionFavIDRes]);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        navigation.navigate("AttractionDetails", {
          name: details.name,
          rating: details.rating,
          thumbnail: details.thumbnail,
          place_id: details.place_id,
          location: details.city,
          latlng: details.latlng,
        });
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
