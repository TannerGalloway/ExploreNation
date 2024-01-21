import { useState, useRef, useEffect, useContext } from "react";
import { TouchableWithoutFeedback } from "react-native";
import { FontAwesome, Entypo } from "@expo/vector-icons";
import { useTheme } from "@rneui/themed";
import { supabase } from "../utils/supabaseClient";
import { AppContext } from "../utils/AppContext";
import { useNavigation } from "@react-navigation/native";

export default function ScreenHeader({ ScreenType }) {
  const { theme } = useTheme();
  const [favorite, setfavorite] = useState(false);
  let favorited = useRef(false);
  const { screenData } = useContext(AppContext);
  const navigation = useNavigation();

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
      setfavorite(favorited.current);
    } else if (funcCallName == "delete") {
      favorited.current = true;
      setfavorite(favorited.current);
    } else {
      alert("An Error has occured, please try again.");
      console.error(error);
      console.error(funcCallName);
    }
  };

  // Get the id of the current attraction from the database.
  const getAttractionID = async (funcCallName) => {
    try {
      const { data } = await supabase.from("attractions").select("id").eq("att_place_id", screenData.att_place_id);
      return data;
    } catch (error) {
      likeErrorHandle(error, funcCallName);
    }
  };

  // Check to see if the attraction id is currently favorited in the database.
  const getAttractionFavStatus = async (funcCallName) => {
    try {
      const attractionIDRes = await getAttractionID("favorite");
      const currentUser = await getLoggedinUser("user");

      if (attractionIDRes.length != 0) {
        const { data } = await supabase
          .from("attraction_favs")
          .select("attraction_id")
          .eq("profile_id", currentUser)
          .eq("attraction_id", attractionIDRes[0].id);

        // Set the heart icon to active/inactive if the attraction is found/not found in the database.
        if (data.length != 0) {
          favorited.current = true;
          setfavorite(favorited.current);
        } else {
          favorited.current = false;
          setfavorite(favorited.current);
        }
      }
    } catch (error) {
      likeErrorHandle(error, funcCallName);
    }
  };

  const addAttractionfavorite = async () => {
    try {
      let attractionIDRes = await getAttractionID("add");
      let attractionID = attractionIDRes[0];
      let currentUser = await getLoggedinUser("add");

      if (attractionIDRes.length == 0) {
        // Insert attraction data into database.
        const { data } = await supabase
          .from("attractions")
          .insert({
            att_location: screenData.att_location,
            att_name: screenData.att_name,
            att_rating: screenData.att_rating,
            att_lat: screenData.att_lat,
            att_lng: screenData.att_lng,
            att_place_id: screenData.att_place_id,
            att_thumbnail_url: screenData.att_thumbnail_url.uri,
            att_total_reviews: screenData.att_total_reviews,
          })
          .select("id");
        attractionID = data[0];
      }

      // Link the current user with the favorited attraction id.
      await supabase.from("attraction_favs").insert({
        attraction_id: attractionID.id,
        profile_id: currentUser,
      });
    } catch (error) {
      likeErrorHandle(error, "add");
    }
  };

  const deleteAttractionfavorite = async () => {
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

  // Get the id of the current destination from the database.
  const getDestinationID = async (funcCallName) => {
    try {
      const { data } = await supabase.from("destinations").select("id").eq("destination_place_id", screenData.destination_place_id);
      return data;
    } catch (error) {
      likeErrorHandle(error, funcCallName);
    }
  };

  // Check to see if the destination id is currently favorited in the database.
  const getDestinationFavStatus = async (funcCallName) => {
    try {
      const destinationIDRes = await getDestinationID("favorite");
      const currentUser = await getLoggedinUser("user");

      if (destinationIDRes.length != 0) {
        const { data } = await supabase
          .from("destination_favs")
          .select("destination_id")
          .eq("profile_id", currentUser)
          .eq("destination_id", destinationIDRes[0].id);

        // Set the heart icon to active/inactive if the destination is found/not found in the database.
        if (data.length != 0) {
          favorited.current = true;
          setfavorite(favorited.current);
        } else {
          favorited.current = false;
          setfavorite(favorited.current);
        }
      }
    } catch (error) {
      likeErrorHandle(error, funcCallName);
    }
  };

  const addDestinationfavorite = async () => {
    try {
      let destinationIDRes = await getDestinationID("add");
      let currentUser = await getLoggedinUser("add");
      let destinationID = destinationIDRes[0];

      if (destinationIDRes.length == 0) {
        // Insert destination data into the database.
        const { data } = await supabase
          .from("destinations")
          .insert({
            destination_name: screenData.destination_name,
            destination_place_id: screenData.destination_place_id,
            destination_lat: screenData.destination_lat,
            destination_lng: screenData.destination_lng,
            destination_thumbnail: screenData.destination_thumbnail,
            destination_isCountry: screenData.destination_isCountry,
          })
          .select("id");
        destinationID = data[0];
      }

      //  Link the current user with the favorited destination id.
      await supabase.from("destination_favs").insert({
        destination_id: destinationID.id,
        profile_id: currentUser,
      });
    } catch (error) {
      likeErrorHandle(error, "add");
    }
  };

  const deleteDestinationfavorite = async () => {
    try {
      let destinationIDRes = await getDestinationID("delete");
      let currentUser = await getLoggedinUser("delete");

      // If the id appears in the database, allow the delete function to run.
      if (destinationIDRes.length > 0) {
        // Delete the destination with the returned id.
        await supabase.from("destination_favs").delete().eq("profile_id", currentUser).eq("destination_id", destinationIDRes[0].id);
      }
    } catch (error) {
      likeErrorHandle(error, "delete");
    }
  };

  useEffect(() => {
    ScreenType == "AttractionDetails" ? getAttractionFavStatus("favorite") : getDestinationFavStatus("favorite");
  }, []);

  return (
    <>
      <TouchableWithoutFeedback
        onPress={() => {
          favorited.current = !favorited.current;
          setfavorite(!favorite);
          if (favorited.current) {
            ScreenType == "AttractionDetails" ? addAttractionfavorite() : addDestinationfavorite();
          } else {
            ScreenType == "AttractionDetails" ? deleteAttractionfavorite() : deleteDestinationfavorite();
          }
        }}>
        <FontAwesome name={favorite ? "heart" : "heart-o"} size={24} color={favorite ? "#ea4c8a" : theme.colors.icon} />
      </TouchableWithoutFeedback>
      {ScreenType == "AttractionDetails" ? (
        <TouchableWithoutFeedback
          onPress={() => {
            console.log("Shared");
          }}>
          <Entypo name="share" style={{ marginLeft: 35, marginRight: 10 }} size={24} color={theme.colors.icon} />
        </TouchableWithoutFeedback>
      ) : (
        <TouchableWithoutFeedback
          onPress={() => {
            navigation.navigate("Map", {
              destination_lat: screenData.destination_lat,
              destination_lng: screenData.destination_lng,
              destination_isCountry: screenData.destination_isCountry,
            });
          }}>
          <FontAwesome name="map-marker" size={28} color={theme.colors.icon} style={{ marginLeft: 35, marginRight: 10 }} />
        </TouchableWithoutFeedback>
      )}
    </>
  );
}
