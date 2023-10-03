import { useRef, useState, forwardRef, useImperativeHandle } from "react";
import { View, StyleSheet, Keyboard, TouchableWithoutFeedback } from "react-native";
import { Avatar, ListItem } from "@rneui/themed";
import { FontAwesome, Feather, MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../utils/supabaseClient";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

export default AccountIconModal = forwardRef((props, ref) => {
  const bottomSheetRef = useRef(null);
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

  // Expose the "handleCloseModal" function to the parent using the ref passed in from the parent.
  useImperativeHandle(ref, () => ({
    handleCloseModal() {
      setModalVisable(false);
      bottomSheetRef.current?.dismiss();
      Keyboard.dismiss();
      props.modalVisableState(modalVisable);
    },
  }));

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
    }
  };

  return (
    <View>
      <Avatar
        size={54}
        rounded
        renderPlaceholderContent={<FontAwesome name="user-circle" size={44} color="white" />}
        onPress={toggleModal}
        source={{
          uri: "https://randomuser.me/api/portraits/men/36.jpg",
        }}
      />
      <BottomSheetModal ref={bottomSheetRef} snapPoints={snapPoints} backgroundStyle={styles.listItemContainer}>
        <View>
          <TouchableWithoutFeedback onPress={() => console.log("Settings")}>
            <ListItem containerStyle={styles.listItemContainer}>
              <Feather name="settings" size={25} color="white" />
              <ListItem.Content>
                <ListItem.Title style={styles.listItemText}>Settings</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={handleSignOut}>
            <ListItem containerStyle={styles.listItemContainer}>
              <MaterialIcons name="logout" size={25} color="white" />
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

const styles = StyleSheet.create({
  listItemContainer: {
    backgroundColor: "#252B34",
  },

  listItemText: {
    color: "white",
    fontFamily: "RalewayBold",
    fontSize: 20,
    paddingBottom: 5,
  },
});
