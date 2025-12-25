import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiService } from '../../services/api';

export function WalletScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const response = await apiService.get('/wallet');
      if (response.ok && response.data) {
        setBalance(response.data.balance || 0);
        setTransactions(response.data.transactions || []);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
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
            E-Wallet
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.surface }]}>
            Manage your account balance
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <Card
          style={styles.balanceCard}
          gradient
          gradientColors={[colors.primary, colors.primaryDark]}
        >
          <View style={styles.balanceContent}>
            <Text style={[styles.balanceLabel, { color: colors.surface }]}>
              Available Balance
            </Text>
            <Text style={[styles.balanceAmount, { color: colors.surface }]}>
              ₹{balance.toLocaleString()}
            </Text>
          </View>
          <View style={styles.balanceIcon}>
            <Icon name="account-balance-wallet" size={48} color={colors.surface} />
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Button
            title="Add Money"
            onPress={() => {}}
            icon="add"
            iconPosition="left"
            fullWidth
            style={styles.actionButton}
          />
        </View>

        {/* Transactions */}
        <View style={styles.transactionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }, typography.h3]}>
            Recent Transactions
          </Text>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <Card key={transaction.id} style={styles.transactionCard} elevated>
                <View style={styles.transactionContent}>
                  <View
                    style={[
                      styles.transactionIcon,
                      {
                        backgroundColor: transaction.type === 'credit' 
                          ? `${colors.success}15` 
                          : `${colors.error}15`,
                      },
                    ]}
                  >
                    <Icon
                      name={transaction.type === 'credit' ? 'arrow-downward' : 'arrow-upward'}
                      size={24}
                      color={transaction.type === 'credit' ? colors.success : colors.error}
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionTitle, { color: colors.text }]}>
                      {transaction.description || 'Transaction'}
                    </Text>
                    <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color: transaction.type === 'credit' ? colors.success : colors.error,
                      },
                    ]}
                  >
                    {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                  </Text>
                </View>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Icon name="receipt-long" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No transactions yet
                </Text>
              </View>
            </Card>
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
  balanceCard: {
    padding: 24,
    marginBottom: 20,
    minHeight: 160,
  },
  balanceContent: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '700',
  },
  balanceIcon: {
    position: 'absolute',
    right: 24,
    top: 24,
    opacity: 0.3,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 8,
  },
  transactionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '700',
  },
  transactionCard: {
    padding: 16,
    marginBottom: 12,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 40,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
  },
});
