import { CalculatorWorkbench } from "@/components/calculator/CalculatorWorkbench";
const heroStats = [
  {
    value: "-28 dk",
    label: "İşlem süresi",
    detail: "30 dakikadan 2 dakikaya düşen süreç",
  },
  {
    value: "%95",
    label: "Hata azaltma",
    detail: "AI temizleme sayesinde",
  },
  {
    value: "20+",
    label: "Teklif kaynağı",
    detail: "Excel, PDF, e-posta ve daha fazlası",
  },
];

const valueProps = [
  {
    title: "AI Destekli Temizlik",
    description:
      "Gemini 2.5 Flash, kopyalanan teklifleri saniyeler içinde standart TL formatına çevirir ve güven puanı üretir.",
  },
  {
    title: "DSİ Uyumu",
    description:
      "Tort1, σ, C, K ve SD hesaplamaları mevzuattaki formüllere birebir uygun olarak otomatik yapılır.",
  },
  {
    title: "Şeffaf Raporlama",
    description:
      "Hesaplama adımları, kontrol listeleri ve export seçenekleri komisyon ve denetçiler için hazırdır.",
  },
];

const workflow = [
  {
    step: "1",
    title: "Parametre Girişi",
    detail:
      "Yaklaşık maliyet ve beklenen teklif sayısı doğrulamalarla birlikte alınır.",
  },
  {
    step: "2",
    title: "Teklif Yapıştırma",
    detail:
      "Kullanıcı karışık formatlı teklif listesini tek alana yapıştırır, sistem otomatik olarak teklif adedini sayar.",
  },
  {
    step: "3",
    title: "AI Temizleme",
    detail:
      "Gemini, tutarları normalize eder, yazıyla belirtilen rakamları çözümler ve güven skoru üretir.",
  },
  {
    step: "4",
    title: "Validasyon",
    detail:
      "Standart sapma aralığı, aykırı değer uyarıları ve teklif sayısı eşleşmesi kontrol edilir.",
  },
  {
    step: "5",
    title: "Hesaplama",
    detail:
      "Formüllerle Tort1, σ, Tort2, C, K ve SD değerleri hesaplanır, edge-case senaryolar işlenir.",
  },
  {
    step: "6",
    title: "Sunum & Rapor",
    detail:
      "Sonuç kartı, detay tablosu, görselleştirmeler ve PDF/Excel export ile süreç tamamlanır.",
  },
];

const featureGroups = [
  {
    heading: "AI Temizleme Modülü",
    points: [
      "Farklı formatlardan teklifleri tek tıkla normalize eder",
      "<70 güven skorunda satırı vurgular ve manuel düzenleme sunar",
      "Timeout ve hata yönetimi senaryolarıyla kullanıcıyı yönlendirir",
    ],
  },
  {
    heading: "Hesap Motoru",
    points: [
      "DSİ formül mantığını TypeScript ile yeniden üretir",
      "Aykırı değer, sigma=0 ve teklif dışı durumları özel mesajlarla ele alır",
      "Denetlenebilirlik için tüm ara değişkenleri saklar",
    ],
  },
  {
    heading: "Analiz & Export",
    points: [
      "Teklif analizi tablosu, box plot ve bar chart ile görselleştirir",
      "PDF ve Excel çıktıları için şablonlanmış raporlar üretir",
      "JSON export ile diğer sistemlere entegrasyon sağlar",
    ],
  },
];

const architecture = [
  {
    title: "Frontend Katmanı",
    description:
      "React 18, Tailwind 4 ve React Query ile responsive, WCAG 2.1 uyumlu bir arayüz sunar.",
  },
  {
    title: "AI Servisi",
    description:
      "Gemini 2.5 Flash API ile prompt engineering, metin pars etme ve normalizasyon işlemleri yapılır.",
  },
  {
    title: "Hesaplama Servisi",
    description:
      "FastAPI/Express mikro servisleri DSİ formüllerini uygular, validasyon katmanıyla tüm girdileri kontrol eder.",
  },
  {
    title: "Veri Katmanı",
    description:
      "Oturum bazlı saklama, audit log ve Redis cache ile performans ve izlenebilirlik sağlanır.",
  },
];

const metrics = [
  {
    name: "Performans",
    value: "<10 sn",
    description: "20 tekliflik veri seti için AI temizlik SLA",
  },
  {
    name: "Uptime",
    value: "%99.5",
    description: "Bulut altyapısı ve izleme ile yıllık çalışma garantisi",
  },
  {
    name: "Kullanıcı memnuniyeti",
    value: "4.8/5",
    description: "Pilot ekiplerden alınan geri bildirim ortalaması",
  },
  {
    name: "Audit kapsamı",
    value: "Tam",
    description: "Her hesaplama için zaman damgası ve veri izleri",
  },
];

