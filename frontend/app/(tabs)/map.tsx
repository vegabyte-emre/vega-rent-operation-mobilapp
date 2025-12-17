import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { gpsService, vehicleService } from '../../src/services/api';
import { COLORS, SIZES, SHADOWS } from '../../src/constants/theme';
import { Vehicle, GPSVehicle } from '../../src/types';

export default function MapScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [gpsData, setGpsData] = useState<GPSVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vehiclesData, gpsVehicles] = await Promise.all([
        vehicleService.getAll(),
        gpsService.getVehicles(),
      ]);
      setVehicles(vehiclesData);
      setGpsData(gpsVehicles);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return COLORS.success;
      case 'reserved': return COLORS.warning;
      case 'rented': return COLORS.info;
      case 'maintenance': return COLORS.danger;
      default: return COLORS.textMuted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Müsait';
      case 'reserved': return 'Rezerve';
      case 'rented': return 'Kirada';
      case 'maintenance': return 'Bakımda';
      default: return status;
    }
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Araç Konumları</Text>
        <Text style={styles.subtitle}>{vehicles.length} araç takip ediliyor</Text>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={64} color={COLORS.textMuted} />
          <Text style={styles.mapPlaceholderText}>Harita Görünümü</Text>
          <Text style={styles.mapPlaceholderSubtext}>
            GPS verisi mevcut olduğunda araç konumları burada görüntülenecek
          </Text>
        </View>
      </View>

      {/* Vehicle List */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Araç Listesi</Text>
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const gps = gpsData.find((g) => g.vehicle_id === item.id);
            return (
              <TouchableOpacity
                style={[
                  styles.vehicleItem,
                  selectedVehicle === item.id && styles.vehicleItemSelected,
                ]}
                onPress={() => setSelectedVehicle(selectedVehicle === item.id ? null : item.id)}
              >
                <View style={[styles.vehicleStatus, { backgroundColor: getStatusColor(item.status) }]} />
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>{item.brand} {item.model}</Text>
                  <Text style={styles.vehiclePlate}>{item.plate}</Text>
                </View>
                <View style={styles.vehicleMeta}>
                  <View style={styles.statusChip}>
                    <Text style={[styles.statusChipText, { color: getStatusColor(item.status) }]}>
                      {getStatusLabel(item.status)}
                    </Text>
                  </View>
                  {gps ? (
                    <View style={styles.gpsInfo}>
                      <Ionicons name="location" size={12} color={COLORS.success} />
                      <Text style={styles.gpsText}>GPS Aktif</Text>
                    </View>
                  ) : (
                    <View style={styles.gpsInfo}>
                      <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
                      <Text style={[styles.gpsText, { color: COLORS.textMuted }]}>GPS Yok</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
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
  mapContainer: {
    height: 200,
    marginHorizontal: SIZES.md,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.borderLight,
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textLight,
    marginTop: SIZES.sm,
  },
  mapPlaceholderSubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: SIZES.xl,
  },
  listContainer: {
    flex: 1,
    padding: SIZES.md,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.sm,
    ...SHADOWS.sm,
  },
  vehicleItemSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  vehicleStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SIZES.sm,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  vehiclePlate: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  vehicleMeta: {
    alignItems: 'flex-end',
  },
  statusChip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  gpsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  gpsText: {
    fontSize: 11,
    color: COLORS.success,
  },
});
