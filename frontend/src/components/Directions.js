'use client'
import { useState, useEffect, useRef } from 'react'
import { fixPrepositions } from '../app/utils/textUtils'

function useTranslation() {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en'
    setLanguage(savedLanguage)

    const handleLanguageChange = (event) => {
      setLanguage(event.detail)
    }

    window.addEventListener('languageChanged', handleLanguageChange)
    return () => window.removeEventListener('languageChanged', handleLanguageChange)
  }, [])

  const translations = {
    en: {
      directionsTitle: 'Our Trading Directions',
      directionsSubtitle: 'Diversified portfolio across multiple markets for maximum returns',
      cryptocurrency: 'Cryptocurrency Trading',
      cryptocurrencyDesc: 'Bitcoin, Ethereum, and top altcoins with 24/7 market access',
      stocksDerivatives: 'Stock Markets & Derivatives',
      stocksDerivativesDesc: 'Access to leading global company stocks and derivative instruments trading for portfolio diversification',
      goldMining: 'Gold (Mining)',
      goldMiningDesc: 'Investments in gold mining — a stable protective asset less susceptible to market fluctuations',
      metaverse: 'Metaverse / Play-to-Earn',
      metaverseDesc: 'Next-generation instruments: gaming ecosystems where you can earn by participating in metaverse economies',
      learnMore: 'Learn More',
      comingSoon: 'Coming Soon',
      hideDetails: 'Hide Details',
      upTo: 'up to',
      from: 'from',
      andAbove: 'and above',
      stakingPlans: 'Staking Plans',
      stakingIntro: 'Staking from DXCapital is a service where the client transfers their funds to the management of a professional team of traders and analysts.',
      stakingMethod: 'We use a combination of manual and algorithmic trading, analyze the market and distribute capital across strategies with controlled risk levels.',
      stakingProfit: 'Each client receives a fixed percentage of profit depending on:',
      stakingFactor1: 'deposit amount (participation level),',
      stakingFactor2: 'period for which they transfer funds (staking period).',
      stakingGoal: 'The main goal is sustainable capital growth and transparent interaction with the system, where all operations are displayed in the personal account.',
      entryPackages: 'Entry Amount Packages',
      entryPackagesDesc: 'The deposit size determines your participation level and monthly profitability rate:',
      stakingPeriods: 'Staking Periods',
      stakingPeriodsIntro: 'The staking period is the term for which you transfer your deposit to management.',
      stakingPeriodsAvailable: 'Three options are available:',
      period3: '3 months — base rate (no premium).',
      period6: '6 months — adds +1.5% to your monthly rate and a $200 bonus when opening an investment plan starting from $500..',
      period12: '12 months — adds +3% to your monthly rate and a $500 bonus when opening an investment plan starting from $1000..',
      periodExample: 'Example:',
      periodExampleText: 'A client at Advanced level with profitability up to 17% per month: with 6-month staking receives up to 19.5%, as well as a one-time currency bonus from the company of $200. With 12-month staking — up to 21% monthly, as well as a one-time currency bonus from the company of $500.',
      stakingStart: 'Staking Start',
      stakingStartText1: 'After making a deposit, the selected plan is activated in your personal account.',
      stakingStartText2: 'The staking period begins on the day the deposit is confirmed.',
      stakingStartText3: 'From this day, the countdown of the first billing month (30 days) begins.',
      profitAccrual: 'Profit Accrual',
      profitAccrualText1: 'Profit is accrued at your rate (including premium for the term) daily and you can observe the accrual process in your personal account and through notifications in the Telegram bot.',
      profitAccrualText2: 'On the 15th and 30th of each month you can:',
      profitOption1: 'withdraw accrued profit to an external wallet, or',
      profitOption2: 'reinvest it in the current deposit (to increase final profitability).',
      profitAccrualText3: 'The deposit principal remains locked until the end of the selected staking period.',
      profitWithdrawal: 'Profit Withdrawal',
      profitWithdrawalText1: 'Profit is accrued automatically',
      profitWithdrawalText2: 'Income from your staking is accrued every month - you can observe this process in your personal account.',
      profitWithdrawalText3: 'When you can withdraw money',
      profitWithdrawalText4: 'You can submit a profit withdrawal request twice a month - on the 15th and 30th of each month. No need to wait for the staking period to end.',
      profitWithdrawalText5: 'How to submit a withdrawal request',
      profitWithdrawalText6: 'Log in to your DXCapital personal account',
      profitWithdrawalText7: 'Click the Withdraw Profit button',
      profitWithdrawalText8: 'Specify the amount',
      profitWithdrawalText9: 'Confirm the request',
      profitWithdrawalText10: 'Where the money goes',
      profitWithdrawalText11: 'Funds are withdrawn in USDT to the wallet you specified during registration.',
      profitWithdrawalText12: 'What happens after the request',
      profitWithdrawalText13: 'The request is processed automatically by the DXCapital system',
      profitWithdrawalText14: 'You receive your profit',
      profitWithdrawalText15: 'The operation is displayed in the transaction history',
      profitWithdrawalText16: 'You always see the withdrawal status in your personal account',
      profitWithdrawalText17: 'If desired, you can withdraw not the entire amount, but:',
      profitWithdrawalText18: 'withdraw part of the profit and leave the remaining part in the deposit for reinvestment.',
      profitWithdrawalText19: 'Important to know',
      profitWithdrawalText20: 'When withdrawing profit, the deposit principal is not affected',
      profitWithdrawalText21: 'The deposit itself remains in operation until the end of the selected staking period',
      stakingEnd: 'End of Staking Period',
      stakingEndText1: 'Upon completion of the selected period (3, 6 or 12 months), the system notifies you of the cycle completion.',
      stakingEndText2: 'You can choose:',
      stakingEndOption1: 'Withdrawal of the deposit body and accumulated profit - Funds are returned to your wallet specified during registration.',
      stakingEndOption2: 'Extension of participation - The deposit remains in the system, and you choose a new investment period (3, 6 or 12 months), receiving the appropriate rate and premium to profitability.',
      stakingEndText3: 'You decide on the extension yourself.',
      earlyWithdrawal: 'Early Withdrawal',
      earlyWithdrawalText1: 'Early withdrawal is possible upon request through the personal account during the first month of the selected period.',
      earlyWithdrawalText2: 'With early withdrawal, you take back the deposit principal — profit remains with the DXCapital platform.',
      earlyWithdrawalText3: 'After the first month of staking, the possibility of withdrawing the deposit principal is not available until the end of the selected staking period — you only withdraw your profit. You have the opportunity to take back the deposit principal at the end of the staking period.',
      earlyWithdrawalText4: 'All processes are displayed in the personal account. For the client, this is a completely transparent process.',
      participationUpgrade: 'Participation Upgrade',
      participationUpgradeIntro: 'DXCapital provides the opportunity to change staking parameters.',
      upgradeByAmount: 'Upgrade by Amount',
      upgradeByAmountText1: 'You can increase the deposit amount to move to a higher level of profitability.',
      upgradeByAmountText2: 'After the upgrade, the new bid is applied from the next day.',
      upgradeByAmountText3: 'Accumulated interest is saved.',
      upgradeByDuration: 'Upgrade by Duration',
      upgradeByDurationText1: 'You can extend the active staking period, for example from 3 to 6 or 12 months.',
      upgradeByDurationText2: 'After extension, the rate is recalculated with a premium for the selected term (+1.5% or +3%).',
      upgradeByDurationText3: 'Changes take effect from the next billing month.',
      currencyReporting: 'Currency and Reporting',
      currencyReportingText1: 'All operations and accruals are conducted in USDT.',
      currencyReportingText2: 'In your personal account you have access to:',
      currencyFeature1: 'current rate and participation level,',
      currencyFeature2: 'term and end date of period,',
      currencyFeature3: 'history of accruals and payments,',
      currencyFeature4: 'upgrade and extension tools,',
      currencyFeature5: 'ability to contact personal manager with chronology of your previous messages.',
      currencyReportingText3: 'Each operation is confirmed by the system and recorded in the report.',
      partnerProgram: 'Partner Program',
      partnerProgramText1: 'DXCapital rewards clients who recommend the platform to other users.',
      partnerFeature1: 'For each invited client, a reward of 7% of their deposit amount is credited.',
      partnerFeature2: 'For each person invited by a client you referred, 3% of their deposit amount is credited.',
      partnerProgramText2: 'Bonuses are credited in USDT and available for withdrawal or addition to your deposit.',
      partnerProgramText3: 'All operations are visible in your personal account in real time.'
    },
    ru: {
      directionsTitle: 'Наши Торговые Направления',
      directionsSubtitle: 'Диверсифицированный портфель на различных рынках для максимальной прибыли',
      cryptocurrency: 'Торговля Криптовалютой',
      cryptocurrencyDesc: 'Bitcoin, Ethereum и топовые альткоины с круглосуточным доступом',
      stocksDerivatives: 'Фондовые рынки и Деривативы',
      stocksDerivativesDesc: 'Доступ к акциям ведущих мировых компаний и торговля производными инструментами для диверсификации портфеля',
      goldMining: 'Золото (добыча)',
      goldMiningDesc: 'Инвестиции в добычу золота — стабильный защитный актив, менее подверженный рыночным колебаниям',
      metaverse: 'Метавселенная / Play-to-Earn',
      metaverseDesc: 'Инструменты нового поколения: игровые экосистемы, где можно зарабатывать, участвуя в экономике метавселенных',
      learnMore: 'Подробнее',
      comingSoon: 'Открытие скоро',
      hideDetails: 'Скрыть детали',
      stakingPlans: 'Планы стейкинга',
      stakingIntro: 'Стейкинг от DXCapital - услуга, при котором клиент передаёт свои средства в управление профессиональной команде трейдеров и аналитиков.',
      stakingMethod: 'Мы используем комбинацию ручного и алгоритмического трейдинга, анализируем рынок и распределяет капитал по стратегиям с контролируемым уровнем риска.',
      stakingProfit: 'Каждый клиент получает фиксированный процент прибыли в зависимости от:',
      stakingFactor1: 'суммы вклада (уровень участия),',
      stakingFactor2: 'срока, на который он передаёт средства (период стейкинга).',
      stakingGoal: 'Главная цель - устойчивый рост капитала и прозрачное взаимодействие с системой, где все операции отображаются в личном кабинете.',
      entryPackages: 'Пакеты по сумме входа',
      entryPackagesDesc: 'Размер вклада определяет ваш уровень участия и ставку ежемесячной доходности:',
      upTo: 'до',
      from: 'от',
      andAbove: 'и выше',
      stakingPeriods: 'Периоды стейкинга',
      stakingPeriodsIntro: 'Период стейкинга - это срок, на который вы передаёте депозит в управление.',
      stakingPeriodsAvailable: 'Доступны три варианта:',
      period3: '3 месяца - базовая ставка (без надбавки).',
      period6: '6 месяцев - к вашей месячной ставке добавляется +1,5% и бонус 200$ при открытии инвестиционного плана от 500$..',
      period12: '12 месяцев - к вашей месячной ставке добавляется +3% и бонус 500$ при открытии инвестиционного плана от 1000$..',
      periodExample: 'Пример:',
      periodExampleText: 'Клиент на уровне Advanced с доходностью до 17% в месяц: при стейкинге на 6 месяцев получает до 19,5%, а так же разовый валютный бонус от компании размером 200 $. При стейкинге на 12 месяцев - до 21% ежемесячно, а так же разовый валютный бонус от компании размером 500 $.',
      stakingStart: 'Начало стейкинга',
      stakingStartText1: 'После внесения депозита в личном кабинете активируется выбранный план.',
      stakingStartText2: 'Период стейкинга начинается в день подтверждения депозита.',
      stakingStartText3: 'С этого дня начинается отсчёт первого расчётного месяца (30 дней).',
      profitAccrual: 'Начисление прибыли',
      profitAccrualText1: 'Прибыль начисляется по вашей ставке (с учётом надбавки за срок) ежедневно и вы можете наблюдать процесс начисления в личном кабинете и посредством уведомлений в телеграм-боте.',
      profitAccrualText2: '15го и 30го числа каждого месяца вы можете:',
      profitOption1: 'вывести начисленную прибыль на внешний кошелёк, или',
      profitOption2: 'реинвестировать её в текущий депозит (чтобы увеличить итоговую доходность).',
      profitAccrualText3: 'Тело депозита остаётся заблокированным до конца выбранного периода стейкинга.',
      profitWithdrawal: 'Вывод прибыли',
      profitWithdrawalText1: 'Прибыль начисляется автоматически',
      profitWithdrawalText2: 'Доход по вашему стейкингу начисляется каждый месяц - вы можете наблюдать за этим процессом в своём личном кабинете.',
      profitWithdrawalText3: 'Когда можно вывести деньги',
      profitWithdrawalText4: 'Вы можете подать заявку на вывод прибыли два раза в месяц - каждого 15-го и 30-го числа. Не нужно ждать окончания срока стейкинга.',
      profitWithdrawalText5: 'Как подать заявку на вывод',
      profitWithdrawalText6: 'Зайдите в личный кабинет DXCapital',
      profitWithdrawalText7: 'Нажмите кнопку Вывести прибыль',
      profitWithdrawalText8: 'Укажите сумму',
      profitWithdrawalText9: 'Подтвердите запрос',
      profitWithdrawalText10: 'Куда приходят деньги',
      profitWithdrawalText11: 'Деньги выводятся в USDT на кошелёк, который вы указали при регистрации.',
      profitWithdrawalText12: 'Что происходит после запроса',
      profitWithdrawalText13: 'Запрос обрабатывается системой DXCapital автоматически',
      profitWithdrawalText14: 'Вы получаете свою прибыль',
      profitWithdrawalText15: 'Операция отображается в истории транзакций',
      profitWithdrawalText16: 'Вы всегда видите статус вывода в личном кабинете',
      profitWithdrawalText17: 'При желании вы можете вывести не всю сумму, а:',
      profitWithdrawalText18: 'вывести часть прибыли и оставшуюся часть оставить в депозите для реинвестирования.',
      profitWithdrawalText19: 'Важно знать',
      profitWithdrawalText20: 'При выводе прибыли тело депозита не затрагивается',
      profitWithdrawalText21: 'Сам депозит остаётся в работе до конца выбранного срока стейкинга',
      stakingEnd: 'Окончание срока стейкинга',
      stakingEndText1: 'По завершении выбранного периода (3, 6 или 12 месяцев) система уведомляет вас о завершении цикла.',
      stakingEndText2: 'Вы можете выбрать:',
      stakingEndOption1: 'Вывод тела депозита и накопленной прибыли - Средства возвращаются на ваш кошелёк, указанный при регистрации.',
      stakingEndOption2: 'Продление участия - Депозит остаётся в системе, и вы выбираете новый срок инвестирования (3, 6 или 12 месяцев), получая соответствующую ставку и надбавку к доходности.',
      stakingEndText3: 'Решение о продлении вы принимаете самостоятельно.',
      earlyWithdrawal: 'Досрочный вывод',
      earlyWithdrawalText1: 'Досрочный вывод возможен по запросу через личный кабинет в течение первого месяца выбранного периода.',
      earlyWithdrawalText2: 'При досрочном выводе вы забираете тело депозита - прибыль остаётся платформе DXCapital.',
      earlyWithdrawalText3: 'После первого месяца стейкинга возможность вывода тела депозита отсутствует до момента окончания выбранного периода стейкинга - вы выводите только свою прибыль. Вы имеете возможность забрать тело депозита в момент окончания периода стейкинга.',
      earlyWithdrawalText4: 'Все процессы отображаются в личном кабинете. Для клиента это полностью прозрачный процесс.',
      participationUpgrade: 'Апгрейд участия',
      participationUpgradeIntro: 'DXCapital предоставляет возможность изменять параметры стейкинга.',
      upgradeByAmount: 'Апгрейд по сумме',
      upgradeByAmountText1: 'Вы можете увеличить сумму вклада, чтобы перейти на более высокий уровень доходности.',
      upgradeByAmountText2: 'После апгрейда новая ставка применяется со следующего дня.',
      upgradeByAmountText3: 'Накопленные проценты сохраняются.',
      upgradeByDuration: 'Апгрейд по длительности',
      upgradeByDurationText1: 'Вы можете продлить срок активного стейкинга, например с 3 до 6 или 12 месяцев.',
      upgradeByDurationText2: 'После продления ставка пересчитывается с учётом надбавки за выбранный срок (+1,5% или +3%).',
      upgradeByDurationText3: 'Изменения вступают в силу со следующего расчётного месяца.',
      currencyReporting: 'Валюта и отчётность',
      currencyReportingText1: 'Все операции и начисления проводятся в USDT.',
      currencyReportingText2: 'В личном кабинете доступны:',
      currencyFeature1: 'текущая ставка и уровень участия,',
      currencyFeature2: 'срок и дата окончания периода,',
      currencyFeature3: 'история начислений и выплат,',
      currencyFeature4: 'инструменты апгрейда и продления,',
      currencyFeature5: 'возможность связи с персональным менеджером с хронологией ваших предыдущих сообщений.',
      currencyReportingText3: 'Каждая операция подтверждается системой и фиксируется в отчёте.',
      partnerProgram: 'Партнёрская программа',
      partnerProgramText1: 'DXCapital поощряет клиентов, которые рекомендуют платформу другим пользователям.',
      partnerFeature1: 'За каждого приглашённого клиента начисляется вознаграждение 7% от суммы его депозита.',
      partnerFeature2: 'За каждого человека, приглашённого приведённым вами клиентом, начисляется 3% от суммы его депозита.',
      partnerProgramText2: 'Бонусы начисляются в USDT и доступны к выводу или добавлению к вашему депозиту.',
      partnerProgramText3: 'Все операции видны в личном кабинете в режиме реального времени.'
    }
  }

  const t = (key) => translations[language]?.[key] || translations.en[key] || key
  return { t, language }
}

