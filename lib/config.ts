/**
 * Vienotais projekta konfigurācijas fails
 * 
 * Šis fails tiek izmantots, lai centralizēti glabātu visas projekta konfigurācijas vērtības,
 * kas tiek izmantotas dažādās vietās. Tas palīdz izvairīties no hardkodētām vērtībām un 
 * atvieglo izmaiņu veikšanu.
 */

export const APP_INFO = {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'IvaPro PC Configurator',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
    description: 'A modern web application for configuring and purchasing custom PCs',
    copyright: `© ${new Date().getFullYear()} IvaPro`,
    contactPhone: '+371 20699800',
    contactEmail: 'ivaprolv@outlook.com',
    telegramChannel: 'https://t.me/ivaprolv',
    whatsappContact: 'https://wa.me/37120699800',
    youtubeChannel: 'https://www.youtube.com/channel/UCxERu5P_HVdrMKbrHestldg',
    instagramProfile: 'https://instagram.com/apiroq',
  };
  
  export const LOCALIZATION = {
    defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en',
    locales: ['en', 'lv', 'ru'],
    defaultTimezone: process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || 'Europe/Riga',
  };
  
  export const AUTH = {
    jwtSecret: process.env.JWT_SECRET || '7f42e7c9b3d8a5f6e1b0c2d4a8f6e3b9d7c5a2f4e6b8d0c2a4f6e8b0d2c4a6f8',
    jwtExpiresIn: '7d', 
    cookieName: 'token',
    passwordMinLength: 8,
    passwordRegex: /^.{8,}$/, 
    tokenExpiration: 7 * 24 * 60 * 60, 
  };
 
  export const API = {
    defaultTimeout: 30000, 
    retryAttempts: 3,
    retryDelay: 1000,
    defaultHeaders: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  };

  export const DATABASE = {
    url: process.env.DATABASE_URL,
    logging: process.env.DEBUG_PRISMA === 'true',
    connectionTimeout: 30000,
  };
  
  export const COLORS = {
    primary: '#E63946',
    primaryHover: '#FF4D5A',
    secondary: '#2A2A2A',
    secondaryHover: '#3A3A3A',
    background: '#1A1A1A',
    foreground: '#FFFFFF',
    border: '#303030',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  };
 
  export const COMPONENT_CATEGORIES = [
    { id: 'CPU', name: 'Procesors', nameEn: 'CPU', nameRu: 'Процессор' },
    { id: 'GPU', name: 'Videokartes', nameEn: 'GPU', nameRu: 'Видеокарта' },
    { id: 'RAM', name: 'Operatīvā atmiņa', nameEn: 'RAM', nameRu: 'Оперативная память' },
    { id: 'STORAGE', name: 'Datu glabāšana', nameEn: 'Storage', nameRu: 'Хранение данных' },
    { id: 'PSU', name: 'Barošanas bloks', nameEn: 'Power Supply', nameRu: 'Блок питания' },
    { id: 'CASE', name: 'Korpuss', nameEn: 'Case', nameRu: 'Корпус' },
    { id: 'COOLING', name: 'Dzesēšana', nameEn: 'Cooling', nameRu: 'Охлаждение' },
    { id: 'MOTHERBOARD', name: 'Mātesplate', nameEn: 'Motherboard', nameRu: 'Материнская плата' },
  ];
  
  export const COMPONENT_STATUSES = {
    available: 'pieejams',
    orderable: 'pasūtāms',
    unavailable: 'nav pieejams',
  };
 
  export const CONFIGURATION_STATUSES = {
    draft: 'saglabāts',
    pendingApproval: 'awaiting_approval',
    approved: 'approved',
    rejected: 'rejected',
  };

  export const ORDER_STATUSES = {
    new: 'jauns',
    processing: 'apstrādē',
    assembling: 'montāžā',
    readyToShip: 'sagatavots nosūtīšanai',
    shipped: 'nosūtīts',
    delivered: 'piegādāts',
    cancelled: 'atcelts',
  };

  export const SERVICE_ORDER_STATUSES = {
    new: 'jauns',
    diagnosing: 'diagnostikā',
    waitingParts: 'gaida detaļas',
    repairing: 'remontā',
    testing: 'testēšanā',
    ready: 'gatavs',
    delivered: 'izsniegts',
    cannotRepair: 'nav labojams',
  };
  
  export const USER_ROLES = {
    client: 'CLIENT',
    specialist: 'SPECIALIST',
    admin: 'ADMIN',
  };
  
  export const ROUTES = {
    home: '/',
    login: '/login',
    register: '/register',
    dashboard: '/dashboard',
    profile: '/profile',
    configurator: '/configurator',
    readyConfigs: '/ready-configs',
    cart: '/cart',
    checkout: '/checkout',
    adminDashboard: '/admin-dashboard',
    specialistDashboard: '/specialist-dashboard',
    manageUsers: '/manage-users',
    manageComponents: '/manage-components',
    manageReadyConfigs: '/manage-ready-configs',
    serviceOrders: '/service-orders',
    approveConfigs: '/approve-configs',
  };
  
  export const LIMITS = {
    maxComponentsPerConfig: 20,
    maxFileSize: 2 * 1024 * 1024, 
    maxProfilePictureSize: 2 * 1024 * 1024, 
    maxConfigNameLength: 50,
    maxComponentNameLength: 50,
    maxOrders: 50, 
  };
  
  export default {
    APP_INFO,
    LOCALIZATION,
    AUTH,
    API,
    DATABASE,
    COLORS,
    COMPONENT_CATEGORIES,
    COMPONENT_STATUSES,
    CONFIGURATION_STATUSES,
    ORDER_STATUSES,
    SERVICE_ORDER_STATUSES,
    USER_ROLES,
    ROUTES,
    LIMITS,
  };