import { StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import mapStyle from "../utils/mapStyleDark.json";

export default function MapFragment(props) {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      customMapStyle={mapStyle}
      loadingEnabled={true}
      loadingIndicatorColor="#00A8DA"
      loadingBackgroundColor="#101d23"
      initialRegion={{
        latitude: props.lat,
        longitude: props.lng,
        latitudeDelta: 0.0122,
        longitudeDelta: 0.0122,
      }}>
      <Marker pinColor={"#356EED"} coordinate={{ latitude: props.lat, longitude: props.lng }} />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
