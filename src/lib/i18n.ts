'use client';

import { useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

export const translations = {
  en: {
    // Top banner
    adultNotice: '18+ ONLY: Strict Adult Age & Government ID Verification Mandate • 10% Transparent Platform Commission',
    howItWorks: 'How It Works',
    safetyCode: 'Trust & Safety Code',
    support: 'Support & Disputes',
    messages: 'Messages',
    citySelector: 'Major Indian Cities',
    exploreSwipe: 'Explore & Swipe',
    cityGuides: 'City Guides',
    registerCompanionCTA: 'Register as Companion',
    
    // Hero
    heroBadge: 'All-India Adult Companion Discovery & Booking Marketplace',
    heroTitle: 'Sophisticated Companionship,',
    heroTitleHighlight: 'Verified Across India.',
    heroSub: 'Curated dining, art galas, literary discussions, and travel companionship for eligible adults. 100% ID-verified adults, transparent 10% platform commission, and fair refund protections.',

    // Entry Options
    optionA_Badge: 'Option A • For Eligible Adults',
    optionA_Title: 'Register as a Companion',
    optionA_Desc: 'Join our curated network of cultured companions across India. Private government ID verification, choose your supported cities, set your hourly rates, manage your availability, and retain 90% of your earnings with direct payouts.',
    optionA_Btn: 'Start Companion Registration (18+)',

    optionB_Badge: 'Option B • For Discerning Guests',
    optionB_Title: 'Explore and Book',
    optionB_Desc: 'Select your city, discover verified adult companions, swipe through profile cards, view transparent pricing, and submit booking requests with escrow payment protection and replacement booking credits.',
    optionB_Btn: 'Explore Profiles & Swipe Deck',

    // Search
    searchPlaceholder: 'Search by companion name, interest, language (e.g., Hindi, English, Art, Dining)...',
    allStates: 'All Indian States',
    allCities: 'All Cities',
    applyFilters: 'Apply Filters',
    clearFilters: 'Clear Filters',
    resultsFound: 'Verified Companions Found Across India',

    // Booking & Trust
    bookNow: 'Book Companion',
    skip: 'Skip',
    favorite: 'Save to Favorites',
    undo: 'Undo',
    adultVerified: '100% ID Verified Adult',
    commissionLabel: '10% Transparent Commission Policy',
  },
  hi: {
    // Top banner
    adultNotice: 'केवल 18+: सख्त वयस्क आयु व सरकारी पहचान सत्यापन अधिदेश • 10% पारदर्शी प्लेटफ़ॉर्म कमीशन',
    howItWorks: 'यह कैसे काम करता है',
    safetyCode: 'सुरक्षा और गोपनीयता नियम',
    support: 'सहायता एवं विवाद केंद्र',
    messages: 'संदेश',
    citySelector: 'प्रमुख भारतीय शहर',
    exploreSwipe: 'स्वाइप व अन्वेषण',
    cityGuides: 'शहर मार्गदर्शिका',
    registerCompanionCTA: 'साथी (Companion) के रूप में जुड़ें',

    // Hero
    heroBadge: 'अखिल भारतीय वयस्क साथी खोज व बुकिंग बाज़ार',
    heroTitle: 'परिष्कृत साहचर्य,',
    heroTitleHighlight: 'भारत भर में सत्यापित।',
    heroSub: 'पात्र वयस्कों के लिए रुचिकर भोजन, कला गाला, साहित्यिक परिचर्चा और यात्रा साहचर्य। 100% पहचान-सत्यापित वयस्क, पारदर्शी 10% प्लेटफ़ॉर्म कमीशन और न्यायसंगत धनवापसी सुरक्षा।',

    // Entry Options
    optionA_Badge: 'विकल्प अ • पात्र वयस्कों के लिए',
    optionA_Title: 'साथी के रूप में पंजीकरण करें',
    optionA_Desc: 'भारत भर में हमारे चयनित संभ्रांत साथियों के नेटवर्क से जुड़ें। निजी सरकारी पहचान पत्र सत्यापन, समर्थित शहरों का चयन करें, अपनी प्रति घंटा दर तय करें और 90% शुद्ध आय प्राप्त करें।',
    optionA_Btn: 'साथी पंजीकरण प्रारंभ करें (18+)',

    optionB_Badge: 'विकल्प ब • सम्मानित अतिथियों के लिए',
    optionB_Title: 'अन्वेषण करें और बुक करें',
    optionB_Desc: 'अपना शहर चुनें, सत्यापित वयस्क साथियों को खोजें, प्रोफ़ाइल कार्ड स्वाइप करें, पारदर्शी मूल्य देखें और एस्क्रो भुगतान सुरक्षा के साथ बुकिंग अनुरोध भेजें।',
    optionB_Btn: 'प्रोफ़ाइल व स्वाइप डेक देखें',

    // Search
    searchPlaceholder: 'साथी के नाम, रुचि, या भाषा द्वारा खोजें (जैसे: हिंदी, अंग्रेजी, संगीत, भोजन)...',
    allStates: 'सभी भारतीय राज्य',
    allCities: 'सभी शहर',
    applyFilters: 'फ़िल्टर लागू करें',
    clearFilters: 'फ़िल्टर साफ़ करें',
    resultsFound: 'भारत भर में उपलब्ध सत्यापित साथी',

    // Booking & Trust
    bookNow: 'साथी बुक करें',
    skip: 'छोड़ें',
    favorite: 'पसंदीदा में जोड़ें',
    undo: 'वापस लें',
    adultVerified: '100% सत्यापित वयस्क',
    commissionLabel: '10% पारदर्शी कमीशन नीति',
  },
};

const LANG_STORAGE_KEY = 'aura_platform_lang';

export function useLanguage() {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'hi' || saved === 'en') {
        setLang(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'hi' : 'en';
    setLang(nextLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, nextLang);
    } catch {
      // ignore
    }
  };

  const t = translations[lang];

  return { lang, toggleLanguage, t };
}
