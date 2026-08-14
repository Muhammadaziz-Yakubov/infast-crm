export const STATS_DATA = [
  { value: 100, suffix: "+", label: "O‘quvchi" },
  { value: 10, suffix: "+", label: "Kurs" },
  { value: 5, suffix: "+", label: "IT yo‘nalish" },
  { value: 1, suffix: "+", label: "Yil tajriba" },
];

export const COURSES_DATA = [
  {
    id: "frontend",
    title: "Frontend Development",
    iconName: "Code2",
    badge: "Ommabop",
    duration: "9 oy",
    difficulty: "Boshlang'ich → Pro",
    description: "Zamonaviy web-interfeyslar, interaktiv ilovalar va foydalanuvchi tajribasini mukammal yaratishni o'rganasiz.",
    tools: ["HTML5 / CSS3", "JavaScript ES6+", "React.js", "Next.js", "Tailwind CSS", "TypeScript", "Git"],
    details: [
      "HTML5, CSS3, Flexbox & Grid arxitekturasi",
      "JavaScript chuqur o'rganish va asinxron dasturlash",
      "React.js eko-tizimi (Hooks, Context, Custom Hooks)",
      "Next.js App Router, SSR, SSG va SEO optimizatsiyasi",
      "TypeScript bilan xavfsiz kod yozish",
      "Real-world API integratsiyalari va loyihalarni deploy qilish"
    ]
  },
  {
    id: "backend",
    title: "Backend Development",
    iconName: "Server",
    badge: "Talab yuqori",
    duration: "6 oy",
    difficulty: "O'rta → Pro",
    description: "Yuqori yuklamali server arxitekturalari, ma'lumotlar bazasi va xavfsiz backend tizimlarni barpo eting.",
    tools: ["Node.js", "Express.js", "PostgreSQL", "MongoDB", "REST API", "Docker", "Redis"],
    details: [
      "Node.js runtime va Express.js framework",
      "Relatsion (PostgreSQL) va Hujjatli (MongoDB) ma'lumotlar bazalari",
      "Authentication & Authorization (JWT, OAuth2, Session)",
      "RESTful API & GraphQL arxitekturalari",
      "Docker va microservice asoslari",
      "Server deployment va CI/CD borish jarayoni"
    ]
  },
  {
    id: "mobile",
    title: "Mobile Development",
    iconName: "Smartphone",
    badge: "Istiqbolli",
    duration: "7 oy",
    difficulty: "Boshlang'ich → Pro",
    description: "iOS va Android platformalari uchun yagona kod bazasida cross-platform mobil ilovalar yarating.",
    tools: ["Flutter", "Dart", "React Native", "Firebase", "App Store / Play Market"],
    details: [
      "Dart tili va Flutter frameworki",
      "Davlat boshqaruvi (State Management: Provider, Bloc)",
      "Native funksiyalar bilan ishlash (Camera, GPS, Push Notifications)",
      "Backend va API arxitekturalari bilan ulanish",
      "App Store va Google Play marketga chiqarish"
    ]
  },
  {
    id: "fullstack",
    title: "Full-Stack Development",
    iconName: "Layers",
    badge: "Maksimal tajriba",
    duration: "12 oy",
    difficulty: "Mukammal",
    description: "Frontend va Backend texnologiyalarini teng egallab, to'liq IT loyihalarni mustaqil ishlab chiqish imkoniyati.",
    tools: ["React.js", "Next.js", "Node.js", "PostgreSQL", "System Design", "AWS"],
    details: [
      "Frontend va Backend arxitekturalarining to'liq ulanishi",
      "Kattalashuvchan (Scalable) loyihalar arxitekturasi",
      "Database Optimization va Caching (Redis)",
      "Real startup va e-commerce tizimlarini yaratish",
      "Jamoaviy Agile/Scrum metodologiyasida ishlash"
    ]
  },
  {
    id: "computer-literacy",
    title: "Computer Literacy",
    iconName: "Laptop",
    badge: "Asosiy",
    duration: "2 oy",
    difficulty: "Boshlang'ich",
    description: "Kompyuter va raqamli savodxonlikning eng muhim asoslarini noldan mukammal egallang.",
    tools: ["Windows / macOS", "MS Office", "Google Docs", "Cyber Security", "Internet"],
    details: [
      "Operatsion tizimlar va kompyuter tuzilishi",
      "Microsoft Office (Word, Excel, PowerPoint) professional darajada",
      "Google Workspace & Cloud xizmatlaridan foydalanish",
      "Kiberxavfsizlik va axborot daxlsizligi asoslari",
      "Professional tez yozuv va internet qidiruv texnikalari"
    ]
  },
  {
    id: "ai",
    title: "AI / Artificial Intelligence",
    iconName: "Cpu",
    badge: "Kelajak kasbi",
    duration: "8 oy",
    difficulty: "O'rta → Pro",
    description: "Sun'iy intellekt, Machine Learning va Prompt Engineering sohasini zamonaviy instrumentlar bilan o'rganing.",
    tools: ["Python", "OpenAI API", "PyTorch / TensorFlow", "Prompt Engineering", "Data Analysis"],
    details: [
      "Python tili va Data Structures",
      "Machine Learning va Neyron Tarmoqlar nazariyasi va amaliyoti",
      "OpenAI API, LLM modellarini loyihalarga integratsiya qilish",
      "Custom AI chatbotlar va Avtomatlashtirish agentlari yaratish",
      "Data Analysis (Pandas, NumPy, Matplotlib)"
    ]
  }
];

