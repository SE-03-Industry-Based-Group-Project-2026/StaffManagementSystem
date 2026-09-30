import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = 'https://txbfrlckwvtqjdznxznt.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_m1cIDKcxV2e579nJ3KPv8Q_W3JA2d__';

// Web එකට සහ Mobile එකට වෙන වෙනම Storage හසුරුවන අලුත් Adapter එකක්
const customStorage = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') {
        return Promise.resolve(null); // සර්වර් එකේ රන් වෙද්දී මුකුත් කරන්නේ නෑ
      }
      return Promise.resolve(window.localStorage.getItem(key)); // බ්‍රවුසර් එකේදී LocalStorage ගන්නවා
    }
    return AsyncStorage.getItem(key); // Mobile (Android/iOS) වලදී AsyncStorage ගන්නවා
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
      return Promise.resolve();
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      return Promise.resolve();
    }
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage, // අර හැදුව customStorage එක මෙතනට දෙනවා
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});