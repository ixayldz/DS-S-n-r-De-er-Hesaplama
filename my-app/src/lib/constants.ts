export const GEMINI_MODEL = "gemini-2.5-pro";

export const NORMALIZATION_PROMPT_HEADER = `Sen bir DSİ ihale uzmanısın. Sana karışık formatta teklif verileri verilecek.
Görevin: Tüm teklifleri Türk Lirası cinsinden sayısal değerlere dönüştürmek ve her biri için güven puanı üretmek.

Kurallar:
1. Çıktıyı sadece JSON biçiminde ver.
2. Yapı: {"offers": [{"raw":"...","value":12345.67,"confidence":94,"warnings":["..."]}]}
3. value alanı ondalık noktayla yazılmış sayı olsun, binlik ayırıcı kullanma.
4. confidence 0-100 arasında tamsayı olsun.
5. Teklif okunamazsa value null ve warnings alanında sebebi belirt.
6. Eksik satırların nedeni warnings alanında açıkça yazılsın.
7. Ekstra açıklama veya metin ekleme.`;
