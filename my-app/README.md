# 🏗️ DSİ Sınır Değer Hesaplama Sistemi

Modern ve kullanıcı dostu **Türk Kamu İhale Kanunu**'na uygun sınır değer hesaplama uygulaması.

## ✨ Özellikler

- 📊 **Kanun 45.1.1 Uyumlu**: %40-%120 kuralı otomatik uygulanır
- 🤖 **Gemini AI Entegrasyonu**: Teklif metinlerini otomatik normalize eder
- 🎯 **Hassas Hesaplama**: K ve C katsayıları 3 ondalık basamak hassasiyetinde
- 🚫 **Akıllı Filtreleme**: "Geçersiz teklif" satırları otomatik elenir
- 📈 **Görsel Analiz**: İnteraktif grafiklerle teklif dağılımı
- 🌙 **Modern Tasarım**: Temiz ve kullanışlı arayüz

## 🚀 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Testleri çalıştır
npm test

# Production build
npm run build
```

## 🔧 Yapılandırma

`.env` dosyası oluşturun:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## 📐 Hesaplama Formülleri

### DSİ Formülleri (Kanun 45.1.1)

```
Tort1 = Σ(geçerli teklifler) / n
σ = √(Σ(Ti - Tort1)² / (n-1))
Tort2 = Σ(Tort1 ± σ aralığındaki teklifler) / m
C = Tort2 / YM
K = (3.2×C - C² - 0.6) / (C + 1)  [0.60 ≤ C ≤ 1.00]
SD = (K × Tort2) / (C × N)
```

### Önemli Kurallar

- Yaklaşık maliyetin **%40'ının altındaki** teklifler hesaba katılmaz
- Yaklaşık maliyetin **%120'sinin üzerindeki** teklifler hesaba katılmaz
- C < 0.60 ise K = 0.60 (sabit)
- C > 1.00 ise farklı formül uygulanır

## 💡 Kullanım

1. **Yaklaşık Maliyet** girin (TL)
2. **N Katsayısı** seçin (genelde 1.2)
3. **Teklif metinlerini** yapıştırın
4. **Hesapla** butonuna tıklayın

### Desteklenen Teklif Formatları

```
✅ 45.250.000,50 TL
✅ ABC İnşaat: 47.830.000 TL
✅ Kırk sekiz milyon beş yüz bin
✅ Teklif 1 Geçerli teklif 38.700 TL
```

## 🧪 Test

```bash
# Tüm testleri çalıştır
npm test

# Watch modunda test
npm run test:watch

# Coverage raporu
npm run test:coverage
```

## 🛠️ Teknolojiler

- **Next.js 16** - React framework
- **TypeScript** - Tip güvenliği
- **Tailwind CSS v4** - Stil
- **Zustand** - State yönetimi
- **React Query** - Veri yönetimi
- **Gemini AI** - Doğal dil işleme
- **Recharts** - Grafikler
- **Vitest** - Test framework

## 📦 Proje Yapısı

```
src/
├── app/              # Next.js app router
│   ├── api/         # API endpoints
│   └── page.tsx     # Ana sayfa
├── components/      # React bileşenleri
│   └── calculator/  # Hesaplama UI
├── lib/            # İş mantığı
│   ├── calculation.ts  # DSİ formülleri
│   ├── parse.ts       # Metin işleme
│   └── validation.ts  # Form doğrulama
└── styles/         # Global stiller
```

## 📝 Lisans

MIT

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing`)
5. Pull Request açın

## 🐛 Bilinen Sorunlar

- Çok büyük teklif listeleri (>100) için performans optimizasyonu yapılacak
- Mobil cihazlarda grafik görünümü iyileştirilecek

## 📞 Destek

Sorularınız için issue açabilirsiniz.

---

**Not**: Bu uygulama Türk Kamu İhale Kanunu'na uygun olarak geliştirilmiştir. Resmi hesaplamalarda kullanmadan önce sonuçları kontrol ediniz.
