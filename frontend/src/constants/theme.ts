export const COLORS = {
  // Vega Operasyon Kurumsal Renk Paleti
  primary: '#0F172A',       // Koyu lacivert - Ana renk
  primaryLight: '#1E40AF',  // Mavi - Vurgu rengi
  primaryDark: '#020617',   // Çok koyu - Derinlik
  secondary: '#475569',     // Gri-mavi - İkincil
  accent: '#3B82F6',        // Parlak mavi - Aksiyon
  
  // Durum renkleri
  success: '#059669',       // Yeşil - Başarı
  warning: '#D97706',       // Turuncu - Uyarı
  danger: '#DC2626',        // Kırmızı - Hata
  info: '#0891B2',          // Cyan - Bilgi
  
  // Arka plan
  background: '#F1F5F9',    // Açık gri arka plan
  surface: '#FFFFFF',       // Beyaz yüzey
  surfaceAlt: '#F8FAFC',    // Alternatif yüzey
  
  // Metin
  text: '#0F172A',          // Koyu metin
  textLight: '#475569',     // Açık metin
  textMuted: '#94A3B8',     // Soluk metin
  textOnPrimary: '#FFFFFF', // Primary üzerinde metin
  
  // Kenarlar
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  // Gradyan başlangıç/bitiş
  gradientStart: '#0F172A',
  gradientEnd: '#1E40AF',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SIZES = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  radius: 12,
  radiusLg: 16,
  radiusSm: 8,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
