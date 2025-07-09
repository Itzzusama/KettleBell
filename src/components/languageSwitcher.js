import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import i18n from '../../i18n';

const LANGUAGE_KEY = '@app_language';

const LanguageSwitcher = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage) {
        await i18n.changeLanguage(savedLanguage);
        setCurrentLang(savedLanguage);
      } else {
        await i18n.changeLanguage('en'); 
        setCurrentLang('en');
        await AsyncStorage.setItem(LANGUAGE_KEY, 'en');
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
      await i18n.changeLanguage('en');
      setCurrentLang('en');
    }
  };

  const toggleLanguage = async () => {
    try {
      setIsLoading(true);
      const newLang = currentLang === 'en' ? 'ru' : 'en';
      await AsyncStorage.setItem(LANGUAGE_KEY, newLang);
      await i18n.changeLanguage(newLang);
      setCurrentLang(newLang);
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLanguageFlag = () => {
    return currentLang === 'en' ? '🇺🇸' : '🇷🇺';
  };

  const getLanguageCode = () => {
    return currentLang === 'en' ? 'EN' : 'RU';
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={toggleLanguage}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <>
            <Text style={styles.flag}>{getLanguageFlag()}</Text>
            <Text style={styles.code}>{getLanguageCode()}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignSelf: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  flag: {
    fontSize: 16,
  },
  code: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default LanguageSwitcher;