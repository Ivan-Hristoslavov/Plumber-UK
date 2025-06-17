# FixMyLeak - Plumber Booking System

Професионална система за резервация на водопроводни услуги с административен панел.

## 🚀 Бърз старт

### 1. Клониране на проекта
```bash
git clone <repository-url>
cd Plumbe-2
```

### 2. Инсталиране на зависимости
```bash
# Основни зависимости
npm install

# UI зависимости
cd ui
npm install
cd ..
```

### 3. Настройка на Environment Variables

Създайте файл `ui/.env.local` и копирайте следното съдържание:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Admin Credentials
ADMIN_EMAIL=admin@fixmyleak.com
ADMIN_PASSWORD=your-secure-password-here
ADMIN_NAME=Your Full Name
```

**⚠️ ВАЖНО:** Заменете следните стойности със собствените си:
- `your-project-ref` - вашият Supabase project reference
- `your-anon-key-here` - вашият Supabase anon key
- `your-secure-password-here` - сигурна парола за админ панела
- `Your Full Name` - вашето име

### 4. Настройка на Supabase

```bash
# Влизане в Supabase CLI
npx supabase login

# Свързване към проекта
cd supabase
npx supabase link --project-ref your-project-ref

# Прилагане на миграциите
npx supabase db push
```

### 5. Инициализация на админ профила

```bash
# Създаване на админ потребител с хеширана парола
node scripts/init-admin.js
```

### 6. Стартиране на проекта

```bash
cd ui
npm run dev
```

Проектът ще бъде достъпен на: `http://localhost:3000`

## 🔐 Административен панел

### Достъп
- URL: `http://localhost:3000/admin/login`
- Email: стойността от `ADMIN_EMAIL` в `.env.local`
- Password: стойността от `ADMIN_PASSWORD` в `.env.local`

### Функционалности
- 📊 **Dashboard** - реални статистики, recent activity, upcoming bookings
- 📅 **Календар** - визуализация на резервации по дати
- 👥 **Клиенти** - управление на индивидуални и корпоративни клиенти
- 📋 **Резервации** - пълно CRUD управление с филтри и търсене
- 💰 **Плащания** - проследяване на плащания с различни методи
- 🧾 **Фактури** - генериране на UK-compliant фактури с автоматична нумерация
- 🏖️ **Почивни дни** - управление на работни дни и банери
- ⚙️ **Настройки** - бизнес информация, цени, работно време
- 👤 **Профил** - админ профил с хеширани пароли

## 🛠️ Технологии

- **Frontend:** Next.js 15, React, TypeScript
- **Styling:** Tailwind CSS, DaisyUI
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Cookie-based sessions
- **Password Security:** bcrypt hashing

## 📁 Структура на проекта

```
Plumbe-2/
├── ui/                     # Next.js приложение
│   ├── app/               # App Router страnici
│   ├── components/        # React компоненти
│   ├── lib/              # Utility функции
│   └── .env.local        # Environment variables
├── supabase/             # Supabase конфигурация
│   └── migrations/       # Database миграции
├── scripts/              # Utility скриптове
└── database/            # Database схема
```

## 🔧 Полезни команди

```bash
# Стартиране на dev сървъра
cd ui && npm run dev

# Създаване на нова миграция
cd supabase && npx supabase db diff -f new_migration_name

# Прилагане на миграции
cd supabase && npx supabase db push

# Рестартиране на админ профила
node scripts/init-admin.js

# Проверка на Supabase статус
cd supabase && npx supabase status
```

## 🔒 Сигурност

- Паролите се хешират с bcrypt
- Административният панел е защитен с middleware
- Environment variables за чувствителни данни
- Row Level Security в Supabase

## 📞 Поддръжка

За въпроси и поддръжка, моля свържете се с разработчика.

---

**Изградено с ❤️ за FixMyLeak**