export default function Directions({ isMobile, isTablet }) {
  const { t } = useTranslation()
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [expandedDirection, setExpandedDirection] = useState(null)
  const [visibleSections, setVisibleSections] = useState(new Set())
  const videoRef = useRef(null)
  const observerRef = useRef(null)

  const directions = [
    {
      id: 'crypto',
      title: fixPrepositions(t('cryptocurrency')),
      description: fixPrepositions(t('cryptocurrencyDesc')),
      color: '#2dd4bf',
      available: true
    },
    {
      id: 'stocks',
      title: fixPrepositions(t('stocksDerivatives')),
      description: fixPrepositions(t('stocksDerivativesDesc')),
      color: '#2dd4bf',
      available: false
    },
    {
      id: 'gold',
      title: fixPrepositions(t('goldMining')),
      description: fixPrepositions(t('goldMiningDesc')),
      color: '#2dd4bf',
      available: false
    },
    {
      id: 'metaverse',
      title: fixPrepositions(t('metaverse')),
      description: fixPrepositions(t('metaverseDesc')),
      color: '#2dd4bf',
      available: false
    }
  ]

  const packages = [
    { 
      level: 'Starter', 
      range: '100 – 999 $', 
      rate: fixPrepositions(t('upTo')) + ' 14%' 
    },
    { 
      level: 'Advanced', 
      range: '1000 – 2999 $', 
      rate: fixPrepositions(t('upTo')) + ' 17%' 
    },
    { 
      level: 'Pro', 
      range: '3000 – 4999 $', 
      rate: fixPrepositions(t('upTo')) + ' 20%' 
    },
    { 
      level: 'Elite', 
      range: fixPrepositions(t('from')) + ' 6000 $', 
      rate: fixPrepositions(t('upTo')) + ' 22%' 
    }
  ]

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Автовоспроизведение заблокировано - это нормально
        })
      }
    }
  }, [])

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section')
            if (sectionId) {
              setVisibleSections((prev) => new Set([...prev, sectionId]))
            }
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    )

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    if (expandedDirection === 'crypto' && observerRef.current) {
      setTimeout(() => {
        const sections = document.querySelectorAll('[data-section]')
        sections.forEach((section) => {
          observerRef.current.observe(section)
        })
      }, 100)
    }
  }, [expandedDirection])

  const handleDirectionClick = (direction) => {
    if (direction.available && direction.id === 'crypto') {
      if (expandedDirection === direction.id) {
        setExpandedDirection(null)
      } else {
        setExpandedDirection(direction.id)
        setTimeout(() => {
          const element = document.getElementById('crypto-details')
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      }
    }
  }

  return (
    <section id="directions" style={{
      padding: isMobile ? '20px 20px 60px' : '0 40px 100px',
      paddingTop: isMobile ? '20px' : '0',
      marginTop: '10px',
      position: 'relative',
      minHeight: '100vh',
      overflow: 'hidden'
    }}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onLoadedData={() => setVideoLoaded(true)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: videoLoaded ? 0.4 : 0,
          transition: 'opacity 0.6s ease-in',
          zIndex: -2
        }}
      >
        <source 
          src="/profile/Directionsmobile.mp4" 
          type="video/mp4" 
          media="(max-width: 768px)" 
        />
        <source 
          src="/profile/Directionspc.mp4" 
          type="video/mp4" 
          media="(min-width: 769px)" 
        />
      </video>

      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.5) 100%)',
        zIndex: -1,
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: isMobile ? '60px' : '80px'
        }}>
          <h2 style={{
            fontSize: isMobile ? '36px' : isTablet ? '48px' : '56px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '20px',
            lineHeight: '1.1',
            letterSpacing: '-2px',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 40px rgba(45, 212, 191, 0.3)'
          }}>
            {fixPrepositions(t('directionsTitle'))}
          </h2>
          <p style={{
            fontSize: isMobile ? '17px' : '19px',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.7',
            letterSpacing: '-0.5px',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
          }}>
            {fixPrepositions(t('directionsSubtitle'))}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
          gap: isMobile ? '24px' : '32px',
          marginBottom: expandedDirection ? '80px' : '0'
        }}>
          {directions.map((direction, index) => (
            <div 
              key={index}
              style={{
                background: direction.available 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${direction.available ? 'rgba(45, 212, 191, 0.35)' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '32px',
                padding: isMobile ? '40px 28px' : '50px 36px',
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: direction.available ? 'pointer' : 'not-allowed',
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                boxSizing: 'border-box',
                opacity: direction.available ? 1 : 0.4,
                boxShadow: expandedDirection === direction.id 
                  ? '0 30px 80px rgba(45, 212, 191, 0.25)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.5)'
              }}
              onClick={() => handleDirectionClick(direction)}
              onMouseOver={(e) => {
                if (direction.available) {
                  e.currentTarget.style.transform = 'translateY(-12px)'
                  e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.5)'
                  e.currentTarget.style.boxShadow = '0 30px 60px rgba(45, 212, 191, 0.3)'
                }
              }}
              onMouseOut={(e) => {
                if (direction.available) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.35)'
                  e.currentTarget.style.boxShadow = expandedDirection === direction.id 
                    ? '0 30px 80px rgba(45, 212, 191, 0.25)'
                    : '0 8px 32px rgba(0, 0, 0, 0.5)'
                }
              }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: '20%',
                width: '60%',
                height: '40%',
                background: direction.available 
                  ? 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.12), transparent 70%)'
                  : 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.05), transparent 70%)',
                filter: 'blur(40px)',
                pointerEvents: 'none',
                zIndex: 1
              }} />

              {!direction.available && (
                <div style={{
                  position: 'absolute',
                  top: '28px',
                  right: '28px',
                  background: 'rgba(45, 212, 191, 0.12)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(45, 212, 191, 0.25)',
                  color: '#2dd4bf',
                  padding: '10px 20px',
                  borderRadius: '100px',
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '1.2px',
                  zIndex: 2
                }}>
                  {fixPrepositions(t('comingSoon'))}
                </div>
              )}

              <div style={{
                position: 'relative',
                zIndex: 2
              }}>
                <div style={{
                  fontSize: isMobile ? '64px' : '72px',
                  fontWeight: '800',
                  background: direction.available 
                    ? 'linear-gradient(135deg, #2dd4bf 0%, rgba(45, 212, 191, 0.3) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.03) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: '1',
                  marginBottom: '32px',
                  letterSpacing: '-2px'
                }}>
                  0{index + 1}
                </div>

                <h3 style={{
                  fontSize: isMobile ? '24px' : '28px',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '16px',
                  lineHeight: '1.2',
                  letterSpacing: '-0.5px',
                  textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)'
                }}>
                  {direction.title}
                </h3>

                <p style={{
                  fontSize: '15px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: '1.8',
                  marginBottom: direction.available && direction.id === 'crypto' ? '32px' : '0',
                  letterSpacing: '-0.5px',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                }}>
                  {direction.description}
                </p>

                {direction.available && direction.id === 'crypto' && (
                  <button style={{
                    width: '100%',
                    padding: '16px',
                    background: expandedDirection === direction.id 
                      ? 'rgba(45, 212, 191, 0.2)' 
                      : 'rgba(45, 212, 191, 0.1)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(45, 212, 191, 0.25)',
                    borderRadius: '100px',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.4s',
                    letterSpacing: '0.5px',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)'
                  }}
                  onMouseOver={(e) => {
                    e.stopPropagation()
                    e.currentTarget.style.background = 'rgba(45, 212, 191, 0.25)'
                    e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.4)'
                  }}
                  onMouseOut={(e) => {
                    e.stopPropagation()
                    e.currentTarget.style.background = expandedDirection === direction.id 
                      ? 'rgba(45, 212, 191, 0.2)' 
                      : 'rgba(45, 212, 191, 0.1)'
                    e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.25)'
                  }}>
                    {expandedDirection === direction.id ? fixPrepositions(t('hideDetails')) : fixPrepositions(t('learnMore'))}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {expandedDirection === 'crypto' && (
          <div 
            id="crypto-details" 
            style={{
              opacity: 1,
              transform: 'translateY(0)',
              transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(45, 212, 191, 0.35)',
              borderRadius: '40px',
              padding: isMobile ? '50px 28px' : '80px 60px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 30px 90px rgba(45, 212, 191, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: '20%',
                width: '60%',
                height: '40%',
                background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.12), transparent 70%)',
                filter: 'blur(40px)',
                pointerEvents: 'none',
                zIndex: 1
              }} />

              <div style={{
                position: 'relative',
                zIndex: 2
              }}>
                <div 
                  data-section="section-1"
                  style={{
                    textAlign: 'center',
                    marginBottom: isMobile ? '80px' : '100px',
                    opacity: visibleSections.has('section-1') ? 1 : 0,
                    transform: visibleSections.has('section-1') ? 'translateY(0)' : 'translateY(50px)',
                    transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}>
                  <h2 style={{
                    fontSize: isMobile ? '48px' : '72px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '0',
                    letterSpacing: '-2px',
                    lineHeight: '1',
                    textShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 40px rgba(45, 212, 191, 0.3)'
                  }}>
                    {fixPrepositions(t('stakingPlans'))}
                  </h2>
                </div>

                <div 
                  data-section="section-2"
                  style={{
                    marginBottom: '100px',
                    opacity: visibleSections.has('section-2') ? 1 : 0,
                    transform: visibleSections.has('section-2') ? 'translateY(0)' : 'translateY(50px)',
                    transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDelay: '0.2s'
                  }}>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    marginBottom: '50px',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('stakingIntro'))}
                  </p>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    marginBottom: '50px',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('stakingMethod'))}
                  </p>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    marginBottom: '30px',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('stakingProfit'))}
                  </p>
                  <div style={{
                    paddingLeft: isMobile ? '20px' : '40px',
                    marginBottom: '50px'
                  }}>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.8',
                      marginBottom: '20px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      — {fixPrepositions(t('stakingFactor1'))}
                    </p>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.8',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      — {fixPrepositions(t('stakingFactor2'))}
                    </p>
                  </div>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('stakingGoal'))}
                  </p>
                </div>

                <div 
                  data-section="section-3"
                  style={{
                    marginBottom: '100px',
                    opacity: visibleSections.has('section-3') ? 1 : 0,
                    transform: visibleSections.has('section-3') ? 'translateY(0)' : 'translateY(50px)',
                    transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDelay: '0.2s'
                  }}>
                  <h3 style={{
                    fontSize: isMobile ? '36px' : '48px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '50px',
                    letterSpacing: '-2px',
                    textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 30px rgba(45, 212, 191, 0.25)'
                  }}>
                    {fixPrepositions(t('entryPackages'))}
                  </h3>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    marginBottom: '50px',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('entryPackagesDesc'))}
                  </p>
                  
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(45, 212, 191, 0.2)',
                    borderRadius: '32px',
                    padding: isMobile ? '32px 24px' : '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                  }}>
                    {packages.map((pkg, index) => (
                      <div 
                        key={index}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr 1fr',
                          gap: isMobile ? '12px' : '24px',
                          alignItems: 'center',
                          padding: isMobile ? '24px 20px' : '28px 32px',
                          background: 'rgba(45, 212, 191, 0.08)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          border: '1px solid rgba(45, 212, 191, 0.25)',
                          borderRadius: '24px',
                          transition: 'all 0.4s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'rgba(45, 212, 191, 0.12)'
                          e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.35)'
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'rgba(45, 212, 191, 0.08)'
                          e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.25)'
                        }}>
                        <div style={{
                          fontSize: isMobile ? '20px' : '24px',
                          fontWeight: '600',
                          color: 'white',
                          letterSpacing: '-0.5px',
                          textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                        }}>
                          {pkg.level}
                        </div>
                        <div style={{
                          fontSize: isMobile ? '16px' : '18px',
                          color: 'rgba(255, 255, 255, 0.9)',
                          letterSpacing: '-0.5px',
                          textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)'
                        }}>
                          {pkg.range}
                        </div>
                        <div style={{
                          fontSize: isMobile ? '20px' : '24px',
                          fontWeight: '700',
                          color: '#2dd4bf',
                          textAlign: isMobile ? 'left' : 'right',
                          letterSpacing: '-0.5px',
                          textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                        }}>
                          {pkg.rate}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div 
                  data-section="section-4"
                  style={{
                    marginBottom: '100px',
                    opacity: visibleSections.has('section-4') ? 1 : 0,
                    transform: visibleSections.has('section-4') ? 'translateY(0)' : 'translateY(50px)',
                    transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDelay: '0.2s'
                  }}>
                  <h3 style={{
                    fontSize: isMobile ? '36px' : '48px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '50px',
                    letterSpacing: '-2px',
                    textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 30px rgba(45, 212, 191, 0.25)'
                  }}>
                    {fixPrepositions(t('stakingPeriods'))}
                  </h3>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    marginBottom: '50px',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('stakingPeriodsIntro'))}
                  </p>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    marginBottom: '30px',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('stakingPeriodsAvailable'))}
                  </p>
                  <div style={{
                    paddingLeft: isMobile ? '20px' : '40px',
                    marginBottom: '50px'
                  }}>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.8',
                      marginBottom: '20px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      — {fixPrepositions(t('period3'))}
                    </p>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.8',
                      marginBottom: '20px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      — {fixPrepositions(t('period6'))}
                    </p>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.8',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      — {fixPrepositions(t('period12'))}
                    </p>
                  </div>
                  <p style={{
                    fontSize: isMobile ? '20px' : '24px',
                    color: '#2dd4bf',
                    lineHeight: '1.8',
                    marginBottom: '20px',
                    fontWeight: '600',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                  }}>
                    {fixPrepositions(t('periodExample'))}
                  </p>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: '1.8',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                  }}>
                    {fixPrepositions(t('periodExampleText'))}
                  </p>
                </div>

                <div 
                  data-section="section-5"
                  style={{
                    marginBottom: '100px',
                    opacity: visibleSections.has('section-5') ? 1 : 0,
                    transform: visibleSections.has('section-5') ? 'translateY(0)' : 'translateY(50px)',
                    transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDelay: '0.2s'
                  }}>
                  <h3 style={{
                    fontSize: isMobile ? '36px' : '48px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '50px',
                    letterSpacing: '-2px',
                    textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 30px rgba(45, 212, 191, 0.25)'
                  }}>
                    {fixPrepositions(t('stakingStart'))}
                  </h3>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    marginBottom: '30px',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('stakingStartText1'))}
                  </p>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    marginBottom: '30px',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('stakingStartText2'))}
                  </p>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('stakingStartText3'))}
                  </p>
                </div>

                <div 
                  data-section="section-6"
                  style={{
                    marginBottom: '100px',
                    opacity: visibleSections.has('section-6') ? 1 : 0,
                    transform: visibleSections.has('section-6') ? 'translateY(0)' : 'translateY(50px)',
                    transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDelay: '0.2s'
                  }}>
                  <h3 style={{
                    fontSize: isMobile ? '36px' : '48px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '50px',
                    letterSpacing: '-2px',
                    textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 30px rgba(45, 212, 191, 0.25)'
                  }}>
                    {fixPrepositions(t('profitAccrual'))}
                  </h3>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    marginBottom: '50px',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('profitAccrualText1'))}
                  </p>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    marginBottom: '30px',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('profitAccrualText2'))}
                  </p>
                  <div style={{
                    paddingLeft: isMobile ? '20px' : '40px',
                    marginBottom: '50px'
                  }}>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.8',
                      marginBottom: '20px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      — {fixPrepositions(t('profitOption1'))}
                    </p>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.8',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      — {fixPrepositions(t('profitOption2'))}
                    </p>
                  </div>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('profitAccrualText3'))}
                  </p>
                </div>

                <div 
                  data-section="section-7"
                  style={{
                    marginBottom: '100px',
                    opacity: visibleSections.has('section-7') ? 1 : 0,
                    transform: visibleSections.has('section-7') ? 'translateY(0)' : 'translateY(50px)',
                    transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDelay: '0.2s'
                  }}>
                  <h3 style={{
                    fontSize: isMobile ? '36px' : '48px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '50px',
                    letterSpacing: '-2px',
                    textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 30px rgba(45, 212, 191, 0.25)'
                  }}>
                    {fixPrepositions(t('profitWithdrawal'))}
                  </h3>

                  {/* 1. Прибыль начисляется автоматически */}
                  <div style={{
                    background: 'rgba(45, 212, 191, 0.08)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(45, 212, 191, 0.25)',
                    borderRadius: '24px',
                    padding: isMobile ? '28px 24px' : '32px',
                    marginBottom: '32px'
                  }}>
                    <h4 style={{
                      fontSize: isMobile ? '20px' : '24px',
                      fontWeight: '600',
                      color: '#2dd4bf',
                      marginBottom: '20px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)'
                    }}>
                      1. {fixPrepositions(t('profitWithdrawalText1'))}
                    </h4>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.95)',
                      lineHeight: '1.8',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                    }}>
                      {fixPrepositions(t('profitWithdrawalText2'))}
                    </p>
                  </div>

                  {/* 2. Когда можно вывести деньги */}
                  <div style={{
                    background: 'rgba(45, 212, 191, 0.08)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(45, 212, 191, 0.25)',
                    borderRadius: '24px',
                    padding: isMobile ? '28px 24px' : '32px',
                    marginBottom: '32px'
                  }}>
                    <h4 style={{
                      fontSize: isMobile ? '20px' : '24px',
                      fontWeight: '600',
                      color: '#2dd4bf',
                      marginBottom: '20px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)'
                    }}>
                      2. {fixPrepositions(t('profitWithdrawalText3'))}
                    </h4>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.95)',
                      lineHeight: '1.8',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                    }}>
                      {fixPrepositions(t('profitWithdrawalText4'))}
                    </p>
                  </div>

                  {/* 3. Как подать заявку на вывод */}
                  <div style={{
                    background: 'rgba(45, 212, 191, 0.08)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(45, 212, 191, 0.25)',
                    borderRadius: '24px',
                    padding: isMobile ? '28px 24px' : '32px',
                    marginBottom: '32px'
                  }}>
                    <h4 style={{
                      fontSize: isMobile ? '20px' : '24px',
                      fontWeight: '600',
                      color: '#2dd4bf',
                      marginBottom: '20px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)'
                    }}>
                      3. {fixPrepositions(t('profitWithdrawalText5'))}
                    </h4>
                    <div style={{
                      paddingLeft: isMobile ? '15px' : '20px'
                    }}>
                      <p style={{
                        fontSize: isMobile ? '18px' : '22px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        lineHeight: '1.8',
                        marginBottom: '16px',
                        letterSpacing: '-0.5px',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                      }}>
                        • {fixPrepositions(t('profitWithdrawalText6'))}
                      </p>
                      <p style={{
                        fontSize: isMobile ? '18px' : '22px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        lineHeight: '1.8',
                        marginBottom: '16px',
                        letterSpacing: '-0.5px',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                      }}>
                        • {fixPrepositions(t('profitWithdrawalText7'))}
                      </p>
                      <p style={{
                        fontSize: isMobile ? '18px' : '22px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        lineHeight: '1.8',
                        marginBottom: '16px',
                        letterSpacing: '-0.5px',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                      }}>
                        • {fixPrepositions(t('profitWithdrawalText8'))}
                      </p>
                      <p style={{
                        fontSize: isMobile ? '18px' : '22px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        lineHeight: '1.8',
                        letterSpacing: '-0.5px',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                      }}>
                        • {fixPrepositions(t('profitWithdrawalText9'))}
                      </p>
                    </div>
                  </div>

                  {/* 4. Куда приходят деньги */}
                  <div style={{
                    background: 'rgba(45, 212, 191, 0.08)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(45, 212, 191, 0.25)',
                    borderRadius: '24px',
                    padding: isMobile ? '28px 24px' : '32px',
                    marginBottom: '32px'
                  }}>
                    <h4 style={{
                      fontSize: isMobile ? '20px' : '24px',
                      fontWeight: '600',
                      color: '#2dd4bf',
                      marginBottom: '20px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)'
                    }}>
                      4. {fixPrepositions(t('profitWithdrawalText10'))}
                    </h4>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.95)',
                      lineHeight: '1.8',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                    }}>
                      {fixPrepositions(t('profitWithdrawalText11'))}
                    </p>
                  </div>

                  {/* 5. Что происходит после запроса */}
                  <div style={{
                    background: 'rgba(45, 212, 191, 0.08)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(45, 212, 191, 0.25)',
                    borderRadius: '24px',
                    padding: isMobile ? '28px 24px' : '32px',
                    marginBottom: '32px'
                  }}>
                    <h4 style={{
                      fontSize: isMobile ? '20px' : '24px',
                      fontWeight: '600',
                      color: '#2dd4bf',
                      marginBottom: '20px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)'
                    }}>
                      5. {fixPrepositions(t('profitWithdrawalText12'))}
                    </h4>
                    <div style={{
                      paddingLeft: isMobile ? '15px' : '20px'
                    }}>
                      <p style={{
                        fontSize: isMobile ? '18px' : '22px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        lineHeight: '1.8',
                        marginBottom: '16px',
                        letterSpacing: '-0.5px',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                      }}>
                        • {fixPrepositions(t('profitWithdrawalText13'))}
                      </p>
                      <p style={{
                        fontSize: isMobile ? '18px' : '22px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        lineHeight: '1.8',
                        marginBottom: '16px',
                        letterSpacing: '-0.5px',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                      }}>
                        • {fixPrepositions(t('profitWithdrawalText14'))}
                      </p>
                      <p style={{
                        fontSize: isMobile ? '18px' : '22px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        lineHeight: '1.8',
                        marginBottom: '16px',
                        letterSpacing: '-0.5px',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                      }}>
                        • {fixPrepositions(t('profitWithdrawalText15'))}
                      </p>
                      <p style={{
                        fontSize: isMobile ? '18px' : '22px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        lineHeight: '1.8',
                        letterSpacing: '-0.5px',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                      }}>
                        • {fixPrepositions(t('profitWithdrawalText16'))}
                      </p>
                    </div>
                  </div>

                  {/* 6. При желании вы можете вывести не всю сумму */}
                  <div style={{
                    background: 'rgba(45, 212, 191, 0.08)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(45, 212, 191, 0.25)',
                    borderRadius: '24px',
                    padding: isMobile ? '28px 24px' : '32px',
                    marginBottom: '32px'
                  }}>
                    <h4 style={{
                      fontSize: isMobile ? '20px' : '24px',
                      fontWeight: '600',
                      color: '#2dd4bf',
                      marginBottom: '20px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)'
                    }}>
                      6. {fixPrepositions(t('profitWithdrawalText17'))}
                    </h4>
                    <div style={{
                      paddingLeft: isMobile ? '15px' : '20px'
                    }}>
                      <p style={{
                        fontSize: isMobile ? '18px' : '22px',
                        color: 'rgba(255, 255, 255, 0.95)',
                        lineHeight: '1.8',
                        letterSpacing: '-0.5px',
                        textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                      }}>
                        • {fixPrepositions(t('profitWithdrawalText18'))}
                      </p>
                    </div>
                  </div>

                  {/* 7. Важно знать */}
                  <div style={{
                    background: 'rgba(45, 212, 191, 0.08)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(45, 212, 191, 0.25)',
                    borderRadius: '24px',
                    padding: isMobile ? '28px 24px' : '32px'
                  }}>
                    <h4 style={{
                      fontSize: isMobile ? '20px' : '24px',
                      fontWeight: '600',
                      color: '#2dd4bf',
                      marginBottom: '20px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)'
                    }}>
                      7. {fixPrepositions(t('profitWithdrawalText19'))}
                    </h4>
                    <div style={{
                      paddingLeft: isMobile ? '15px' : '20px'
                    }}>
                      <p style={{
                        fontSize: isMobile ? '18px' : '22px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        lineHeight: '1.8',
                        marginBottom: '16px',
                        letterSpacing: '-0.5px',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                      }}>
                        • {fixPrepositions(t('profitWithdrawalText20'))}
                      </p>
                      <p style={{
                        fontSize: isMobile ? '18px' : '22px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        lineHeight: '1.8',
                        letterSpacing: '-0.5px',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                      }}>
                        • {fixPrepositions(t('profitWithdrawalText21'))}
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  data-section="section-8"
                  style={{
                    marginBottom: '100px',
                    opacity: visibleSections.has('section-8') ? 1 : 0,
                    transform: visibleSections.has('section-8') ? 'translateY(0)' : 'translateY(50px)',
                    transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDelay: '0.2s'
                  }}>
                  <h3 style={{
                    fontSize: isMobile ? '36px' : '48px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '50px',
                    letterSpacing: '-2px',
                    textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 30px rgba(45, 212, 191, 0.25)'
                  }}>
                    {fixPrepositions(t('stakingEnd'))}
                  </h3>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    marginBottom: '50px',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('stakingEndText1'))}
                  </p>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    marginBottom: '30px',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('stakingEndText2'))}
                  </p>
                  <div style={{
                    paddingLeft: isMobile ? '20px' : '40px',
                    marginBottom: '50px'
                  }}>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.8',
                      marginBottom: '20px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      — {fixPrepositions(t('stakingEndOption1'))}
                    </p>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.8',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      — {fixPrepositions(t('stakingEndOption2'))}
                    </p>
                  </div>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('stakingEndText3'))}
                  </p>
                </div>

                <div 
                  data-section="section-9"
                  style={{
                    marginBottom: '100px',
                    opacity: visibleSections.has('section-9') ? 1 : 0,
                    transform: visibleSections.has('section-9') ? 'translateY(0)' : 'translateY(50px)',
                    transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDelay: '0.2s'
                  }}>
                  <h3 style={{
                    fontSize: isMobile ? '36px' : '48px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '50px',
                    letterSpacing: '-2px',
                    textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 30px rgba(45, 212, 191, 0.25)'
                  }}>
                    {fixPrepositions(t('earlyWithdrawal'))}
                  </h3>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    marginBottom: '30px',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('earlyWithdrawalText1'))}
                  </p>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    marginBottom: '30px',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('earlyWithdrawalText2'))}
                  </p>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    marginBottom: '30px',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('earlyWithdrawalText3'))}
                  </p>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('earlyWithdrawalText4'))}
                  </p>
                </div>

                <div 
                  data-section="section-10"
                  style={{
                    marginBottom: '100px',
                    opacity: visibleSections.has('section-10') ? 1 : 0,
                    transform: visibleSections.has('section-10') ? 'translateY(0)' : 'translateY(50px)',
                    transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDelay: '0.2s'
                  }}>
                  <h3 style={{
                    fontSize: isMobile ? '36px' : '48px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '50px',
                    letterSpacing: '-2px',
                    textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 30px rgba(45, 212, 191, 0.25)'
                  }}>
                    {fixPrepositions(t('participationUpgrade'))}
                  </h3>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    marginBottom: '50px',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('participationUpgradeIntro'))}
                  </p>
                  
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(45, 212, 191, 0.2)',
                    borderRadius: '32px',
                    padding: isMobile ? '32px 24px' : '40px',
                    marginBottom: '50px'
                  }}>
                    <h4 style={{
                      fontSize: isMobile ? '24px' : '32px',
                      fontWeight: '600',
                      color: 'white',
                      marginBottom: '30px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)'
                    }}>
                      {fixPrepositions(t('upgradeByAmount'))}
                    </h4>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.8',
                      marginBottom: '20px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      {fixPrepositions(t('upgradeByAmountText1'))}
                    </p>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.8',
                      marginBottom: '20px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      {fixPrepositions(t('upgradeByAmountText2'))}
                    </p>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.8',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      {fixPrepositions(t('upgradeByAmountText3'))}
                    </p>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(45, 212, 191, 0.2)',
                    borderRadius: '32px',
                    padding: isMobile ? '32px 24px' : '40px'
                  }}>
                    <h4 style={{
                      fontSize: isMobile ? '24px' : '32px',
                      fontWeight: '600',
                      color: 'white',
                      marginBottom: '30px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)'
                    }}>
                      {fixPrepositions(t('upgradeByDuration'))}
                    </h4>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.8',
                      marginBottom: '20px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      {fixPrepositions(t('upgradeByDurationText1'))}
                    </p>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.8',
                      marginBottom: '20px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      {fixPrepositions(t('upgradeByDurationText2'))}
                    </p>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.8',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      {fixPrepositions(t('upgradeByDurationText3'))}
                    </p>
                  </div>
                </div>

                <div 
                  data-section="section-11"
                  style={{
                    marginBottom: '100px',
                    opacity: visibleSections.has('section-11') ? 1 : 0,
                    transform: visibleSections.has('section-11') ? 'translateY(0)' : 'translateY(50px)',
                    transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDelay: '0.2s'
                  }}>
                  <h3 style={{
                    fontSize: isMobile ? '36px' : '48px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '50px',
                    letterSpacing: '-2px',
                    textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 30px rgba(45, 212, 191, 0.25)'
                  }}>
                    {fixPrepositions(t('currencyReporting'))}
                  </h3>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    marginBottom: '50px',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('currencyReportingText1'))}
                  </p>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    marginBottom: '30px',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('currencyReportingText2'))}
                  </p>
                  <div style={{
                    paddingLeft: isMobile ? '20px' : '40px',
                    marginBottom: '50px'
                  }}>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.8',
                      marginBottom: '20px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      — {fixPrepositions(t('currencyFeature1'))}
                    </p>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.8',
                      marginBottom: '20px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      — {fixPrepositions(t('currencyFeature2'))}
                    </p>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.8',
                      marginBottom: '20px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      — {fixPrepositions(t('currencyFeature3'))}
                    </p>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.8',
                      marginBottom: '20px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      — {fixPrepositions(t('currencyFeature4'))}
                    </p>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.8',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      — {fixPrepositions(t('currencyFeature5'))}
                    </p>
                  </div>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('currencyReportingText3'))}
                  </p>
                </div>

                <div 
                  data-section="section-12"
                  style={{
                    opacity: visibleSections.has('section-12') ? 1 : 0,
                    transform: visibleSections.has('section-12') ? 'translateY(0)' : 'translateY(50px)',
                    transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDelay: '0.2s',
                    background: 'rgba(45, 212, 191, 0.08)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(45, 212, 191, 0.3)',
                    borderRadius: '32px',
                    padding: isMobile ? '40px 28px' : '60px 50px'
                  }}>
                  <h3 style={{
                    fontSize: isMobile ? '36px' : '48px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '50px',
                    letterSpacing: '-2px',
                    textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 30px rgba(45, 212, 191, 0.25)'
                  }}>
                    {fixPrepositions(t('partnerProgram'))}
                  </h3>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    marginBottom: '50px',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('partnerProgramText1'))}
                  </p>
                  <div style={{
                    paddingLeft: isMobile ? '20px' : '40px',
                    marginBottom: '50px'
                  }}>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.95)',
                      lineHeight: '1.8',
                      marginBottom: '20px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      — {fixPrepositions(t('partnerFeature1'))}
                    </p>
                    <p style={{
                      fontSize: isMobile ? '18px' : '22px',
                      color: 'rgba(255, 255, 255, 0.95)',
                      lineHeight: '1.8',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                      — {fixPrepositions(t('partnerFeature2'))}
                    </p>
                  </div>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    marginBottom: '30px',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('partnerProgramText2'))}
                  </p>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.8',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                  }}>
                    {fixPrepositions(t('partnerProgramText3'))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
