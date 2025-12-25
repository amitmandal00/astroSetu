import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/SkeletonLoader';
import { apiService } from '../../services/api';

interface Report {
  id: string;
  type: string;
  title: string;
  createdAt: string;
  status: 'completed' | 'pending';
}

export function ReportsScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      // Simulate API call
      const mockReports: Report[] = [
        {
          id: '1',
          type: 'life',
          title: 'Life Report',
          createdAt: new Date().toISOString(),
          status: 'completed',
        },
        {
          id: '2',
          type: 'ascendant',
          title: 'Ascendant Prediction',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'completed',
        },
      ];
      setReports(mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  const reportTypes = [
    { id: 'life', title: 'Life Report', icon: 'description', color: colors.primary },
    { id: 'ascendant', title: 'Ascendant', icon: 'star', color: colors.secondary },
    { id: 'dasha', title: 'Dasha Phal', icon: 'schedule', color: colors.purple },
    { id: 'love', title: 'Love Horoscope', icon: 'favorite', color: colors.error },
    { id: 'mangal', title: 'Mangal Dosha', icon: 'warning', color: colors.warning },
    { id: 'general', title: 'General Prediction', icon: 'auto-awesome', color: colors.info },
  ];

  const getReportIcon = (type: string) => {
    const reportType = reportTypes.find((r) => r.id === type);
    return reportType?.icon || 'description';
  };

  const getReportColor = (type: string) => {
    const reportType = reportTypes.find((r) => r.id === type);
    return reportType?.color || colors.primary;
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
            My Reports
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.surface }]}>
            View and download your astrological reports
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={[styles.sectionTitle, { color: colors.text }, typography.h3]}>
            Generate New Report
          </Text>
          <View style={styles.reportTypesGrid}>
            {reportTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.reportTypeCard,
                  {
                    backgroundColor: colors.surface,
                    borderRadius: borderRadius.lg,
                  },
                ]}
              >
                <View
                  style={[
                    styles.reportTypeIcon,
                    { backgroundColor: `${type.color}15` },
                  ]}
                >
                  <Icon name={type.icon} size={24} color={type.color} />
                </View>
                <Text style={[styles.reportTypeTitle, { color: colors.text }]}>
                  {type.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reports List */}
        <View style={styles.reportsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }, typography.h3]}>
            Recent Reports
          </Text>
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : reports.length > 0 ? (
            reports.map((report) => (
              <Card key={report.id} style={styles.reportCard} elevated>
                <View style={styles.reportContent}>
                  <View
                    style={[
                      styles.reportIcon,
                      { backgroundColor: `${getReportColor(report.type)}15` },
                    ]}
                  >
                    <Icon
                      name={getReportIcon(report.type)}
                      size={24}
                      color={getReportColor(report.type)}
                    />
                  </View>
                  <View style={styles.reportInfo}>
                    <Text style={[styles.reportTitle, { color: colors.text }, typography.bodyBold]}>
                      {report.title}
                    </Text>
                    <Text style={[styles.reportDate, { color: colors.textSecondary }]}>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.reportActions}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { backgroundColor: `${colors.primary}15` },
                      ]}
                    >
                      <Icon name="download" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { backgroundColor: `${colors.info}15` },
                      ]}
                    >
                      <Icon name="visibility" size={20} color={colors.info} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <EmptyState
              icon="description"
              title="No Reports Yet"
              message="Generate your first astrological report to get started"
              actionLabel="Generate Report"
              onAction={() => {}}
            />
          )}
        </View>
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
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '700',
  },
  reportTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  reportTypeCard: {
    width: '30%',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  reportTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTypeTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  reportsSection: {
    marginBottom: 20,
  },
  reportCard: {
    padding: 16,
    marginBottom: 12,
  },
  reportContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 12,
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
