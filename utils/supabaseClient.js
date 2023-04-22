import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_API_KEY, SUPABASE_ANON_KEY } from "@env";

export const supabase = createClient(SUPABASE_API_KEY, SUPABASE_ANON_KEY);
