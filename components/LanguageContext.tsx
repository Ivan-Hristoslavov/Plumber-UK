"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'bg';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.gallery': 'Gallery',
    'nav.contact': 'Contact',
    'nav.reviews': 'Reviews',
    
    // Hero Section
    'hero.location': 'Kiten Village, Provadia, Varna Region',
    'hero.title': 'Bulgarian Chiflik',
    'hero.subtitle': 'Traditional Guest House',
    'hero.cta': 'Book Your Stay',
    'hero.description': 'Experience the authentic charm of rural Bulgaria in our traditional guest house',
    
    // About Section
    'about.title': 'About Bulgarian Chiflik',
    'about.subtitle': 'Experience the authentic charm of rural Bulgaria',
    'about.description': 'Our traditional guest house offers a unique blend of authentic Bulgarian architecture and modern comfort. Located in the picturesque village of Kiten, we provide an unforgettable experience of rural Bulgarian life.',
    'about.features': 'Traditional Features',
    'about.modern': 'Modern Comfort',
    'about.hospitality': 'Warm Hospitality',
    'about.location': 'Perfect Location',
    'about.authentic': 'Experience Authentic Bulgarian Hospitality',
    'about.available': 'Available',
    'about.guest.rating': 'Guest Rating',
    'about.happy.guests': 'Happy Guests',
    'about.comfortable.rooms': 'Comfortable Rooms',
    'about.authentic.experience': 'Authentic Experience',
    'about.warm.hospitality': 'Warm Hospitality',
    
    // Gallery Section
    'gallery.title': 'Photo Gallery',
    'gallery.subtitle': 'Discover the beauty of our traditional guest house',
    'gallery.description': 'Discover the beauty and charm of our traditional guest house through our photo collection',
    'gallery.house': 'House',
    'gallery.garden': 'Garden',
    'gallery.food': 'Food',
    'gallery.surroundings': 'Surroundings',
    'gallery.view.more': 'View More Photos',
    
    // Contact Section
    'contact.title': 'Contact Us',
    'contact.subtitle': 'Get in touch with us',
    'contact.get.in.touch': 'Get in Touch',
    'contact.description': "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
    'contact.location': 'Kiten Village, Provadia Municipality, Varna Region, Bulgaria',
    'contact.address': 'Kiten Village, Provadia Municipality, Varna Region, Bulgaria',
    'contact.phone': '+359 888 123 456',
    'contact.email': 'info@bulgarian-chiflik.com',
    'contact.hours': 'Check-in: 14:00 | Check-out: 11:00',
    'contact.form.name': 'Your Name',
    'contact.form.email': 'Your Email',
    'contact.form.phone': 'Phone',
    'contact.form.message': 'Your Message',
    'contact.form.send': 'Send Message',
    'contact.form.name.placeholder': 'Your name',
    'contact.form.email.placeholder': 'your@email.com',
    'contact.form.message.placeholder': 'Tell us about your inquiry or booking request...',
    
    // Reviews Section
    'reviews.title': 'Guest Reviews',
    'reviews.subtitle': 'What our guests say about us',
    'reviews.add': 'Share your experience with our guest house',
    'reviews.name': 'Your name',
    'reviews.rating': 'Rating',
    'reviews.comment': 'Share your experience with our guest house...',
    'reviews.submit': 'Submit Review',
    
    // Footer
    'footer.company': 'Bulgarian Chiflik',
    'footer.description': 'Experience authentic Bulgarian hospitality in our traditional guest house located in the picturesque village of Kiten.',
    'footer.services': 'Quick Links',
    'footer.gallery': 'Gallery',
    'footer.contact': 'Contact',
    'footer.copyright': '© 2024 Bulgarian Chiflik. All rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.newsletter': 'Newsletter',
    'footer.newsletter.description': 'Subscribe to get updates about our guest house and special offers.',
    'footer.newsletter.placeholder': 'Your email address',
    'footer.newsletter.subscribe': 'Subscribe',
    
    // Common
    'common.book': 'Book Now',
    'common.learn': 'Learn More',
    'common.view': 'View More',
    'common.available': 'Available',
    'common.guest.rating': 'Guest Rating',
    'common.happy.guests': 'Happy Guests',
    'common.comfortable.rooms': 'Comfortable Rooms',
    'common.authentic.experience': 'Authentic Experience',
    'common.warm.hospitality': 'Warm Hospitality'
  },
  bg: {
    // Navigation
    'nav.home': 'Начало',
    'nav.about': 'За нас',
    'nav.gallery': 'Галерия',
    'nav.contact': 'Контакти',
    'nav.reviews': 'Отзиви',
    
    // Hero Section
    'hero.location': 'Село Китен, Община Провадия, Варненска област',
    'hero.title': 'Български чифлик',
    'hero.subtitle': 'Традиционна къща за гости',
    'hero.cta': 'Резервирай',
    'hero.description': 'Изживей автентичния чар на селска България в нашата традиционна къща за гости',
    
    // About Section
    'about.title': 'За Български чифлик',
    'about.subtitle': 'Изживей автентичния чар на селска България',
    'about.description': 'Нашата традиционна къща за гости предлага уникална комбинация от автентична българска архитектура и модерен комфорт. Разположена в живописното село Китен, ние осигуряваме незабравимо изживяване на селския български живот.',
    'about.features': 'Традиционни особености',
    'about.modern': 'Модерен комфорт',
    'about.hospitality': 'Топло гостоприемство',
    'about.location': 'Перфектно местоположение',
    'about.authentic': 'Изживей автентично българско гостоприемство',
    'about.available': 'Налична',
    'about.guest.rating': 'Оценка от гости',
    'about.happy.guests': 'Доволни гости',
    'about.comfortable.rooms': 'Уютни стаи',
    'about.authentic.experience': 'Автентично изживяване',
    'about.warm.hospitality': 'Топло гостоприемство',
    
    // Gallery Section
    'gallery.title': 'Фотогалерия',
    'gallery.subtitle': 'Открий красотата на нашата традиционна къща за гости',
    'gallery.description': 'Открий красотата и обаянието на нашата традиционна къща за гости чрез нашата фотоколекция',
    'gallery.house': 'Къща',
    'gallery.garden': 'Градина',
    'gallery.food': 'Храни',
    'gallery.surroundings': 'Околности',
    'gallery.view.more': 'Виж повече снимки',
    
    // Contact Section
    'contact.title': 'Свържете се с нас',
    'contact.subtitle': 'Свържете се с нас',
    'contact.get.in.touch': 'Свържете се с нас',
    'contact.description': 'Бихме се радвали да чуем от вас. Изпратете ни съобщение и ще отговорим възможно най-скоро.',
    'contact.location': 'Село Китен, Община Провадия, Варненска област, България',
    'contact.address': 'Село Китен, Община Провадия, Варненска област, България',
    'contact.phone': '+359 888 123 456',
    'contact.email': 'info@bulgarian-chiflik.com',
    'contact.hours': 'Настаняване: 14:00 | Освобождаване: 11:00',
    'contact.form.name': 'Вашето име',
    'contact.form.email': 'Вашият имейл',
    'contact.form.phone': 'Телефон',
    'contact.form.message': 'Вашето съобщение',
    'contact.form.send': 'Изпрати съобщение',
    'contact.form.name.placeholder': 'Вашето име',
    'contact.form.email.placeholder': 'вашият@имейл.com',
    'contact.form.message.placeholder': 'Разкажете ни за вашата заявка или молба за резервация...',
    
    // Reviews Section
    'reviews.title': 'Отзиви от гости',
    'reviews.subtitle': 'Какво казват нашите гости за нас',
    'reviews.add': 'Споделете вашето изживяване с нашата къща за гости',
    'reviews.name': 'Вашето име',
    'reviews.rating': 'Оценка',
    'reviews.comment': 'Споделете вашето изживяване с нашата къща за гости...',
    'reviews.submit': 'Изпрати отзив',
    
    // Footer
    'footer.company': 'Български чифлик',
    'footer.description': 'Изживей автентично българско гостоприемство в нашата традиционна къща за гости, разположена в живописното село Китен.',
    'footer.services': 'Бързи връзки',
    'footer.gallery': 'Галерия',
    'footer.contact': 'Контакти',
    'footer.copyright': '© 2024 Български чифлик. Всички права запазени.',
    'footer.privacy': 'Политика за поверителност',
    'footer.terms': 'Условия за ползване',
    'footer.newsletter': 'Бюлетин',
    'footer.newsletter.description': 'Абонирайте се за актуализации за нашата къща за гости и специални предложения.',
    'footer.newsletter.placeholder': 'Вашият имейл адрес',
    'footer.newsletter.subscribe': 'Абонирай се',
    
    // Common
    'common.book': 'Резервирай сега',
    'common.learn': 'Научи повече',
    'common.view': 'Виж повече',
    'common.available': 'Налична',
    'common.guest.rating': 'Оценка от гости',
    'common.happy.guests': 'Доволни гости',
    'common.comfortable.rooms': 'Уютни стаи',
    'common.authentic.experience': 'Автентично изживяване',
    'common.warm.hospitality': 'Топло гостоприемство'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 