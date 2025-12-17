import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { reservationService } from '../../src/services/api';
import { COLORS, SIZES, SHADOWS } from '../../src/constants/theme';
import { Reservation } from '../../src/types';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReservations = async () => {
    try {
      const data = await reservationService.getAll();
      setReservations(data);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReservations();
    setRefreshing(false);
  }, []);

  const today = new Date().toDateString();
  
  const todayDeliveries = reservations.filter(
    (r) => r.status === 'confirmed' && new Date(r.start_date).toDateString() === today
  );
  
  const todayReturns = reservations.filter(
    (r) => r.status === 'delivered' && new Date(r.end_date).toDateString() === today
  );

  const confirmedCount = reservations.filter((r) => r.status === 'confirmed').length;
  const deliveredCount = reservations.filter((r) => r.status === 'delivered').length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi Günler';
    return 'İyi Akşamlar';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.full_name}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: COLORS.primaryLight }]}>
            <Ionicons name="arrow-up-circle" size={32} color="#fff" />
            <Text style={styles.statNumber}>{confirmedCount}</Text>
            <Text style={styles.statLabel}>Bekleyen Teslim</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.success }]}>
            <Ionicons name="arrow-down-circle" size={32} color="#fff" />
            <Text style={styles.statNumber}>{deliveredCount}</Text>
            <Text style={styles.statLabel}>Bekleyen İade</Text>
          </View>
        </View>

        {/* Today's Deliveries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bugünkü Teslimler</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/reservations')}>
              <Text style={styles.seeAll}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          {todayDeliveries.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Bugün teslim edilecek araç yok</Text>
            </View>
          ) : (
            todayDeliveries.map((reservation) => (
              <TouchableOpacity
                key={reservation.id}
                style={styles.reservationCard}
                onPress={() => router.push({
                  pathname: '/delivery/[id]',
                  params: { id: reservation.id }
                })}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleName}>
                      {reservation.vehicle?.brand} {reservation.vehicle?.model}
                    </Text>
                    <Text style={styles.vehiclePlate}>{reservation.vehicle?.plate}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: COLORS.warning + '20' }]}>
                    <Text style={[styles.statusText, { color: COLORS.warning }]}>Teslim Bekliyor</Text>
                  </View>
                </View>
                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="person-outline" size={16} color={COLORS.textLight} />
                    <Text style={styles.detailText}>{reservation.customer?.full_name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
                    <Text style={styles.detailText}>{reservation.pickup_location}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color={COLORS.textLight} />
                    <Text style={styles.detailText}>{formatDate(reservation.start_date)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Today's Returns */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bugünkü İadeler</Text>
          </View>
          {todayReturns.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Bugün iade edilecek araç yok</Text>
            </View>
          ) : (
            todayReturns.map((reservation) => (
              <TouchableOpacity
                key={reservation.id}
                style={styles.reservationCard}
                onPress={() => router.push({
                  pathname: '/return/[id]',
                  params: { id: reservation.id }
                })}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleName}>
                      {reservation.vehicle?.brand} {reservation.vehicle?.model}
                    </Text>
                    <Text style={styles.vehiclePlate}>{reservation.vehicle?.plate}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: COLORS.info + '20' }]}>
                    <Text style={[styles.statusText, { color: COLORS.info }]}>İade Bekliyor</Text>
                  </View>
                </View>
                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="person-outline" size={16} color={COLORS.textLight} />
                    <Text style={styles.detailText}>{reservation.customer?.full_name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
                    <Text style={styles.detailText}>{reservation.return_location}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color={COLORS.textLight} />
                    <Text style={styles.detailText}>{formatDate(reservation.end_date)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/nfc-scan')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name="card-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>NFC Kimlik Oku</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/reservations')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.success + '15' }]}>
                <Ionicons name="search-outline" size={24} color={COLORS.success} />
              </View>
              <Text style={styles.actionText}>Rezervasyon Ara</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/vehicles')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.warning + '15' }]}>
                <Ionicons name="car-outline" size={24} color={COLORS.warning} />
              </View>
              <Text style={styles.actionText}>Araç Listesi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: SIZES.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginBottom: SIZES.xl,
  },
  statCard: {
    flex: 1,
    padding: SIZES.lg,
    borderRadius: SIZES.radiusLg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginTop: SIZES.xs,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  section: {
    marginBottom: SIZES.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primaryLight,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    padding: SIZES.xxl,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  emptyText: {
    marginTop: SIZES.sm,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  reservationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.sm,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  vehiclePlate: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginTop: SIZES.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  actionText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
    textAlign: 'center',
  },
});
