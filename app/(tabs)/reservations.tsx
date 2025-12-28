import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { reservationService } from '../../src/services/api';
import { COLORS, SIZES, SHADOWS } from '../../src/constants/theme';
import { Reservation } from '../../src/types';

const STATUS_FILTERS = [
  { key: 'all', label: 'Tümü' },
  { key: 'confirmed', label: 'Onaylandı' },
  { key: 'delivered', label: 'Teslim Edildi' },
  { key: 'returned', label: 'İade Edildi' },
];

export default function ReservationsScreen() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

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

  useEffect(() => {
    let filtered = reservations;
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((r) => r.status === selectedStatus);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.customer?.full_name.toLowerCase().includes(query) ||
          r.vehicle?.plate.toLowerCase().includes(query) ||
          r.vehicle?.brand.toLowerCase().includes(query)
      );
    }
    
    setFilteredReservations(filtered);
  }, [reservations, selectedStatus, searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReservations();
    setRefreshing(false);
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return COLORS.textMuted;
      case 'confirmed': return COLORS.warning;
      case 'delivered': return COLORS.info;
      case 'returned': return COLORS.success;
      case 'closed': return COLORS.secondary;
      default: return COLORS.textMuted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'created': return 'Oluşturuldu';
      case 'confirmed': return 'Onaylandı';
      case 'delivered': return 'Teslim Edildi';
      case 'returned': return 'İade Edildi';
      case 'closed': return 'Kapatıldı';
      default: return status;
    }
  };

  const handleReservationPress = (reservation: Reservation) => {
    if (reservation.status === 'confirmed') {
      router.push({
        pathname: '/delivery/[id]',
        params: { id: reservation.id }
      });
    } else if (reservation.status === 'delivered') {
      router.push({
        pathname: '/return/[id]',
        params: { id: reservation.id }
      });
    } else {
      router.push({
        pathname: '/reservation/[id]',
        params: { id: reservation.id }
      });
    }
  };

  const renderReservation = ({ item }: { item: Reservation }) => (
    <TouchableOpacity
      style={styles.reservationCard}
      onPress={() => handleReservationPress(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName}>
            {item.vehicle?.brand} {item.vehicle?.model}
          </Text>
          <Text style={styles.vehiclePlate}>{item.vehicle?.plate}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.detailText}>{item.customer?.full_name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.detailText}>{item.customer?.phone}</Text>
        </View>
        <View style={styles.dateRow}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Başlangıç</Text>
            <Text style={styles.dateValue}>{formatDate(item.start_date)}</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color={COLORS.textMuted} />
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Bitiş</Text>
            <Text style={styles.dateValue}>{formatDate(item.end_date)}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.totalAmount}>
          {item.total_amount.toLocaleString('tr-TR')} ₺
        </Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
      </View>
    </TouchableOpacity>
  );

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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rezervasyonlar</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Müşteri adı, plaka veya marka ara..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedStatus === item.key && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedStatus(item.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedStatus === item.key && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Reservations List */}
      <FlatList
        data={filteredReservations}
        keyExtractor={(item) => item.id}
        renderItem={renderReservation}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Rezervasyon bulunamadı</Text>
          </View>
        }
      />
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
  header: {
    padding: SIZES.md,
    paddingBottom: SIZES.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.md,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radius,
    height: 48,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: SIZES.sm,
    fontSize: 16,
    color: COLORS.text,
  },
  filtersContainer: {
    marginVertical: SIZES.md,
  },
  filtersList: {
    paddingHorizontal: SIZES.md,
    gap: SIZES.sm,
  },
  filterButton: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.surface,
    marginRight: SIZES.xs,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: SIZES.md,
  },
  reservationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SIZES.sm,
  },
  cardDetails: {
    gap: 8,
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SIZES.xs,
    paddingTop: SIZES.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  dateValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.sm,
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: SIZES.md,
    fontSize: 16,
    color: COLORS.textMuted,
  },
});
