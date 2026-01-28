import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../theme/ThemeProvider';
import axios from 'axios';

interface Place {
  display_name: string;
  lat: number;
  lon: number;
}

interface PlaceAutocompleteProps {
  onSelect: (place: Place) => void;
  placeholder?: string;
}

export function PlaceAutocomplete({ onSelect, placeholder = 'Search place...' }: PlaceAutocompleteProps) {
  const { colors, spacing, borderRadius } = useTheme();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.length > 2) {
      searchPlaces(query);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const searchPlaces = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: searchQuery,
          format: 'json',
          limit: 5,
          countrycodes: 'in', // Focus on India
        },
        headers: {
          'User-Agent': 'AstroSetu Mobile App',
        },
      });

      const places: Place[] = response.data.map((item: any) => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }));

      setSuggestions(places);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching places:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (place: Place) => {
    setQuery(place.display_name);
    setShowSuggestions(false);
    onSelect(place);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Icon name="location-on" size={20} color={colors.textSecondary} style={styles.icon} />
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border,
              borderRadius: borderRadius.md,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          onFocus={() => query.length > 2 && setShowSuggestions(true)}
        />
        {loading && (
          <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View
          style={[
            styles.suggestionsContainer,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.md,
              borderColor: colors.border,
            },
          ]}
        >
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelect(item)}
              >
                <Icon name="location-on" size={16} color={colors.primary} />
                <Text style={[styles.suggestionText, { color: colors.text }]}>
                  {item.display_name}
                </Text>
              </TouchableOpacity>
            )}
            nestedScrollEnabled
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 48,
    paddingLeft: 48,
    paddingRight: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  loader: {
    position: 'absolute',
    right: 16,
  },
  suggestionsContainer: {
    marginTop: 8,
    maxHeight: 200,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
  },
});

