# Karavan Tasarım Stüdyosu

Panelvan karavan dönüşümü için tarayıcıda çalışan **3 boyutlu konfigüratör**.
Müşteri aracını seçer, pencere / kapı / yatak / mutfak / dolap / buzdolabı gibi
modülleri gerçek ölçüleriyle sürükle-bırak yerleştirir, karavanın içinde ve
dışında gezer, anlık fiyat görür ve tasarımını bağlantıyla paylaşır.

## Özellikler

- **15 araç, birebir ölçü:** Fiat Ducato (L2H2/L3H2/L4H3), Peugeot Boxer, Citroën Jumper,
  Ford Transit (L3H2/L4H3), Transit Custom, Mercedes Sprinter (L2H2/L3H2), VW Crafter
  (L3H3/L4H3), VW Transporter T6.1, Renault Master, Iveco Daily. Dış ölçü, dingil,
  yük alanı, davlumbaz arası, sürgülü/arka kapı açıklığı üretici föylerinden alınmıştır
  (`src/data/vehicles.ts`).
- **Prosedürel 3D araç:** Yan siluet ekstrüzyonu, ön cam, kabin, koltuklar, tekerlekler,
  açılır sürgülü ve arka kapılar. Pencereler kaportada **gerçek delik** açar.
- **40+ modül kataloğu** (`src/data/modules.ts`): yatak, mutfak, buzdolabı, dolap,
  duş/tuvalet, oturma, pencereler, tavan fanı/penceresi, güneş paneli, klima, akü,
  ısıtıcı, su tankı, tente, bisiklet taşıyıcı, merdiven, portbagaj…
- **Yerleşim motoru:** zemin / duvar / çatı / dış montaj tipleri, araç sınırına
  sıkıştırma, duvara mıknatıs, ızgaraya oturma, çakışma kontrolü (kırmızı uyarı ve
  geri alma), 90° döndürme, kopyalama, klavye kısayolları.
- **Kamera:** yan / ön / arka / üst / iç plan geçişleri (yumuşak uçuş), çatı ve sağ
  duvar gizleme, röntgen, gece modu, **birinci şahıs yürüyüş** (WASD + fare, mobilde
  joystick + dokunarak bakma, kapılardan giriş-çıkış, eşyalara çarpışma).
- Otomatik kayıt (localStorage), geri al, paylaşım bağlantısı (`#d=…`), ekran
  görüntüsü, JSON dışa aktarma, WhatsApp / e-posta ile teklif talebi.
- Masaüstü ve mobil için uyarlanmış arayüz.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ klasörüne üretim derlemesi
npm run preview
```

## Yayınlama

`.github/workflows/deploy.yml` her push'ta projeyi derleyip **GitHub Pages**'e
yükler. Depo ayarlarında *Settings → Pages → Source: GitHub Actions* seçildikten
sonra site `https://<kullanıcı>.github.io/<depo-adı>/` adresinde yayınlanır.
`vite.config.ts` içindeki `base: './'` sayesinde alt dizinlerde de çalışır;
Vercel / Netlify'a `dist/` klasörü olarak da yüklenebilir.

## Fiyatlar ve veriler

Modül fiyatları ve araç dönüşüm başlangıç bedelleri **örnek** değerlerdir;
`src/data/modules.ts` ve `src/data/vehicles.ts` içinden düzenlenir. Yeni bir modül
eklemek için katalog kaydını ekleyip `src/three/ModuleMeshes.tsx` içinde görselini
tanımlamak yeterlidir.

## Teknoloji

React 19 · TypeScript · Vite · Three.js · @react-three/fiber · @react-three/drei ·
zustand · framer-motion. Harici 3D model/doku dosyası yoktur; her şey kod ile üretilir.

## Proje yapısı

```
src/
  data/        araç ve modül verileri
  store.ts     uygulama durumu (zustand)
  utils/       ölçü hesapları, yerleşim/çakışma, paylaşım kodlama
  three/       3D sahne: Van, modül görselleri, sürükleme, kamera, dokular
  ui/          açılış, araç seçimi, konfigüratör panelleri, joystick
```
