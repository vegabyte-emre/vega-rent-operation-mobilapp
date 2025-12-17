import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { reservationService } from '../../src/services/api';
import { COLORS, SIZES, SHADOWS } from '../../src/constants/theme';
import { Reservation } from '../../src/types';

export default function ReservationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReservation();
  }, [id]);

  const loadReservation = async () => {
    try {
      const data = await reservationService.getById(id!);
      setReservation(data);
    } catch (error) {
      console.error('Error loading reservation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
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

  if (!reservation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Rezervasyon bulunamadı</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Rezervasyon Detayı',
          headerTintColor: COLORS.text,
          headerStyle: { backgroundColor: COLORS.surface },
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Status Badge */}
          <View style={[styles.statusCard, { backgroundColor: getStatusColor(reservation.status) + '15' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(reservation.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(reservation.status) }]}>
              {getStatusLabel(reservation.status)}
            </Text>
          </View>

          {/* Vehicle Info */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="car" size={24} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Araç Bilgileri</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Araç:</Text>
                <Text style={styles.infoValue}>
                  {reservation.vehicle?.brand} {reservation.vehicle?.model} ({reservation.vehicle?.year})
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Plaka:</Text>
                <Text style={[styles.infoValue, styles.plateText]}>
                  {reservation.vehicle?.plate}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Segment:</Text>
                <Text style={styles.infoValue}>{reservation.vehicle?.segment}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Vites:</Text>
                <Text style={styles.infoValue}>{reservation.vehicle?.transmission}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Yakıt:</Text>
                <Text style={styles.infoValue}>{reservation.vehicle?.fuel_type}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Renk:</Text>
                <Text style={styles.infoValue}>{reservation.vehicle?.color}</Text>
              </View>
            </View>
          </View>

          {/* Customer Info */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person" size={24} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Müşteri Bilgileri</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ad Soyad:</Text>
                <Text style={styles.infoValue}>{reservation.customer?.full_name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>TC No:</Text>
                <Text style={styles.infoValue}>{reservation.customer?.tc_no}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>E-posta:</Text>
                <Text style={styles.infoValue}>{reservation.customer?.email}</Text>
              </View>
              <TouchableOpacity
                style={styles.phoneRow}
                onPress={() => handleCall(reservation.customer?.phone || '')}
              >
                <Text style={styles.infoLabel}>Telefon:</Text>
                <View style={styles.phoneValue}>
                  <Text style={[styles.infoValue, styles.phoneText]}>
                    {reservation.customer?.phone}
                  </Text>
                  <Ionicons name="call" size={18} color={COLORS.success} />
                </View>
              </TouchableOpacity>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Adres:</Text>
                <Text style={[styles.infoValue, styles.addressText]}>
                  {reservation.customer?.address}
                </Text>
              </View>
            </View>
          </View>

          {/* Reservation Details */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar" size={24} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Rezervasyon Detayları</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Başlangıç:</Text>
                <Text style={styles.infoValue}>{formatDate(reservation.start_date)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Bitiş:</Text>
                <Text style={styles.infoValue}>{formatDate(reservation.end_date)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Alış Yeri:</Text>
                <Text style={styles.infoValue}>{reservation.pickup_location}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>İade Yeri:</Text>
                <Text style={styles.infoValue}>{reservation.return_location}</Text>
              </View>
              {reservation.notes && (
                <View style={styles.notesRow}>
                  <Text style={styles.infoLabel}>Notlar:</Text>
                  <Text style={styles.notesText}>{reservation.notes}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Toplam Tutar</Text>
            <Text style={styles.priceValue}>
              {reservation.total_amount.toLocaleString('tr-TR')} ₺
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
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
  errorText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  scrollContent: {
    padding: SIZES.md,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.md,
    gap: SIZES.xs,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.md,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  cardContent: {
    padding: SIZES.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: SIZES.sm,
  },
  plateText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  phoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  phoneValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  phoneText: {
    color: COLORS.success,
  },
  addressText: {
    maxWidth: '60%',
  },
  notesRow: {
    paddingVertical: 8,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 4,
    lineHeight: 20,
  },
  priceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: SIZES.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  priceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
  },
});