export const WHY_INFAST_FEATURES = [
  {
    number: "01",
    title: "Amaliy ta'lim",
    description: "Faqat quruq nazariya emas. Har bir mavzu hayotiy va amaliy loyihalar orqali o‘rganiladi va mustahkamlanadi."
  },
  {
    number: "02",
    title: "Real loyihalar",
    description: "O‘quvchilar kurs davomida o'z portfolio'lari uchun haqiqiy ishlab chiqarish darajasidagi IT loyihalarni yaratadilar."
  },
  {
    number: "03",
    title: "Mentorlar",
    description: "Soha bo'yicha tajribali senior mentorlar va instruktorlar bilan doimiy aloqa, code review va amaliy feedback."
  },
  {
    number: "04",
    title: "Zamonaviy muhit",
    description: "Haqiqiy IT kompaniya va kovorking atmosfera muhitida o‘rganish, tajriba qilish hamda jamoaviy rivojlanish."
  }
];

export const TIMELINE_STEPS = [
  {
    step: "01",
    title: "Boshlaysan",
    desc: "Ariza topshirasan va bilim darajangga mos yo'nalish hamda guruhni tanlaysan."
  },
  {
    step: "02",
    title: "O‘rganasan",
    desc: "Taqdim etilgan eng so'nggi zamonaviy IT va dasturlash darsliklarini instruktor bilan o'zlashtirasan."
  },
  {
    step: "03",
    title: "Amalda qo‘llaysan",
    desc: "Har bir mavzu bo'yicha amaliy topshiriqlar bajarib, darsdagi kodingni mustahkamlab borasan."
  },
  {
    step: "04",
    title: "Loyiha yaratasan",
    desc: "Mustaqil va jamoaviy real startap hamda web/mobile mahsulotlar barpo etasan."
  },
  {
    step: "05",
    title: "Portfolio yig‘asan",
    desc: "GitHub va Figma parvarishida professional portfolio yaratib, sertifikatga ega bo'lasan."
  },
  {
    step: "06",
    title: "Keyingi bosqichga o‘tasan",
    desc: "HR va mentorlar ko'magida rezyume tayyorlab, mahalliy va xalqaro IT kompaniyalarga ishga yozilasan."
  }
];

export const MENTORS_DATA = [
  {
    name: "Muhammadaziz Yakubov",
    role: "Asoschi & Lead Tech Mentor",
    spec: "Full-Stack & System Architecture",
    image: "/src/muhammadaziz.jpg",
    fallbackText: "MY",
    bio: "Ko'p yillik amaliy tajribaga ega dasturchi va InFast ekotizimi muallifi. Yuzlab yoshlarga IT olamiga yo'l ochgan.",
    socials: {
      telegram: "https://t.me/yakubovdev",
      linkedin: "#",
      github: "#"
    }
  },
  {
    name: "Sardorbek Olimov",
    role: "Senior Frontend Mentor",
    spec: "React, Next.js & UI Engineering",
    image: null,
    fallbackText: "SO",
    bio: "Katta hajmga ega web tizimlar yaratish bo'yicha ekspert. Clean Code va UI/UX tamoyillari targ'ibotchisi.",
    socials: {
      telegram: "#",
      github: "#"
    }
  }
];

