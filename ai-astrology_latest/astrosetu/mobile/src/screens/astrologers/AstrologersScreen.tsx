import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/SkeletonLoader';
import { apiService } from '../../services/api';

const { width } = Dimensions.get('window');

interface Astrologer {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  pricePerMinute: number;
  languages: string[];
  image?: string;
  online: boolean;
}

export function AstrologersScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const navigation = useNavigation();
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAstrologers();
  }, []);

  const loadAstrologers = async () => {
    try {
      const response = await apiService.get('/astrologers');
      if (response.ok && response.data) {
        setAstrologers(response.data);
      }
    } catch (error) {
      console.error('Error loading astrologers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAstrologers();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.surface }]}>
            Expert Astrologers
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.surface }]}>
            Connect with verified Vedic astrology experts
          </Text>
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={[styles.filtersContainer, { backgroundColor: colors.surface, padding: spacing.md }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {['All', 'Online', 'Vedic', 'Numerology', 'Palmistry'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === 'All' ? colors.primary : colors.background,
                  borderRadius: borderRadius.full,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: filter === 'All' ? colors.surface : colors.text,
                  },
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Astrologers List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : astrologers.length > 0 ? (
          astrologers.map((astrologer) => (
            <Card
              key={astrologer.id}
              onPress={() => navigation.navigate('Chat' as never, { astrologerId: astrologer.id } as never)}
              style={styles.astrologerCard}
              elevated
            >
              <View style={styles.astrologerContent}>
                <View style={styles.astrologerImageContainer}>
                  {astrologer.image ? (
                    <Image
                      source={{ uri: astrologer.image }}
                      style={styles.astrologerImage}
                    />
                  ) : (
                    <View style={[styles.astrologerImagePlaceholder, { backgroundColor: colors.primary }]}>
                      <Text style={styles.astrologerInitial}>
                        {astrologer.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  {astrologer.online && (
                    <View style={[styles.onlineIndicator, { backgroundColor: colors.success }]} />
                  )}
                </View>

                <View style={styles.astrologerInfo}>
                  <View style={styles.astrologerHeader}>
                    <Text style={[styles.astrologerName, { color: colors.text }, typography.bodyBold]}>
                      {astrologer.name}
                    </Text>
                    <View style={styles.ratingContainer}>
                      <Icon name="star" size={16} color={colors.secondary} />
                      <Text style={[styles.rating, { color: colors.text }]}>
                        {astrologer.rating.toFixed(1)}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.specialization, { color: colors.textSecondary }, typography.caption]}>
                    {astrologer.specialization}
                  </Text>

                  <View style={styles.astrologerDetails}>
                    <View style={styles.detailItem}>
                      <Icon name="work" size={14} color={colors.textSecondary} />
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        {astrologer.experience}+ years
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Icon name="language" size={14} color={colors.textSecondary} />
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        {astrologer.languages.join(', ')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.priceContainer}>
                    <Text style={[styles.price, { color: colors.primary }, typography.bodyBold]}>
                      ₹{astrologer.pricePerMinute}/min
                    </Text>
                    <Button
                      title="Chat Now"
                      onPress={() => navigation.navigate('Chat' as never, { astrologerId: astrologer.id } as never)}
                      size="small"
                      style={styles.chatButton}
                    />
                  </View>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="people-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No astrologers available
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
  },
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filters: {
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  astrologerCard: {
    marginBottom: 16,
    padding: 20,
  },
  astrologerContent: {
    flexDirection: 'row',
  },
  astrologerImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  astrologerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  astrologerImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  astrologerInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  astrologerInfo: {
    flex: 1,
  },
  astrologerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  astrologerName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
  },
  specialization: {
    marginBottom: 12,
    fontSize: 13,
  },
  astrologerDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  price: {
    fontSize: 16,
  },
  chatButton: {
    minWidth: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
});
