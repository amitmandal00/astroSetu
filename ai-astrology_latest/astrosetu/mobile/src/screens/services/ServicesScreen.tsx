import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const { width } = Dimensions.get('window');

const services = [
  {
    id: 'life',
    title: 'Life Report',
    description: 'Comprehensive life analysis based on your Kundli',
    icon: 'description',
    color: '#F97316',
    price: 299,
    duration: '30 pages',
  },
  {
    id: 'ascendant',
    title: 'Ascendant Prediction',
    description: 'Detailed ascendant-based predictions',
    icon: 'star',
    color: '#F59E0B',
    price: 199,
    duration: '20 pages',
  },
  {
    id: 'dasha',
    title: 'Dasha Phal Analysis',
    description: 'Current and upcoming dasha predictions',
    icon: 'schedule',
    color: '#9333EA',
    price: 249,
    duration: '25 pages',
  },
  {
    id: 'love',
    title: 'Love Horoscope',
    description: 'Relationship and love life predictions',
    icon: 'favorite',
    color: '#EF4444',
    price: 149,
    duration: '15 pages',
  },
  {
    id: 'mangal',
    title: 'Mangal Dosha Analysis',
    description: 'Comprehensive Mangal Dosha analysis and remedies',
    icon: 'warning',
    color: '#F59E0B',
    price: 199,
    duration: '18 pages',
  },
  {
    id: 'general',
    title: 'General Prediction',
    description: 'General life predictions and guidance',
    icon: 'auto-awesome',
    color: '#3B82F6',
    price: 99,
    duration: '12 pages',
  },
  {
    id: 'lalkitab',
    title: 'Lal Kitab Remedies',
    description: 'Traditional Lal Kitab remedies and solutions',
    icon: 'book',
    color: '#DC2626',
    price: 249,
    duration: '22 pages',
  },
  {
    id: 'varshphal',
    title: 'Varshphal Report',
    description: 'Annual predictions based on solar return',
    icon: 'calendar-month',
    color: '#10B981',
    price: 299,
    duration: '30 pages',
  },
];

export function ServicesScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handlePurchase = (serviceId: string) => {
    // Navigate to payment or show payment modal
    console.log('Purchase service:', serviceId);
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
            Premium Services
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.surface }]}>
            Get detailed astrological reports and predictions
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Services Grid */}
        {services.map((service) => (
          <Card
            key={service.id}
            style={styles.serviceCard}
            elevated
            onPress={() => setSelectedService(service.id)}
          >
            <View style={styles.serviceContent}>
              <View
                style={[
                  styles.serviceIconContainer,
                  { backgroundColor: `${service.color}15` },
                ]}
              >
                <Icon name={service.icon} size={32} color={service.color} />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={[styles.serviceTitle, { color: colors.text }, typography.bodyBold]}>
                  {service.title}
                </Text>
                <Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>
                  {service.description}
                </Text>
                <View style={styles.serviceMeta}>
                  <View style={styles.metaItem}>
                    <Icon name="description" size={14} color={colors.textSecondary} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {service.duration}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.servicePricing}>
                <Text style={[styles.price, { color: service.color }, typography.h3]}>
                  ₹{service.price}
                </Text>
                <Button
                  title="Buy Now"
                  onPress={() => handlePurchase(service.id)}
                  size="small"
                  style={styles.buyButton}
                />
              </View>
            </View>
          </Card>
        ))}

        {/* Info Section */}
        <Card style={styles.infoCard} elevated>
          <View style={styles.infoContent}>
            <Icon name="info" size={24} color={colors.primary} />
            <View style={styles.infoText}>
              <Text style={[styles.infoTitle, { color: colors.text }, typography.bodyBold]}>
                Why Choose Our Reports?
              </Text>
              <Text style={[styles.infoDescription, { color: colors.textSecondary }]}>
                • Accurate calculations using advanced algorithms{'\n'}
                • Detailed analysis by expert astrologers{'\n'}
                • Personalized predictions based on your birth chart{'\n'}
                • PDF download available for all reports
              </Text>
            </View>
          </View>
        </Card>
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
  scrollView: {
    flex: 1,
  },
  serviceCard: {
    padding: 20,
    marginBottom: 16,
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  serviceMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  servicePricing: {
    alignItems: 'flex-end',
    marginLeft: 16,
  },
  price: {
    marginBottom: 8,
    fontWeight: '700',
  },
  buyButton: {
    minWidth: 100,
  },
  infoCard: {
    padding: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  infoContent: {
    flexDirection: 'row',
  },
  infoText: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 22,
  },
});
