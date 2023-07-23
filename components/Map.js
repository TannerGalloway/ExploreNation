import { StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import mapStyle from "./mapStyleDark.json";

export default function Map({ latlng }) {
  return (
    <MapView
      provider="google"
      style={styles.map}
      customMapStyle={mapStyle}
      loadingEnabled={true}
      loadingIndicatorColor="#00A8DA"
      loadingBackgroundColor="#101d23"
      initialRegion={{
        latitude: latlng.lat,
        longitude: latlng.lng,
        latitudeDelta: 0.0822,
        longitudeDelta: 0.0421,
      }}>
      <Marker pinColor={"#356EED"} coordinate={{ latitude: latlng.lat, longitude: latlng.lng }} />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