const roadmap = [
  {
    phase: "Faz 2 (3-6 Ay)",
    items: [
      "Toplu ihale hesaplama senaryoları",
      "Kullanıcı hesapları ve yetki yönetimi",
      "Özelleştirilebilir rapor şablonları",
    ],
  },
  {
    phase: "Faz 3 (6-12 Ay)",
    items: [
      "Mobil uygulama (iOS/Android)",
      "Üçüncü parti sistemlere API entegrasyonu",
      "Gelişmiş analitik ve çok dilli destek",
    ],
  },
];

const faqs = [
  {
    question: "AI çıktıları nasıl doğrulanıyor?",
    answer:
      "Her dönüş iki aşamalı validasyondan geçer: Gemini güven skoru ve DSİ formül kontrolü. Düşük güven skorlarında kullanıcıya manuel düzenleme arayüzü açılır.",
  },
  {
    question: "Veriler nerede saklanıyor?",
    answer:
      "Teklif verileri tarayıcı oturumunda tutulur, yalnızca audit loglarında anonimleştirilmiş metrik kayıtları saklanır.",
  },
  {
    question: "Sistemi kurumsal ağlara entegre edebilir miyiz?",
    answer:
      "API-first mimari sayesinde kurum içi entegrasyonlara açık olup, rate limiting ve izleme politikalarıyla güvence altına alınır.",
  },
  {
    question: "Hangi destek hizmetleri sağlanıyor?",
    answer:
      "Onboarding eğitimleri, 7/24 izleme, aylık raporlama ve kritik durumlarda 2 saat içinde yanıt veren destek hattı sağlanır.",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#f8fafc] text-[#0f172a]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1d4ed8] via-[#1e3a8a] to-[#0f172a] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden>
          <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        </div>
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-24 sm:px-10 md:px-16">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-medium">
                DSİ Uyumlu AI Çözümleri
              </span>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                İhale tekliflerini saniyeler içinde temizleyin, DSİ sınır değerini risksiz hesaplayın.
              </h1>
              <p className="text-base leading-relaxed text-white/80 md:text-lg">
                DSİ İhale Aşırı Düşük Teklif Hesaplama Sistemi, Gemini 2.5 Flash destekli veri temizleme ile teklif karmaşasını ortadan kaldırır, hataları %95 azaltır ve tüm hesap adımlarını şeffaflaştırır.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="#calculator"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1e293b] shadow-lg shadow-black/10 transition hover:bg-slate-100"
                >
                  Canlı Demo Akışını Gör
                </a>
                <a
                  href="#architecture"
                  className="inline-flex items-center justify-center rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Teknik Mimariyi İncele
                </a>
              </div>
            </div>
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3 md:max-w-sm md:grid-cols-1">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur"
                >
                  <div className="text-3xl font-semibold">{stat.value}</div>
                  <div className="text-sm font-medium text-white/80">{stat.label}</div>
                  <p className="mt-2 text-xs text-white/70">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur sm:grid-cols-3">
            {valueProps.map((item) => (
              <div key={item.title} className="space-y-2">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-white/75">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CalculatorWorkbench />

      <section id="workflow" className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-10 md:px-16">
        <div className="space-y-6">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-[#0f172a] sm:text-3xl">
              Uçtan uca DSİ süreçleri için tasarlanmış 6 adımlı akış
            </h2>
            <p className="mt-4 text-base text-[#334155]">
              Kullanıcıların teklif verilerini tek bir seferde yapıştırıp doğrulanmış sınır değer çıktısı alabilmesi için her aşamada rehberlik sağlayan modüler bir deneyim.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {workflow.map((item) => (
              <article
                key={item.title}
                className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d4ed8]/10 text-sm font-semibold text-[#1d4ed8]">
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-[#0f172a]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#475569]">
                  {item.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20 sm:px-10 md:px-16">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold text-[#0f172a] sm:text-3xl">
                Görev kritik modüllerle güvenli ve denetlenebilir hesaplama
              </h2>
              <p className="mt-4 text-base text-[#334155]">
                AI temizlikten sınır değer hesaplamasına kadar tüm kritik noktalar için dayanıklı modüller geliştirildi.
              </p>
            </div>
            <div className="rounded-3xl border border-[#cbd5f5] bg-[#eef2ff] px-6 py-4 text-sm text-[#312e81]">
              SD = (K × Tort2) / (C × N) formülü temel alınarak DSİ yönergelerine %100 uyum garanti edilir.
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featureGroups.map((group) => (
              <div key={group.heading} className="rounded-3xl border border-slate-200 bg-slate-50/60 p-6">
                <h3 className="text-lg font-semibold text-[#0f172a]">
                  {group.heading}
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-[#475569]">
                  {group.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-[#1d4ed8]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="architecture"
        className="relative overflow-hidden bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#1d4ed8] text-white"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.35),transparent_60%)]" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-20 sm:px-10 md:px-16">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Ölçeklenebilir ve güvenli mimari
            </h2>
            <p className="mt-4 text-base text-white/80">
              Frontend, AI servisi, hesaplama motoru ve veri katmanı ayrı ayrı ölçeklenerek 1000+ eş zamanlı kullanıcıya hizmet verir, her katmanda izleme ve güvenlik politikaları uygulanır.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {architecture.map((block) => (
              <article
                key={block.title}
                className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md"
              >
                <h3 className="text-lg font-semibold">{block.title}</h3>
                <p className="mt-3 text-sm text-white/80">{block.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-10 md:px-16">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 className="text-2xl font-semibold text-[#0f172a] sm:text-3xl">
              Ölçülebilir başarı metrikleri
            </h2>
            <p className="mt-4 text-base text-[#334155]">
              Performans, süreklilik ve kullanıcı memnuniyeti göstergeleri düzenli olarak izlenir; PostHog ve Sentry entegrasyonlarıyla veri odaklı iyileştirme yapılır.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {metrics.map((metric) => (
                <div
                  key={metric.name}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#6366f1]">
                    {metric.name}
                  </div>
                  <div className="mt-3 text-3xl font-semibold text-[#0f172a]">
                    {metric.value}
                  </div>
                  <p className="mt-3 text-sm text-[#475569]">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>
          <aside className="flex h-full flex-col justify-between gap-6 rounded-3xl bg-gradient-to-br from-[#e0f2fe] to-[#c7d2fe] p-6 text-[#1e293b]">
            <div>
              <h3 className="text-lg font-semibold">Denetim hazır altyapı</h3>
              <p className="mt-3 text-sm leading-relaxed">
                Her hesabın audit logu, zaman damgası, kullanıcı kimliği ve AI yanıt süresi ile kayıt altına alınır. KPİ panelleri, üst yönetim ve denetçilere gerçek zamanlı görünürlük sağlar.
              </p>
            </div>
            <div className="rounded-2xl bg-white/70 p-4 text-sm">
              <p className="font-semibold text-[#1d4ed8]">KVKK ve E-Devlet standartlarıyla uyumlu</p>
              <p className="mt-2 text-[#1e293b]">
                Veri mahremiyeti ve güvenlik, girişten exporta kadar her aşamada politika haline getirildi.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-10 md:px-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-[#0f172a] sm:text-3xl">
              Yol haritası: Kuruluş sonrası genişleme planı
            </h2>
            <p className="mt-4 text-base text-[#334155]">
              Temel modül devreye alındıktan sonra kademeli genişleme ile kurumsal ihtiyaca göre ölçeklenir.
            </p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {roadmap.map((phase) => (
              <div key={phase.phase} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-[#0f172a]">{phase.phase}</h3>
                <ul className="mt-4 space-y-3 text-sm text-[#475569]">
                  {phase.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-[#1d4ed8]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-10 md:px-16">
        <div className="rounded-3xl bg-white p-8 shadow-sm sm:p-12">
          <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-start">
            <div>
              <h2 className="text-2xl font-semibold text-[#0f172a] sm:text-3xl">
                Sık sorulan sorular
              </h2>
              <p className="mt-4 text-base text-[#334155]">
                Güvenlik, doğrulama ve entegrasyon konularında öne çıkan soruların yanıtları.
              </p>
            </div>
            <div className="space-y-6">
              {faqs.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-2xl border border-slate-200 p-5"
                >
                  <summary className="cursor-pointer list-none text-base font-semibold text-[#0f172a]">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-[#475569]">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#1d4ed8] via-[#1e40af] to-[#1e293b] text-white">
        <div className="absolute inset-0 opacity-20" aria-hidden>
          <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute bottom-0 right-10 h-60 w-60 rounded-full bg-cyan-300/30 blur-3xl" />
        </div>
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-6 py-16 text-center sm:px-10 md:px-16">
          <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">
            İhale ekipleriniz için hız, doğruluk ve şeffaflığı birlikte sunuyoruz.
          </h2>
          <p className="max-w-2xl text-base text-white/85">
            Pilot programa katılarak gerçek ihale verileriyle süreci test edin, ekip içi validasyonu 1 hafta içinde tamamlayın.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:projeler@dsi.gov.tr"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1e293b] shadow-lg shadow-black/10 transition hover:bg-slate-100"
            >
              Pilot Başvurusu Yap
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Ürün Turu Planla
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
