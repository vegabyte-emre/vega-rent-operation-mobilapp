import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../src/constants/theme';

export default function NFCScanScreen() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);

  const startScan = async () => {
    // NFC is only available on physical devices with native build
    // For Expo Go, we show a simulation
    
    if (Platform.OS === 'web') {
      Alert.alert('Uyarı', 'NFC özelliği web tarayıcıda desteklenmemektedir.');
      return;
    }

    setIsScanning(true);
    
    // Simulate NFC scan for demo purposes
    setTimeout(() => {
      setIsScanning(false);
      // Simulated TC Kimlik data
      const simulatedData = {
        tcNo: '12345678901',
        fullName: 'AHMET YILMAZ',
        birthDate: '01.01.1985',
        validUntil: '01.01.2030',
        serialNo: 'A12B34567',
      };
      setScannedData(simulatedData);
      Alert.alert(
        'NFC Okuma Simülasyonu',
        'Gerçek NFC okuması için native build gereklidir.\n\nSimþle edilmiş TC Kimlik bilgisi gösterilmektedir.',
        [{ text: 'Tamam' }]
      );
    }, 2000);
  };

  const resetScan = () => {
    setScannedData(null);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'NFC Kimlik Okuma',
          headerTintColor: COLORS.text,
          headerStyle: { backgroundColor: COLORS.surface },
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.content}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={COLORS.info} />
            <Text style={styles.infoText}>
              Müşterinin TC Kimlik Kartını telefonun arkasına yaklaştırarak kimlik
              doğrulaması yapabilirsiniz.
            </Text>
          </View>

          {/* Scan Area */}
          <View style={styles.scanArea}>
            {isScanning ? (
              <View style={styles.scanningContainer}>
                <View style={styles.scanningAnimation}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
                <Text style={styles.scanningText}>Taranıyor...</Text>
                <Text style={styles.scanningSubtext}>Kimlik kartını telefona yaklaştırın</Text>
              </View>
            ) : scannedData ? (
              <View style={styles.resultContainer}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
                </View>
                <Text style={styles.resultTitle}>Kimlik Okundu</Text>
                
                <View style={styles.dataCard}>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>TC Kimlik No:</Text>
                    <Text style={styles.dataValue}>{scannedData.tcNo}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>Ad Soyad:</Text>
                    <Text style={styles.dataValue}>{scannedData.fullName}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>Doğum Tarihi:</Text>
                    <Text style={styles.dataValue}>{scannedData.birthDate}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>Geçerlilik:</Text>
                    <Text style={styles.dataValue}>{scannedData.validUntil}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>Seri No:</Text>
                    <Text style={styles.dataValue}>{scannedData.serialNo}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.readyContainer}>
                <View style={styles.nfcIconContainer}>
                  <Ionicons name="card" size={80} color={COLORS.primary} />
                  <View style={styles.nfcWaves}>
                    <View style={[styles.wave, styles.wave1]} />
                    <View style={[styles.wave, styles.wave2]} />
                    <View style={[styles.wave, styles.wave3]} />
                  </View>
                </View>
                <Text style={styles.readyText}>Taramaya Hazır</Text>
                <Text style={styles.readySubtext}>
                  Başlat butonuna basın ve kimlik kartını telefona yaklaştırın
                </Text>
              </View>
            )}
          </View>

          {/* Warning */}
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={20} color={COLORS.warning} />
            <Text style={styles.warningText}>
              Not: NFC özelliği Expo Go'da çalışmamaktadır. Gerçek kullanım için
              native build (EAS Build) gereklidir.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.footer}>
          {scannedData ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={resetScan}
              >
                <Ionicons name="refresh" size={20} color={COLORS.primary} />
                <Text style={styles.secondaryButtonText}>Tekrar Tara</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => router.back()}
              >
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Onayla</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, isScanning && styles.buttonDisabled]}
              onPress={startScan}
              disabled={isScanning}
            >
              {isScanning ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="scan" size={24} color="#fff" />
                  <Text style={styles.primaryButtonText}>Taramayı Başlat</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SIZES.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.info + '15',
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    gap: SIZES.sm,
    marginBottom: SIZES.lg,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  scanArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
    ...SHADOWS.md,
  },
  scanningContainer: {
    alignItems: 'center',
  },
  scanningAnimation: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  scanningText: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  scanningSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  readyContainer: {
    alignItems: 'center',
  },
  nfcIconContainer: {
    position: 'relative',
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  nfcWaves: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  wave: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
    borderRadius: 100,
  },
  wave1: {
    width: 100,
    height: 100,
    top: 30,
    left: 30,
  },
  wave2: {
    width: 130,
    height: 130,
    top: 15,
    left: 15,
  },
  wave3: {
    width: 160,
    height: 160,
    top: 0,
    left: 0,
  },
  readyText: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  readySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  resultContainer: {
    alignItems: 'center',
    width: '100%',
  },
  successIcon: {
    marginBottom: SIZES.md,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.success,
    marginBottom: SIZES.lg,
  },
  dataCard: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  dataLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.warning + '15',
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    gap: SIZES.sm,
    marginTop: SIZES.lg,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  footer: {
    padding: SIZES.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: SIZES.radius,
    gap: SIZES.xs,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
