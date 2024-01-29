import { useRef, useState, forwardRef, useImperativeHandle, useContext } from "react";
import { View, StyleSheet, Keyboard, TouchableWithoutFeedback } from "react-native";
import { Avatar, ListItem, useTheme } from "@rneui/themed";
import { FontAwesome, Feather, MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../utils/supabaseClient";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { AppContext } from "../utils/AppContext";

export default AccountIconModal = forwardRef((props, ref) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const bottomSheetRef = useRef(null);
  const { profilePic } = useContext(AppContext);
  const [modalVisable, setModalVisable] = useState(false);
  const snapPoints = ["21%"];

  const toggleModal = () => {
    setModalVisable(!modalVisable);

    if (modalVisable) {
      bottomSheetRef.current?.dismiss();
    } else {
      bottomSheetRef.current?.present();
    }
    Keyboard.dismiss();

    // Sends the current modal state back to the parent.
    props.modalVisableState(modalVisable);
  };

  const handleCloseModal = () => {
    setModalVisable(false);
    bottomSheetRef.current?.dismiss();
    Keyboard.dismiss();
    props.modalVisableState(modalVisable);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("An Error has occured, please try again.");
    }
  };

  // Expose the "handleCloseModal" function to the parent using the ref passed in from the parent.
  useImperativeHandle(ref, () => ({ handleCloseModal }));

  return (
    <View>
      <Avatar
        size={54}
        rounded
        renderPlaceholderContent={<FontAwesome name="user-circle" size={44} color={theme.colors.icon} />}
        onPress={toggleModal}
        source={profilePic == null ? profilePic : { uri: profilePic }}
      />
      <BottomSheetModal ref={bottomSheetRef} snapPoints={snapPoints} backgroundStyle={styles.listItemContainer}>
        <View>
          <TouchableWithoutFeedback
            onPress={() => {
              handleCloseModal();
              props.navigation.navigate("Settings");
            }}>
            <ListItem containerStyle={styles.listItemContainer}>
              <Feather name="settings" size={25} color={theme.colors.icon} />
              <ListItem.Content>
                <ListItem.Title style={styles.listItemText}>Settings</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={handleSignOut}>
            <ListItem containerStyle={styles.listItemContainer}>
              <MaterialIcons name="logout" size={25} color={theme.colors.icon} />
              <ListItem.Content>
                <ListItem.Title style={styles.listItemText}>Log Out</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          </TouchableWithoutFeedback>
        </View>
      </BottomSheetModal>
    </View>
  );
});

const getStyles = (theme) => {
  return StyleSheet.create({
    listItemContainer: {
      backgroundColor: theme.colors.secondaryBackground,
    },

    listItemText: {
      color: theme.colors.text,
      fontFamily: "RalewayBold",
      fontSize: 20,
      paddingBottom: 5,
    },
  });
};
