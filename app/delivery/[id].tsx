import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { reservationService, deliveryService } from '../../src/services/api';
import { COLORS, SIZES, SHADOWS } from '../../src/constants/theme';
import { Reservation } from '../../src/types';

export default function DeliveryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [kmReading, setKmReading] = useState('');
  const [fuelLevel, setFuelLevel] = useState(100);
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [kvkkConsent, setKvkkConsent] = useState(false);

  useEffect(() => {
    loadReservation();
  }, [id]);

  const loadReservation = async () => {
    try {
      const data = await reservationService.getById(id!);
      setReservation(data);
      if (data.vehicle?.mileage) {
        setKmReading(data.vehicle.mileage.toString());
      }
    } catch (error) {
      console.error('Error loading reservation:', error);
      Alert.alert('Hata', 'Rezervasyon yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPhotos([...photos, `data:image/jpeg;base64,${result.assets[0].base64}`]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Uyarı', 'Kamera izni gereklidir');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPhotos([...photos, `data:image/jpeg;base64,${result.assets[0].base64}`]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!kmReading) {
      Alert.alert('Hata', 'Kilometre bilgisi zorunludur');
      return;
    }
    if (photos.length === 0) {
      Alert.alert('Hata', 'En az bir fotoğraf çekilmelidir');
      return;
    }
    if (!kvkkConsent) {
      Alert.alert('Hata', 'KVKK onayı zorunludur');
      return;
    }

    setIsSubmitting(true);
    try {
      await deliveryService.create({
        reservation_id: id!,
        km_reading: parseInt(kmReading),
        fuel_level: fuelLevel,
        photos: photos,
        notes: notes,
        kvkk_consent: kvkkConsent,
      });
      Alert.alert('Başarılı', 'Araç teslimi tamamlandı', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error submitting delivery:', error);
      Alert.alert(
        'Hata',
        error.response?.data?.detail || 'Teslim işlemi başarısız'
      );
    } finally {
      setIsSubmitting(false);
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
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Araç Teslimi',
          headerTintColor: COLORS.text,
          headerStyle: { backgroundColor: COLORS.surface },
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Vehicle Info */}
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="car" size={24} color={COLORS.primary} />
                <Text style={styles.infoTitle}>Araç Bilgileri</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Araç:</Text>
                <Text style={styles.infoValue}>
                  {reservation?.vehicle?.brand} {reservation?.vehicle?.model}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Plaka:</Text>
                <Text style={[styles.infoValue, styles.plateText]}>
                  {reservation?.vehicle?.plate}
                </Text>
              </View>
            </View>

            {/* Customer Info */}
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="person" size={24} color={COLORS.primary} />
                <Text style={styles.infoTitle}>Müşteri Bilgileri</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ad Soyad:</Text>
                <Text style={styles.infoValue}>{reservation?.customer?.full_name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Telefon:</Text>
                <Text style={styles.infoValue}>{reservation?.customer?.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>TC No:</Text>
                <Text style={styles.infoValue}>{reservation?.customer?.tc_no}</Text>
              </View>
            </View>

            {/* Km Reading */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Kilometre</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="speedometer-outline" size={20} color={COLORS.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="Kilometre giriniz"
                  placeholderTextColor={COLORS.textMuted}
                  value={kmReading}
                  onChangeText={setKmReading}
                  keyboardType="numeric"
                />
                <Text style={styles.inputSuffix}>km</Text>
              </View>
            </View>

            {/* Fuel Level */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Yakıt Seviyesi: %{fuelLevel}</Text>
              <View style={styles.fuelContainer}>
                {[25, 50, 75, 100].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.fuelButton,
                      fuelLevel === level && styles.fuelButtonActive,
                    ]}
                    onPress={() => setFuelLevel(level)}
                  >
                    <Ionicons
                      name={level <= 25 ? 'battery-dead' : level <= 50 ? 'battery-half' : 'battery-full'}
                      size={20}
                      color={fuelLevel === level ? '#fff' : COLORS.textLight}
                    />
                    <Text
                      style={[
                        styles.fuelText,
                        fuelLevel === level && styles.fuelTextActive,
                      ]}
                    >
                      %{level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Photos */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Fotoğraflar ({photos.length})</Text>
              <View style={styles.photosContainer}>
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoItem}>
                    <Image source={{ uri: photo }} style={styles.photoImage} />
                    <TouchableOpacity
                      style={styles.photoRemove}
                      onPress={() => removePhoto(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.photoButtons}>
                  <TouchableOpacity style={styles.addPhotoButton} onPress={takePhoto}>
                    <Ionicons name="camera" size={24} color={COLORS.primary} />
                    <Text style={styles.addPhotoText}>Fotoğraf Çek</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                    <Ionicons name="images" size={24} color={COLORS.primary} />
                    <Text style={styles.addPhotoText}>Galeriden Seç</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Notes */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Notlar</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Ek notlar..."
                placeholderTextColor={COLORS.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* KVKK Consent */}
            <View style={styles.kvkkContainer}>
              <Switch
                value={kvkkConsent}
                onValueChange={setKvkkConsent}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
                thumbColor={kvkkConsent ? COLORS.primary : COLORS.textMuted}
              />
              <View style={styles.kvkkTextContainer}>
                <Text style={styles.kvkkText}>
                  Müşteri, kişisel verilerinin işlenmesine ilişkin KVKK aydınlatma metnini
                  okuduğunu ve kabul ettiğini beyan eder.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!kvkkConsent || photos.length === 0) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting || !kvkkConsent || photos.length === 0}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  <Text style={styles.submitButtonText}>Teslimi Onayla</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  scrollContent: {
    padding: SIZES.md,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.sm,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
    paddingBottom: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  plateText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  inputSection: {
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: SIZES.sm,
  },
  inputSuffix: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  fuelContainer: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  fuelButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: SIZES.sm,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  fuelButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  fuelText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  fuelTextActive: {
    color: '#fff',
  },
  photosContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    ...SHADOWS.sm,
  },
  photoItem: {
    position: 'relative',
    marginBottom: SIZES.sm,
  },
  photoImage: {
    width: '100%',
    height: 150,
    borderRadius: SIZES.radiusSm,
  },
  photoRemove: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  addPhotoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.md,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    gap: SIZES.xs,
  },
  addPhotoText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  textArea: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  kvkkContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    gap: SIZES.sm,
    marginBottom: SIZES.xl,
    ...SHADOWS.sm,
  },
  kvkkTextContainer: {
    flex: 1,
  },
  kvkkText: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  footer: {
    padding: SIZES.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    height: 56,
    borderRadius: SIZES.radius,
    gap: SIZES.xs,
    ...SHADOWS.md,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