export const STUDENT_RESULTS = [
  {
    id: 1,
    title: "CRM & Student Platform",
    category: "Full-Stack Project",
    student: "Guruh Bitiruvchilari",
    description: "Akademiya o'quv jarayonini, davomat, coins va topshiriqlarni avtomatlashtiruvchi raqamli platforma.",
    metrics: "100+ faol foydalanuvchi",
    tag: "Real Startup"
  },
  {
    id: 2,
    title: "Logistika & Delivery App",
    category: "Mobile App (Flutter)",
    student: "Jahongir A.",
    description: "Kuryerlar va jo'natmalarni real vaqt rejimida kuzatish imkonini beruvchi cross-platform ilova.",
    metrics: "Play Market Live",
    tag: "Mobile App"
  },
  {
    id: 3,
    title: "Smart E-Commerce Hub",
    category: "Frontend Next.js",
    student: "Malika K.",
    description: "Animatsiyali zamonaviy onlayn do'kon platformasi va to'lov tizimlari integratsiyasi.",
    metrics: "Speed 99/100",
    tag: "Web Platform"
  },
  {
    id: 4,
    title: "AI Medical Assistant",
    category: "Python & OpenAI",
    student: "Davron T.",
    description: "Tibbiy ma'lumotlarni tahlil qiluvchi va dastlabki tavsiyalar beruvchi aqlli AI chatbot.",
    metrics: "AI Bot",
    tag: "AI Project"
  }
];

export const TESTIMONIALS_DATA = [
  {
    id: 1,
    name: "Bekzod Rahimov",
    course: "Frontend Development bitiruvchisi",
    review: "InFast IT-Academy ta'lim tizimi tubdan farq qiladi. Nazariya bilan cheklanib qolmay, ilk haftadanoq real kod yozishni boshladik. Hozirda IT kompaniyada kichik mutaxassis bo'lib ishlamoqdaman.",
    rating: 5
  },
  {
    id: 2,
    name: "Sevara Alimova",
    course: "Full-Stack Development talabasi",
    review: "Mentorlarimiz har bir o'quvchining tushunish darajasiga alohida e'tibor berishadi. Muhit shunchalik motivatsiyaga boyki, darsdan keyin ham akademiyada qolib loyiha ustida ishlardik.",
    rating: 5
  },
  {
    id: 3,
    name: "Shaxzod Tursunov",
    course: "Backend (Node.js) bitiruvchisi",
    review: "Akademiyadagi Student App platformasi o'quvchida doimiy raqobat va qiziqish uyg'otadi. Coin yutib sovg'alar olish ham dars o'zlashtirishni sezilarli oshirdi.",
    rating: 5
  }
];

export const FAQ_DATA = [
  {
    question: "Kurslar kimlar uchun?",
    answer: "InFast IT-Academy kurslari IT sohasini noldan boshlamoqchi bo'lgan havaskorlar, bilmini oshirmoqchi bo'lgan talabalar hamda yangi zamonaviy kasb egallashni maqsad qilgan barcha uchun mo'ljallangan. Maxsus matematik yoki dasturlash tajribasi talab etilmaydi."
  },
  {
    question: "Darslar qanday o'tiladi?",
    answer: "Darslar interaktiv tarzda offline (va online) shaklda o'tiladi. Mashg'ulotlar nazariy tushuntirish va bevosita 80% amaliyotdan iborat. Har bir o'quvchiga mentorlar va tutorlar doimiy yordam berishadi."
  },
  {
    question: "Kurs qancha davom etadi?",
    answer: "Kurslar davomiyligi tanlangan yo'nalishga bog'liq. Kompyuter savodxonligi 2 oy, AI kursi 6 oy, Mobile 7 oy, Frontend va Backend 8-9 oy, Full-stack kursi esa 10 oy davom etadi."
  },
  {
    question: "Uyga vazifalar beriladimi?",
    answer: "Albatta. Har bir darsdan so'ng tushunchalarni mustahkamlash uchun amaliy topshiriqlar va minikodlar beriladi. Barcha vazifalar shaxsiy platforma (Student App) orqali topshiriladi va tekshiriladi."
  },
  {
    question: "Portfolio yaratamizmi?",
    answer: "Ha! Har bir bitiruvchimiz kurs davomida 3 tadan 5 tagacha real loyihalarni yaratib, o'zining GitHub va portfoliolarni shakllantiradi. Bu sizga ish beruvchilar oldida katta ustunlik beradi."
  },
  {
    question: "Kursga qanday yozilish mumkin?",
    answer: "Saytimizdagi 'Kursga yozilish' tugmasini bosib ismingiz va telefon raqamingizni qoldiring. Menejerlarimiz tez orada siz bilan bog'lanib, bepul sinov darsiga taklif etishadi."
  },
  {
    question: "Filiallar qayerda?",
    answer: "Bosh filialimiz Buloqboshi tumanida zamonaviy jihozlangan bino 3-qavatida joylashgan. Shuningdek Toshkent, Farg'ona filiallarimiz va masofaviy Online platformamiz orqali ta'lim olishingiz mumkin."
  }
];
