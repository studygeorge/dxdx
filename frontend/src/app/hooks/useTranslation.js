'use client'
import { useState, useEffect } from 'react'

// Объект с переводами
const translations = {
  en: {
    // Header Navigation - NEW PAGES
    team: 'Team',
    directions: 'Directions', 
    risksGuarantees: 'Risks & Guarantees',
    statistics: 'Statistics',
    clientBonus: 'Client Bonus',
    faq: 'FAQ',
    
    // Header
    stake: 'Stake',
    myRewards: 'My Rewards',
    stakingPlans: 'investing Plans',
    about: 'About',
    login: 'Log in',
    startStaking: 'Invest now',
    connectWallet: 'Connect Wallet',
    connect: 'Connect',
    disconnectWallet: 'Disconnect Wallet',
    
    // Profile Dropdown
    myProfile: 'My Profile',
    myWallet: 'My Wallet',
    stakingRewards: 'investing Rewards',
    transactionHistory: 'Transaction History',
    security: 'Security & 2FA',
    accountSettings: 'Account Settings',
    signOut: 'Sign Out',
    activeStaking: 'Active investing',
    active: 'Active',
    dxcapitalBalance: 'DXCAPITAL Balance',
    connectedWallet: 'Connected Wallet',
    
    // User states
    loading: 'Loading...',
    noUserData: 'No user data',
    user: 'User',
    errorLoading: 'Error loading',
    
    // Wallet modal
    walletRequired: 'Web3 Wallet Required',
    walletRequiredDesc: 'To connect to our DeFi platform, please install MetaMask or another Web3 browser extension.',
    installMetaMask: 'Install MetaMask',
    cancel: 'Cancel',
    
    // Wallet errors
    connectionRejected: 'Connection rejected by user',
    connectionPending: 'Connection request already sent. Please check your MetaMask extension.',
    walletError: 'Wallet connection error. Please try again.',
    
    // Hero Section
    heroTitle: 'Invest Today',
    heroTitleAccent: 'For Your Tomorrow',
    heroSubtitle: 'DXCAPITAL is an investment platform with an established ecosystem for those who share the principles of sustainable growth and transparency.',
    heroSubtitle2: 'Your growing capital is the result of our discipline.',
    howToStart: 'How to Start Working with Us',
    howToStartDesc: 'Place your funds on the DXCAPITAL platform and receive stable profits from our team of professional traders. Detailed trading reports are available in your personal account 24/7.',
    startInvestingNow: 'Start Investing Now',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    
    // Staking Section
    stakingTitle: 'Investment Plans from DXCAPITAL',
    stakingSubtitle: 'We have developed several optimally balanced investment plans. They are united by transparent returns and asset management from our team of professional traders with continuous practice of more than 9 years. Choose a plan that suits you in terms of budget, profitability percentages and other conditions.',
    basicPlan: 'Basic Plan',
    professionalPlan: 'Professional Plan',
    premiumPlan: 'Premium Plan',
    enterprisePlan: 'Enterprise Plan',
    monthlyReturn: 'Monthly Return',
    minimumDeposit: 'Minimum Deposit',
    upTo: 'up to',
    lockPeriod: 'Lock Period',
    days: 'days',
    months: 'months',
    year: 'year',
    chooseThisPlan: 'Choose This Plan',
    mostPopular: 'Most Popular',
    recommended: 'Recommended',
    bestValue: 'Best Value',
    calculateReturns: 'Calculate Your Returns',
    stakingAmount: 'investment Amounts (USDT)',
    stakingPeriod: 'investment Period',
    totalReturns: 'Total Returns',
    monthlyIncome: 'Monthly Income',
    cashBonus: 'Bonus',
    totalResult: 'Total Result',
    humanRobotTrading: 'Balance of Technology and Human Intelligence',
    guaranteedReturns: 'Sustainable Growth of Your Capital',
    guaranteedReturnsDesc: 'Thanks to our strategies based on the synthesis of three elements:\n1) continuous analysis of historical trading data\n2) AI models constantly trained by us\n3) human management carried out by our traders with cumulative continuous experience of more than 9 years',
    professionalManagement: 'Professional Management',
    professionalManagementDesc: 'We have assembled a team of the best traders, each of whom:\n1) proved their qualifications by demonstrating statistics of their trading results\n2) passed our examination and verification\n3) joined the internal training of DXCAPITAL for coordinated work according to a common strategy.',
    secureStorage: 'Security and Control',
    secureStorageDesc: 'Your funds are stored in trading and settlement accounts separated from operational ones. All operations go through verified payment gateways, are recorded in the system and protected by the multi-level DXSecurity protocol.',
    assetsUnderManagement: 'Assets Under Management',
    totalAssetsValue: 'Total Assets Value',
    monthsInOperation: 'months in operation',
    perMonth: 'per month',
    profitDisclaimer: 'Profit is estimated and depends on trading results.',
    
    // Trading Results
    tradingResultsTitle: 'DXCAPITAL Results',
    tradingResultsSubtitle: 'The report on the trading activity of our team contains real statistics on profitability and volumes in each area',
    totalProfit: 'Total Profit',
    successRate: 'Success Rate',
    averageReturn: 'Average Monthly Return',
    activeInvestors: 'Active Investors',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisYear: 'This Year',
    allTime: 'All Time',
    viewFullReport: 'View Full Report',
    cryptocurrency: 'Cryptocurrency Trading',
    cryptocurrencyDesc: 'Bitcoin, Ethereum and top altcoins with 24/7 access',
    stockMarkets: 'Stock Markets and Derivatives',
    stockMarketsDesc: 'Access to leading global company stocks and derivatives trading for portfolio diversification',
    goldMining: 'Gold (Mining)',
    goldMiningDesc: 'Investments in gold mining — a stable protective asset, less subject to market fluctuations',
    metaverse: 'Metaverse / Play-to-Earn',
    metaverseDesc: 'Next-generation tools: gaming ecosystems where you can earn by participating in metaverse economies',
    tradingVolume: 'Trading Volume',
    profitMargin: 'Profit Margin',
    totalTrades: 'Total Trades',
    openingSoon: 'Opening Soon',
    
    // Features
    featuresTitle: 'Why Choose DXCAPITAL',
    featuresSubtitle: 'The balance of advanced technologies, human experience and a system of managed decisions - this is what makes DXCAPITAL a reliable partner in capital management. Your growing capital is the result of our discipline.',

    instantTrading: 'Human + Algorithm Trading',
    instantTradingDesc: 'A combination of the professional experience of our traders and the precision of DXTrade AI modules. Each transaction undergoes manual control and is executed in fractions of a second with minimal delays.',

    lowFees: 'Optimized Fees',
    lowFeesDesc: 'Flexible fee structure starting from 0.1% with individual conditions for large investors and partners. All expenses are transparent and recorded in your personal account.',

    securePlatform: 'Institutional-Level Security',
    securePlatformDesc: 'Client funds are stored in specialized trading and settlement accounts, separate from the company\'s operational assets. DXSecurity includes multi-level protection, cold storage of USDT assets, verified payment gateways and internal audit 24/7.',

    support247: 'Support Without Days Off',
    support247Desc: 'The round-the-clock DXSupport team accompanies clients at all stages - from activation to upgrades and withdrawals. Our managers respond in real time and are involved in every dialogue - the entire communication history is always saved and available at any time to continue the dialogue without loss of information.',

    advancedAnalytics: 'Transparent Analytics',
    advancedAnalyticsDesc: 'DXAnalytics tools allow you to monitor metrics in real time. In your personal account, you can observe how your capital works, which strategies are active and what income they bring.',

    mobileApp: 'Management from Anywhere',
    mobileAppDesc: 'Full access to the portfolio through the personal Telegram bot. Invest, control and receive notifications online.',

    // Referral System
    referralTitle: 'DXCAPITAL Partnership Program',
    referralSubtitle: 'What it is and why',

    referralBonus: 'How it works',
    referralBonusDesc: 'The Partnership Program is a way to earn with DXCAPITAL, even if you don\'t invest yourself.\n\nYou simply recommend the platform to friends or followers, and receive real money in USDT for each deposit registered with your code.\n\nThe more people you invite, the higher your percentage and income.\n\nThe program is suitable for everyone: from regular users to bloggers and investors.\n\n1. After registration, you receive a personal partner code.\n2. You send it to friends, colleagues, or post it on your social media.\n3. Everyone who registers with your code and makes a deposit brings you a bonus.\n4. The more people you invite, the higher your percentage from each subsequent invitee.',

    referralExample: 'How much can you earn',
    referralExampleDesc: '1 person — 3%\n2–3 people — 4%\n4–5 people — 5%\n6–9 people — 6%\n10 people or more — 7%\n\nAdditionally: When your invitees bring their friends, you also receive a 3% bonus from their deposits (this is the second level).',

    volumeReward: 'When payments arrive',
    volumeRewardDesc: 'All bonuses are credited automatically in USDT currency and are available for instant withdrawal - without waiting and limits.\n\nYou decide what to do with the bonus:\n- withdraw to your wallet,\n- or add to your deposit to increase income.',

    partnerClub: 'Example',
    partnerClubDesc: '- You invited one person who registered on our DXCAPITAL platform and deposited $1000 - this means you automatically receive $30 (3% of your invitee\'s deposit amount).\n\n- After the fifth invitee, your bonus increased to 5%.\n\n- Now each subsequent deposit from your invitees will bring 5%, and after the tenth — 7%.\n\n- If your friends invite new people, you receive an additional 3% from their deposits.',

    communityMessage: 'DX Ambassador - volume reward\n\nIf all your invitees have deposited a total of more than $50,000, you receive DX Ambassador status.\n\nIt provides:\n- personal terms and increased bonuses,\n- direct support from the DXCAPITAL team,\n- participation in closed partnership programs.\n\nDXClub - closed partner community\n\nThe most active partners become part of DXClub - this is a community where you receive:\n- invitations to closed meetings and presentations,\n- early access to new products,\n- direct communication with the DXCAPITAL team and board of directors.',

    yourRewardCode: 'Your Reward Code',
    haveRewardCode: 'Have a Reward Code?',
    enterRewardCode: 'Enter reward code',
    applyRewardCode: 'Apply Reward Code',
    copyLink: 'Copy Link',
    linkCopied: 'Link Copied!',
    
    // Footer
    quickLinks: 'Quick Links',
    company: 'Company',
    support: 'Support',
    legal: 'Legal',
    home: 'Home',
    dashboard: 'Dashboard',
    plans: 'Plans',
    aboutUs: 'About Us',
    careers: 'Careers',
    helpCenter: 'Help Center',
    contact: 'Contact',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    riskDisclosure: 'Risk Disclosure',
    followUs: 'Follow Us',
    newsletter: 'Newsletter',
    newsletterDesc: 'Subscribe to get updates on new features and market insights',
    enterEmail: 'Enter your email',
    subscribe: 'Subscribe',
    allRightsReserved: 'All rights reserved',
    api: 'API',
    blog: 'Blog',
    footerDescription: 'Technologies. Experience. Steady growth.',
    
    // Telegram Support
    needHelp: 'Need Help?',
    chatWithUs: 'Chat with us on Telegram',
    onlineResponds: 'Online • Responds instantly',
    supportWelcomeMessage: 'Welcome to DXCAPITAL support. We help with investment questions, capital management, accruals, and technical operations. How can we help you today?',
    justNow: 'Just now',
    quickHelpTopics: 'Quick Help Topics',
    howToStartInvesting: 'How to start investing',
    howToStartInvestingDesc: 'Learn how to open an investment plan, choose a period, and activate capital placement.',
    rewardProgramDetails: 'Reward program',
    rewardProgramDetailsDesc: 'Bonus accrual rules, percentages, and cooperation conditions.',
    accountSecurity: 'Account security',
    accountSecurityDesc: 'How to protect your profile, enable two-factor authentication, and recover access.',
    platformSupport: 'Platform support',
    platformSupportDesc: 'Help with technical issues, errors, or questions about your personal account.',
    withdrawalInfo: 'Withdrawal procedures',
    withdrawalInfoDesc: 'Details about payout schedules, withdrawal methods, and transaction confirmation.',
    openTelegramChat: 'Open chat in Telegram',
    
    // Common
    yes: 'Yes',
    no: 'No',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    reset: 'Reset',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    view: 'View',
    download: 'Download',
    upload: 'Upload',
    share: 'Share',
    copy: 'Copy',
    paste: 'Paste',
    cut: 'Cut',
    undo: 'Undo',
    redo: 'Redo',
    select: 'Select',
    selectAll: 'Select All',
    clear: 'Clear',
    refresh: 'Refresh',
    reload: 'Reload',
    print: 'Print',
    export: 'Export',
    import: 'Import'
  },
  ru: {
    // Header Navigation - NEW PAGES
    team: 'Команда',
    directions: 'Направления',
    risksGuarantees: 'Риски и Гарантии',
    statistics: 'Статистика',
    clientBonus: 'Клиентский Бонус',
    faq: 'FAQ',
    
    // Header
    stake: 'Стейкинг',
    myRewards: 'Мои Награды',
    stakingPlans: 'Планы Стейкинга',
    about: 'О нас',
    login: 'Войти',
    startStaking: 'Инвестировать сейчас',
    connectWallet: 'Подключить Кошелек',
    connect: 'Подключить',
    disconnectWallet: 'Отключить Кошелек',
    
    // Profile Dropdown
    myProfile: 'Мой Профиль',
    myWallet: 'Мой Кошелек',
    stakingRewards: 'Награды Стейкинга',
    transactionHistory: 'История Транзакций',
    security: 'Безопасность и 2FA',
    accountSettings: 'Настройки Аккаунта',
    signOut: 'Выйти',
    activeStaking: 'Активный Стейкинг',
    active: 'Активен',
    dxcapitalBalance: 'Баланс DXCAPITAL',
    connectedWallet: 'Подключенный Кошелек',
    
    // User states
    loading: 'Загрузка...',
    noUserData: 'Нет данных пользователя',
    user: 'Пользователь',
    errorLoading: 'Ошибка загрузки',
    
    // Wallet modal
    walletRequired: 'Требуется Web3 Кошелек',
    walletRequiredDesc: 'Для подключения к нашей DeFi платформе, пожалуйста, установите MetaMask или другое Web3 расширение для браузера.',
    installMetaMask: 'Установить MetaMask',
    cancel: 'Отмена',
    
    // Wallet errors
    connectionRejected: 'Подключение отклонено пользователем',
    connectionPending: 'Запрос на подключение уже отправлен. Проверьте расширение MetaMask.',
    walletError: 'Ошибка подключения кошелька. Попробуйте снова.',
    
    // Hero Section
    heroTitle: 'Инвестируйте Сегодня',
    heroTitleAccent: 'Для Вашего Завтра',
    heroSubtitle: 'DXCAPITAL - инвестиционная платформа с выстроенной экосистемой для тех, кто разделяет принципы устойчивого роста и прозрачности.',
    heroSubtitle2: 'Ваш растущий капитал - результат нашей дисциплины.',
    howToStart: 'Как Начать Работать с Нами',
    howToStartDesc: 'Разместите свои средства на платформе DXCAPITAL и получайте стабильную прибыль от команды наших профессиональных трейдеров. Подробная торговая отчетность доступна в вашем личном кабинете 24/7.',
    startInvestingNow: 'Начать Инвестировать',
    getStarted: 'Начать',
    learnMore: 'Узнать Больше',
    
    // Staking Section
    stakingTitle: 'Планы инвестирования от DXCAPITAL',
    stakingSubtitle: 'Мы разработали несколько оптимально сбалансированных инвестиционных планов. Их объединяет прозрачная доходность и управление активами от команды наших профессиональных трейдеров с непрерывной практикой более 9-ти лет. Подберите план, подходящий именно вам по бюджету, процентам прибыльности и прочим условиям.',
    basicPlan: 'Базовый План',
    professionalPlan: 'Профессиональный План',
    premiumPlan: 'Премиум План',
    enterprisePlan: 'Корпоративный План',
    monthlyReturn: 'Месячная Доходность',
    minimumDeposit: 'Минимальный Депозит',
    lockPeriod: 'Период Блокировки',
    upTo: 'до',
    days: 'дней',
    months: 'мес.',
    year: 'год',
    chooseThisPlan: 'Выбрать Этот План',
    mostPopular: 'Самый Популярный',
    recommended: 'Рекомендуется',
    bestValue: 'Лучшее Предложение',
    calculateReturns: 'Рассчитайте Вашу Прибыль',
    stakingAmount: 'Сумма инвестиций (USDT)',
    stakingPeriod: 'Период инвестиций',
    totalReturns: 'Общая Прибыль',
    monthlyIncome: 'Месячный Доход',
    cashBonus: 'Бонус',
    totalResult: 'Итого результат',
    humanRobotTrading: 'Баланс технологий и человеческого интеллекта',
    guaranteedReturns: 'Устойчивый рост вашего капитала',
    guaranteedReturnsDesc: 'Благодаря нашим стратегиям, основанным на синтезе трёх элементов:\n1) непрерывной аналитики исторических торговых данных\n2) постоянно обучаемых нами AI-моделей\n3) человеческого управления, осуществляемого нашими трейдерами с совокупным непрерывным опытом более 9ти лет',
    professionalManagement: 'Профессиональное управление',
    professionalManagementDesc: 'Мы собрали команду из лучших трейдеров, каждый из которых:\n1) доказал свою квалификацию посредством демонстрации статистики своих торговых результатов\n2) прошёл наше экзаменирование и верификацию\n3) включился во внутреннее обучение DXCAPITAL для слаженной работы по общей стратегии.',
    secureStorage: 'Безопасность и контроль',
    secureStorageDesc: 'Ваши средства хранятся на торговых и расчётных счетах, разделённых с операционными. Все операции проходят через верифицированные платёжные шлюзы, фиксируются в системе и защищены многоуровневым протоколом DXSecurity.',
    assetsUnderManagement: 'Активы под Управлением',
    totalAssetsValue: 'Общая Стоимость Активов',
    monthsInOperation: 'месяцев в работе',
    perMonth: 'в месяц',
    profitDisclaimer: 'Прибыль ориентировочная и зависит от результата торговли.',
    
    // Trading Results
    tradingResultsTitle: 'Результаты DXCAPITAL',
    tradingResultsSubtitle: 'Отчёт о торговой активности нашей команды — реальная статистика доходности и объёмов по каждому направлению',
    totalProfit: 'Общая Прибыль',
    successRate: 'Уровень Успеха',
    averageReturn: 'Средняя Месячная Доходность',
    activeInvestors: 'Активные Инвесторы',
    thisMonth: 'Этот Месяц',
    lastMonth: 'Прошлый Месяц',
    thisYear: 'Этот Год',
    allTime: 'За Все Время',
    viewFullReport: 'Посмотреть Полный Отчет',
    cryptocurrency: 'Торговля Криптовалютой',
    cryptocurrencyDesc: 'Bitcoin, Ethereum и топовые альткоины с круглосуточным доступом',
    stockMarkets: 'Фондовые рынки и Деривативы',
    stockMarketsDesc: 'Доступ к акциям ведущих мировых компаний и торговля производными инструментами для диверсификации портфеля',
    goldMining: 'Золото (добыча)',
    goldMiningDesc: 'Инвестиции в добычу золота — стабильный защитный актив, менее подверженный рыночным колебаниям',
    metaverse: 'Метавселенная / Play-to-Earn',
    metaverseDesc: 'Инструменты нового поколения: игровые экосистемы, где можно зарабатывать, участвуя в экономике метавселенных',
    tradingVolume: 'Торговый Объем',
    profitMargin: 'Маржа Прибыли',
    totalTrades: 'Всего Сделок',
    openingSoon: 'Открытие скоро',
    
    // Features
    featuresTitle: 'Почему выбирают DXCAPITAL',
    featuresSubtitle: 'Баланс передовых технологий, человеческого опыта и системы управляемых решений - именно это делает DXCAPITAL надёжным партнёром в управлении капиталом. Ваш растущий капитал - результат нашей дисциплины.',

    instantTrading: 'Торговля Человек + Алгоритм',
    instantTradingDesc: 'Сочетание профессионального опыта наших трейдеров и точности AI-модулей DXTrade. Каждая сделка проходит ручной контроль и исполняется за доли секунды с минимальными задержками.',

    lowFees: 'Оптимизированные комиссии',
    lowFeesDesc: 'Гибкая структура комиссий от 0.1% с индивидуальными условиями для крупных инвесторов и партнёров. Все расходы прозрачны и фиксируются в личном кабинете.',

    securePlatform: 'Безопасность институционального уровня',
    securePlatformDesc: 'Средства клиентов хранятся на специализированных торговых и расчётных счетах, отдельных от операционных активов компании. DXSecurity включает многоуровневую защиту, холодное хранение USDT-активов, верифицированные платёжные шлюзы и внутренний аудит в режиме 24/7.',

    support247: 'Поддержка без выходных',
    support247Desc: 'Круглосуточная команда DXSupport сопровождает клиентов на всех этапах - от активации до апгрейдов и вывода средств. Наши менеджеры реагируют в реальном времени и вовлечены в каждый диалог - вся хронология коммуникаций всегда сохраняется и доступна в любой момент для продолжения диалога без потери информации.',

    advancedAnalytics: 'Прозрачная аналитика',
    advancedAnalyticsDesc: 'Инструменты DXAnalytics позволяют следить за метриками в режиме реального времени. В вашем личном кабинете вы можете наблюдать, как работает ваш капитал, какие стратегии активны и какой доход они приносят.',

    mobileApp: 'Управление из любого места',
    mobileAppDesc: 'Полноценный доступ к портфелю персональный телеграм-бот. Инвестируйте, контролируйте и получайте уведомления в режиме online.',

    // Referral System
    referralTitle: 'Партнёрская программа DXCAPITAL',
    referralSubtitle: 'Что это и зачем',

    referralBonus: 'Как это работает',
    referralBonusDesc: 'Партнёрская программа - это способ зарабатывать вместе с DXCAPITAL, даже если вы сами не инвестируете.\n\nВы просто рекомендуете платформу друзьям или подписчикам, и получаете реальные деньги в USDT за каждый депозит, зарегистрированный по вашему коду.\n\nЧем больше людей вы приглашаете, тем выше ваш процент и доход.\n\nПрограмма подходит для всех: от обычных пользователей до блогеров и инвесторов.\n\n1. После регистрации вы получаете личный партнёрский код.\n2. Отправляете его друзьям, коллегам или публикуете у себя в соц.сетях.\n3. Каждый, кто регистрируется по вашему коду и вносит депозит, приносит вам бонус.\n4. Чем больше людей вы пригласите, тем выше ваш процент с каждого следующего приглашённого.',

    referralExample: 'Сколько можно заработать',
    referralExampleDesc: '1 человек — 3%\n2–3 человека — 4%\n4–5 человек — 5%\n6–9 человек — 6%\n10 человек и больше — 7%\n\nДополнительно: Когда ваши приглашённые зовут своих друзей, вы тоже получаете бонус 3% от их депозитов (это второй уровень).',

    volumeReward: 'Когда приходят выплаты',
    volumeRewardDesc: 'Все бонусы начисляются автоматически в валюте USDT и доступны для моментального вывода - без ожиданий и лимитов.\n\nВы сами решаете, что делать с бонусом:\n- вывести на свой кошелёк,\n- или добавить к депозиту, чтобы увеличить доход.',

    partnerClub: 'Пример',
    partnerClubDesc: '- Вы пригласили одного человека, который зарегистрировался на нашей платформе DXCAPITAL и внёс $1000 - это значит, что вы автоматически получаете $30 (3% от суммы депозита вашего приглашённого).\n\n- После пятого приглашённого ваш бонус увеличился до 5%.\n\n- Теперь каждый следующий депозит ваших приглашённых будет приносить 5%, а после десятого — 7%.\n\n- Если ваши друзья приглашают новых людей, вы получаете дополнительно 3% с их депозитов.',

    communityMessage: 'DX Ambassador - награда за объём\n\nЕсли все ваши приглашённые внесли в сумме более $50,000, вы получаете статус DX Ambassador.\n\nОн даёт:\n- персональные условия и повышенные бонусы,\n- прямое сопровождение от команды DXCAPITAL,\n- участие в закрытых партнёрских программах.\n\nDXClub - закрытое сообщество партнёров\n\nСамые активные партнёры становятся частью DXClub - это сообщество, где вы получаете:\n- приглашения на закрытые встречи и презентации,\n- ранний доступ к новым продуктам,\n- прямое общение с командой DXCAPITAL и советом директоров.',

    yourRewardCode: 'Ваш Код Вознаграждения',
    haveRewardCode: 'Есть Код Вознаграждения?',
    enterRewardCode: 'Введите код вознаграждения',
    applyRewardCode: 'Применить Код Вознаграждения',
    copyLink: 'Копировать Ссылку',
    linkCopied: 'Ссылка Скопирована!',

    // Footer
    quickLinks: 'Быстрые Ссылки',
    company: 'Компания',
    support: 'Поддержка',
    legal: 'Правовая Информация',
    home: 'Главная',
    dashboard: 'Панель Управления',
    plans: 'Планы',
    aboutUs: 'О Нас',
    careers: 'Карьера',
    helpCenter: 'Центр Помощи',
    contact: 'Контакты',
    privacyPolicy: 'Политика Конфиденциальности',
    termsOfService: 'Условия Использования',
    riskDisclosure: 'Раскрытие Рисков',
    followUs: 'Следите за Нами',
    newsletter: 'Рассылка',
    newsletterDesc: 'Подпишитесь, чтобы получать обновления о новых функциях и аналитике рынка',
    enterEmail: 'Введите ваш email',
    subscribe: 'Подписаться',
    allRightsReserved: 'Все права защищены',
    api: 'API',
    blog: 'Блог',
    footerDescription: 'Технологии. Опыт. Устойчивый рост.',
    
    // Telegram Support
    needHelp: 'Нужна Помощь?',
    chatWithUs: 'Напишите нам в Telegram',
    onlineResponds: 'Онлайн • Отвечает мгновенно',
    supportWelcomeMessage: 'Добро пожаловать в поддержку DXCAPITAL. Мы помогаем с вопросами инвестиций, управления капиталом, начислений и технических операций. Чем можем быть полезны сегодня?',
    justNow: 'Только что',
    quickHelpTopics: 'Быстрые Темы Помощи',
    howToStartInvesting: 'Как начать инвестировать',
    howToStartInvestingDesc: 'Узнайте, как открыть инвестиционный план, выбрать срок и активировать размещение средств.',
    rewardProgramDetails: 'Программа вознаграждений',
    rewardProgramDetailsDesc: 'Правила начисления бонусов, проценты и условия сотрудничества.',
    accountSecurity: 'Безопасность аккаунта',
    accountSecurityDesc: 'Как защитить свой профиль, включить двухфакторную аутентификацию и восстановить доступ.',
    platformSupport: 'Поддержка платформы',
    platformSupportDesc: 'Помощь при технических неполадках, ошибках или вопросах по работе личного кабинета.',
    withdrawalInfo: 'Вывод средств',
    withdrawalInfoDesc: 'Подробности о графике выплат, способах вывода и подтверждении транзакций.',
    openTelegramChat: 'Продолжить в Telegram',
    
    // Common
    yes: 'Да',
    no: 'Нет',
    save: 'Сохранить',
    edit: 'Редактировать',
    delete: 'Удалить',
    confirm: 'Подтвердить',
    close: 'Закрыть',
    back: 'Назад',
    next: 'Далее',
    previous: 'Предыдущий',
    submit: 'Отправить',
    reset: 'Сбросить',
    search: 'Поиск',
    filter: 'Фильтр',
    sort: 'Сортировать',
    view: 'Просмотр',
    download: 'Скачать',
    upload: 'Загрузить',
    share: 'Поделиться',
    copy: 'Копировать',
    paste: 'Вставить',
    cut: 'Вырезать',
    undo: 'Отменить',
    redo: 'Повторить',
    select: 'Выбрать',
    selectAll: 'Выбрать Все',
    clear: 'Очистить',
    refresh: 'Обновить',
    reload: 'Перезагрузить',
    print: 'Печать',
    export: 'Экспорт',
    import: 'Импорт'
  }
}

export function useTranslation() {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en'
    setLanguage(savedLanguage)
    document.documentElement.lang = savedLanguage

    const handleLanguageChange = (event) => {
      const newLanguage = event.detail
      setLanguage(newLanguage)
      console.log('Language changed to:', newLanguage)
    }

    window.addEventListener('languageChanged', handleLanguageChange)
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange)
    }
  }, [])

  const t = (key) => {
    const translation = translations[language]?.[key] || translations.en[key] || key
    return translation
  }

  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage)
      localStorage.setItem('language', newLanguage)
      document.documentElement.lang = newLanguage
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: newLanguage }))
    }
  }

  const getAvailableLanguages = () => {
    return Object.keys(translations)
  }

  const getCurrentLanguageName = () => {
    const languageNames = {
      en: 'English',
      ru: 'Русский'
    }
    return languageNames[language] || language
  }

  return { 
    t, 
    language, 
    changeLanguage,
    getAvailableLanguages,
    getCurrentLanguageName
  }
}

export { translations }
