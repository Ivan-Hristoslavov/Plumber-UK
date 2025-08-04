# VAT Settings Fixes Summary

## ✅ **ПРОБЛЕМИ ОТКРИТИ И ПОПРАВЕНИ:**

### 1. **Дублиране на useVATSettings Hook**
- **Проблем:** Имаше два различни `useVATSettings` hook-а:
  - `hooks/useVATSettings.ts` (основен)
  - `hooks/useAdminSettings.ts` (дублиран)
- **Решение:** Премахнах дублирания hook от `useAdminSettings.ts`

### 2. **Различни Field Names**
- **Проблем:** Двата hook-а използваха различни имена на полетата:
  - Основен: `registrationNumber`, `companyName`
  - Дублиран: `number`, `name`
- **Решение:** Обновях admin settings да използва правилните field names

### 3. **Несъответствие в JSON Storage**
- **Проблем:** Един hook използваше plain object, другият JSON.stringify
- **Решение:** Обновях основния hook да използва JSON.stringify за консистентност

### 4. **VAT се показваше винаги във фактурите**
- **Проблем:** VAT rate и VAT number се изпращаха винаги, дори когато VAT е disabled
- **Решение:** Добавих проверки за `vatSettings.enabled` във всички места

## ✅ **НАПРАВЕНИ ПРОМЕНИ:**

### 1. **hooks/useAdminSettings.ts**
- Премахнах дублирания `useVATSettings` hook
- Премахнах дублираната `VATSettings` interface

### 2. **app/admin/settings/page.tsx**
- Променях import да използва правилния hook: `@/hooks/useVATSettings`
- Обновях field names: `number` → `registrationNumber`, `name` → `companyName`

### 3. **hooks/useVATSettings.ts**
- Добавих JSON.stringify при запазване на настройките

### 4. **components/CreateInvoiceModal.tsx**
- VAT rate се изпраща като '0' когато VAT е disabled
- VAT number се изпраща като празен string когато VAT е disabled
- VAT информацията се показва в business info само когато е enabled

### 5. **components/EditInvoiceModal.tsx**
- Същите промени като в CreateInvoiceModal

### 6. **app/admin/invoices/page.tsx**
- PDF генериране: VAT секцията се показва само когато VAT е enabled и > 0
- Таблица: VAT информацията се показва само когато VAT е enabled и > 0

## 🎯 **РЕЗУЛТАТ:**

### Когато VAT е **ENABLED**:
- ✅ VAT rate и registration number се показват
- ✅ VAT се изчислява правилно във фактурите
- ✅ VAT информация се показва в PDF-ите
- ✅ VAT информация се показва в таблицата

### Когато VAT е **DISABLED**:
- ✅ VAT rate се изпраща като 0
- ✅ VAT number се изпраща като празен string
- ✅ VAT информация се скрива от business info
- ✅ VAT секция се скрива от PDF-ите
- ✅ VAT информация се скрива от таблицата
- ✅ Само общата сума се показва (без VAT breakdown)

## 🔧 **ТЕСТВАНЕ:**

За да тествате функционалността:

1. **Отидете в Admin → Settings → VAT Settings**
2. **Disabled VAT:**
   - Изключете "Enable VAT on invoices"
   - Запазете настройките
   - Създайте нова фактура → няма да има VAT информация
3. **Enabled VAT:**
   - Включете "Enable VAT on invoices"
   - Въведете VAT rate (напр. 20%)
   - Въведете VAT registration number
   - Запазете настройките
   - Създайте нова фактура → ще има VAT breakdown

## 📋 **ВАЖНИ БЕЛЕЖКИ:**

- VAT настройките се запазват в `admin_settings` таблицата с key `'vatSettings'`
- Всички промени са backward compatible
- Съществуващите фактури няма да бъдат засегнати
- VAT изчисленията работят правилно и в двата режима 