# 📚 InFast CRM

**O'quv markazlarni boshqarish uchun to'liq tizim — administratordan tortib, o'qituvchi va talabagacha.**

InFast CRM — o'quv markazlarining kundalik operatsion ishlarini (talabalar bazasi, guruhlar, davomat, to'lovlar, o'qituvchilar) bitta joyda boshqarish uchun yaratilgan platforma. Tizimga qo'shimcha ravishda **Student App** kiradi — talabalar o'z jadvali, davomati va to'lovlarini mobil/veb orqali kuzatib borishlari mumkin.

🟢 **Hozirda 20+ o'quv markaz InFast CRM'dan foydalanmoqda.**

🔗 **Live demo:** [infastacademy.uz](https://infastacademy.uz)

---

## ✨ Asosiy imkoniyatlar

- 🏢 **Ko'p filialli boshqaruv** — bir nechta o'quv markazi/filialni yagona tizimdan boshqarish
- 👨‍🎓 **Talabalar bazasi** — ro'yxatga olish, guruhlarga biriktirish, profil tarixi
- 📅 **Davomat nazorati** — kunlik/oylik davomat statistikasi
- 💰 **To'lovlar va moliya** — to'lov jadvali, qarzdorlik, tushum hisobotlari
- 👩‍🏫 **O'qituvchilar paneli** — dars jadvali, maosh hisob-kitobi
- 📱 **Student App** — talabalar uchun alohida ilova: jadval, davomat, to'lov holati
- 📊 **Dashboard va hisobotlar** — real vaqtda statistik ko'rsatkichlar
- 🔐 **Rol asosidagi kirish (RBAC)** — admin, o'qituvchi, talaba uchun turli huquqlar

---

## 🛠 Texnologiyalar

| Qatlam | Texnologiya |
|---|---|
| **Frontend** | React.js / JavaScript |
| **Backend** | Node.js (Express) |
| **Konteynerizatsiya** | Docker, Docker Compose |
| **Deploy** | Vercel |
| **Versiya nazorati** | Git / GitHub |

> Loyiha monorepo tuzilishida: `backend/` va `frontend/` alohida modul sifatida saqlanadi.

---

## 📁 Loyiha strukturasi

```
infast-crm/
├── backend/          # REST API, biznes-logika, ma'lumotlar bazasi bilan ishlash
├── frontend/          # Admin/o'qituvchi paneli (React)
├── docker-compose.yml # Lokal muhitda backend+frontend+DB'ni birga ishga tushirish
├── vercel.json         # Vercel deploy konfiguratsiyasi
└── .gitignore
```

---

## 🚀 O'rnatish va ishga tushirish

### Talablar
- Node.js `v18+`
- Docker va Docker Compose (ixtiyoriy, lekin tavsiya etiladi)
- npm yoki yarn

### 1. Repozitoriyani klonlash

```bash
git clone https://github.com/Muhammadaziz-Yakubov/infast-crm.git
cd infast-crm
```

### 2. Muhit o'zgaruvchilarini sozlash

`backend/` va `frontend/` papkalarida `.env.example` fayllarini nusxalab, o'z qiymatlaringizni kiriting:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3a. Docker orqali ishga tushirish (tavsiya etiladi)

```bash
docker-compose up --build
```

### 3b. Yoki qo'lda ishga tushirish

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (yangi terminalda)
cd frontend
npm install
npm run dev
```

Loyiha ishga tushgach, brauzerda `http://localhost:3000` (yoki `.env`da ko'rsatilgan port) manzilini oching.

---

## 📱 Student App

Talabalar uchun alohida modul — o'z jadvali, davomat tarixi va to'lov holatini kuzatish imkonini beradi. Batafsil sozlash bo'yicha [Wiki](../../wiki) sahifasiga qarang *(agar mavjud bo'lsa)*.

---

## 🗺 Rejalar (Roadmap)

- [ ] SMS/Telegram bot orqali avtomatik bildirishnomalar
- [ ] Ko'p tilli interfeys (UZ/RU/EN)
- [ ] Mobil ilova (React Native)
- [ ] Batafsil moliyaviy analitika va eksport (Excel/PDF)

---

## 🤝 Hissa qo'shish

Pull requestlar va takliflar mamnuniyat bilan qabul qilinadi! Katta o'zgarishlar uchun avval Issue oching va muhokama qilaylik.

---

## 👤 Muallif

**Muhammadaziz Yakubov**
Full Stack Developer — Infast Uz

- Telegram: [@yakubovdev](https://t.me/yakubovdev)
- Instagram: [@yakubovdev](https://www.instagram.com/yakubovdev)
- LinkedIn: [muhammadazizyakubov](https://www.linkedin.com/in/muhammadazizyakubov)
- YouTube: [@muhammadaziz-yakubov](https://www.youtube.com/@muhammadaziz-yakubov)

---

## 📄 Litsenziya

Ushbu loyiha hozircha maxsus litsenziya ostida emas. Foydalanish yoki hamkorlik bo'yicha savollar uchun yuqoridagi kontaktlar orqali bog'laning.
