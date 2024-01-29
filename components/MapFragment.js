import { StyleSheet } from "react-native";
import { useTheme, useThemeMode } from "@rneui/themed";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import mapStyleDark from "../utils/mapStyleDark.json";
import mapStyleLight from "../utils/mapStyleLight.json";

export default function MapFragment(props) {
  const { theme } = useTheme();
  const { mode } = useThemeMode();

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      customMapStyle={mode == "dark" ? mapStyleDark : mapStyleLight}
      loadingEnabled={true}
      loadingIndicatorColor={theme.colors.active}
      loadingBackgroundColor={theme.colors.background}
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
