# Vega Operasyon - Araç Kiralama Personel Uygulaması

Rent-a-car firması personelleri için saha operasyon uygulaması.

## 🚀 Özellikler

- **JWT Kimlik Doğrulama** - Güvenli giriş sistemi
- **Dashboard** - Günlük teslim/iade takibi
- **NFC Kimlik Okuma** - TC Kimlik doğrulama (Native build gerekli)
- **Araç Teslim** - Fotoğraf, km, yakıt, KVKK onayı
- **Araç İade** - Hasar kontrolü, ek masraflar
- **Rezervasyon Listesi** - Filtreleme ve arama
- **GPS Takip** - Araç konumları (API bağlantılı)

## 📱 Teknolojiler

- Expo SDK 54
- React Native 0.81
- Expo Router v6
- TypeScript
- Axios

## 🔧 Kurulum

```bash
# Bağımlılıkları yükle
cd frontend
yarn install

# Geliştirme sunucusunu başlat
yarn start
```

## 🏗️ EAS Build (APK Oluşturma)

### Ön Gereksinimler

1. **EAS CLI yükleyin:**
```bash
npm install -g eas-cli
```

2. **Expo hesabına giriş yapın:**
```bash
eas login
```

3. **Keystore oluşturun (credentials.json için):**
```bash
keytool -genkeypair -v -keystore keystore.jks -alias key0 -keyalg RSA -keysize 2048 -validity 10000 -storepass vegarent123 -keypass vegarent123 -dname "CN=Vega Rent A Car, OU=Mobile, O=Vega, L=Istanbul, ST=Istanbul, C=TR"
```

4. **keystore.jks dosyasını frontend/ klasörüne kopyalayın**

### Build Komutları

```bash
# Preview APK (test için)
eas build --platform android --profile preview

# Production AAB (Play Store için)
eas build --platform android --profile production

# iOS Simulator Build
eas build --platform ios --profile preview
```

## 📁 Proje Yapısı

```
frontend/
├── app/                    # Expo Router sayfaları
│   ├── (auth)/            # Kimlik doğrulama ekranları
│   ├── (tabs)/            # Tab navigasyon ekranları
│   ├── delivery/          # Araç teslim ekranı
│   ├── return/            # Araç iade ekranı
│   └── reservation/       # Rezervasyon detayı
├── src/
│   ├── context/           # React Context
│   ├── services/          # API servisleri
│   ├── constants/         # Tema ve sabitler
│   └── types/             # TypeScript tipleri
├── assets/                # Görseller ve fontlar
├── app.config.js          # Expo konfigürasyonu
├── eas.json               # EAS Build konfigürasyonu
└── credentials.json       # Android signing bilgileri
```

## 🔐 API Yapılandırması

API URL'i `app.config.js` içinde veya environment variable olarak ayarlanabilir:

```bash
# .env dosyasında
API_URL=https://your-api-url.com/api
COMPANY_NAME=Şirket Adı
PACKAGE_NAME=com.yourcompany.app
```

## 📋 Mevcut API Endpoints

```
POST   /api/auth/login      - Kullanıcı girişi
GET    /api/reservations    - Rezervasyon listesi
GET    /api/reservations/:id - Rezervasyon detayı
POST   /api/deliveries      - Araç teslim kaydı
POST   /api/returns         - Araç iade kaydı
GET    /api/vehicles        - Araç listesi
GET    /api/gps/vehicles    - GPS konumları
```

## 🎨 Tema

Kurumsal mavi tonları:
- Primary: `#0F172A` (Koyu lacivert)
- Accent: `#3B82F6` (Mavi)
- Background: `#F1F5F9` (Açık gri)

## 📄 Lisans

© 2024 Vega Rent A Car. Tüm hakları saklıdır.
