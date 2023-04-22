import { View, Text, Button } from "react-native";
import { supabase } from "../utils/supabaseClient";

export default function Home() {
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
    }
  };

  return (
    <View>
      <Text>Logged In</Text>
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
}
