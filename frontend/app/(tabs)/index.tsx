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
import { LinearGradient } from 'expo-linear-gradient';
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
  const totalReservations = reservations.length;

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

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('tr-TR', {
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={[COLORS.gradientStart, COLORS.gradientEnd]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user?.full_name}</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(5, 150, 105, 0.2)' }]}>
                <Ionicons name="arrow-up-circle" size={24} color="#059669" />
              </View>
              <Text style={styles.statNumber}>{confirmedCount}</Text>
              <Text style={styles.statLabel}>Bekleyen Teslim</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(8, 145, 178, 0.2)' }]}>
                <Ionicons name="arrow-down-circle" size={24} color="#0891B2" />
              </View>
              <Text style={styles.statNumber}>{deliveredCount}</Text>
              <Text style={styles.statLabel}>Bekleyen İade</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(217, 119, 6, 0.2)' }]}>
                <Ionicons name="calendar" size={24} color="#D97706" />
              </View>
              <Text style={styles.statNumber}>{totalReservations}</Text>
              <Text style={styles.statLabel}>Toplam</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/nfc-scan')}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryLight]}
                style={styles.actionIconContainer}
              >
                <Ionicons name="card-outline" size={28} color="#fff" />
              </LinearGradient>
              <Text style={styles.actionTitle}>NFC Kimlik</Text>
              <Text style={styles.actionSubtitle}>TC Kimlik Oku</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/reservations')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: COLORS.success }]}>
                <Ionicons name="search-outline" size={28} color="#fff" />
              </View>
              <Text style={styles.actionTitle}>Rezervasyon</Text>
              <Text style={styles.actionSubtitle}>Ara & Bul</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/vehicles')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: COLORS.warning }]}>
                <Ionicons name="car-sport-outline" size={28} color="#fff" />
              </View>
              <Text style={styles.actionTitle}>Araç Listesi</Text>
              <Text style={styles.actionSubtitle}>Tüm Araçlar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/map')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: COLORS.info }]}>
                <Ionicons name="map-outline" size={28} color="#fff" />
              </View>
              <Text style={styles.actionTitle}>GPS Takip</Text>
              <Text style={styles.actionSubtitle}>Araç Konumları</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Deliveries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="arrow-up-circle" size={20} color={COLORS.success} />
              <Text style={styles.sectionTitle}>Bugünkü Teslimler</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/reservations')}>
              <Text style={styles.seeAll}>Tümü</Text>
            </TouchableOpacity>
          </View>
          
          {todayDeliveries.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="checkmark-done-circle" size={40} color={COLORS.success} />
              </View>
              <Text style={styles.emptyTitle}>Tüm Teslimler Tamamlandı</Text>
              <Text style={styles.emptyText}>Bugün bekleyen teslim yok</Text>
            </View>
          ) : (
            todayDeliveries.slice(0, 3).map((reservation) => (
              <TouchableOpacity
                key={reservation.id}
                style={styles.reservationCard}
                onPress={() => router.push({
                  pathname: '/delivery/[id]',
                  params: { id: reservation.id }
                })}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.cardBadge, { backgroundColor: COLORS.success + '20' }]}>
                    <Ionicons name="time-outline" size={16} color={COLORS.success} />
                    <Text style={[styles.cardBadgeText, { color: COLORS.success }]}>
                      {formatTime(reservation.start_date)}
                    </Text>
                  </View>
                  <Text style={styles.cardVehicle}>
                    {reservation.vehicle?.brand} {reservation.vehicle?.model}
                  </Text>
                  <Text style={styles.cardPlate}>{reservation.vehicle?.plate}</Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.cardCustomer}>{reservation.customer?.full_name}</Text>
                  <Text style={styles.cardLocation}>
                    <Ionicons name="location" size={12} color={COLORS.textLight} />
                    {' '}{reservation.pickup_location}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Today's Returns */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="arrow-down-circle" size={20} color={COLORS.info} />
              <Text style={styles.sectionTitle}>Bugünkü İadeler</Text>
            </View>
          </View>
          
          {todayReturns.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="checkmark-done-circle" size={40} color={COLORS.info} />
              </View>
              <Text style={styles.emptyTitle}>Tüm İadeler Tamamlandı</Text>
              <Text style={styles.emptyText}>Bugün bekleyen iade yok</Text>
            </View>
          ) : (
            todayReturns.slice(0, 3).map((reservation) => (
              <TouchableOpacity
                key={reservation.id}
                style={styles.reservationCard}
                onPress={() => router.push({
                  pathname: '/return/[id]',
                  params: { id: reservation.id }
                })}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.cardBadge, { backgroundColor: COLORS.info + '20' }]}>
                    <Ionicons name="time-outline" size={16} color={COLORS.info} />
                    <Text style={[styles.cardBadgeText, { color: COLORS.info }]}>
                      {formatTime(reservation.end_date)}
                    </Text>
                  </View>
                  <Text style={styles.cardVehicle}>
                    {reservation.vehicle?.brand} {reservation.vehicle?.model}
                  </Text>
                  <Text style={styles.cardPlate}>{reservation.vehicle?.plate}</Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.cardCustomer}>{reservation.customer?.full_name}</Text>
                  <Text style={styles.cardLocation}>
                    <Ionicons name="location" size={12} color={COLORS.textLight} />
                    {' '}{reservation.return_location}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))
          )}
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
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: SIZES.md,
    paddingTop: SIZES.md,
    paddingBottom: SIZES.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.lg,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    padding: SIZES.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
    marginTop: SIZES.sm,
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.xl,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  reservationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    ...SHADOWS.sm,
  },
  cardLeft: {
    flex: 1,
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SIZES.xs,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
    marginBottom: 6,
  },
  cardBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardVehicle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  cardPlate: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  cardRight: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: SIZES.sm,
  },
  cardCustomer: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  cardLocation: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
});
