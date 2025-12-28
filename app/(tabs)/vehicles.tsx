import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { vehicleService } from '../../src/services/api';
import { COLORS, SIZES, SHADOWS } from '../../src/constants/theme';
import { Vehicle } from '../../src/types';

const STATUS_COLORS: Record<string, string> = {
  available: COLORS.success,
  reserved: COLORS.warning,
  rented: COLORS.info,
  maintenance: COLORS.danger,
};

const STATUS_LABELS: Record<string, string> = {
  available: 'Müsait',
  reserved: 'Rezerve',
  rented: 'Kirada',
  maintenance: 'Bakımda',
};

export default function VehiclesScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadVehicles();
    setRefreshing(false);
  }, []);

  const renderVehicle = ({ item }: { item: Vehicle }) => (
    <View style={styles.vehicleCard}>
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.vehicleImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="car" size={48} color={COLORS.textMuted} />
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || COLORS.textMuted }]}>
          <Text style={styles.statusText}>{STATUS_LABELS[item.status] || item.status}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.vehicleName}>{item.brand} {item.model}</Text>
          <Text style={styles.vehicleYear}>{item.year}</Text>
        </View>
        
        <Text style={styles.vehiclePlate}>{item.plate}</Text>
        
        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Ionicons name="speedometer-outline" size={14} color={COLORS.textLight} />
            <Text style={styles.specText}>{item.mileage.toLocaleString('tr-TR')} km</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="color-palette-outline" size={14} color={COLORS.textLight} />
            <Text style={styles.specText}>{item.color}</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="flash-outline" size={14} color={COLORS.textLight} />
            <Text style={styles.specText}>{item.fuel_type}</Text>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.featuresRow}>
            <View style={styles.featureChip}>
              <Text style={styles.featureText}>{item.transmission}</Text>
            </View>
            <View style={styles.featureChip}>
              <Text style={styles.featureText}>{item.seat_count} Koltuk</Text>
            </View>
            <View style={styles.featureChip}>
              <Text style={styles.featureText}>{item.segment}</Text>
            </View>
          </View>
          <Text style={styles.dailyRate}>{item.daily_rate.toLocaleString('tr-TR')} ₺/gün</Text>
        </View>
      </View>
    </View>
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
        <Text style={styles.title}>Araçlar</Text>
        <Text style={styles.subtitle}>{vehicles.length} araç</Text>
      </View>

      {/* Vehicles List */}
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        renderItem={renderVehicle}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Araç bulunamadı</Text>
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
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  listContent: {
    padding: SIZES.md,
  },
  vehicleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    marginBottom: SIZES.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: SIZES.sm,
    right: SIZES.sm,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  cardContent: {
    padding: SIZES.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  vehicleYear: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  vehiclePlate: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  specsRow: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginTop: SIZES.sm,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.md,
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: SIZES.xs,
  },
  featureChip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featureText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  dailyRate: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.success,
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
