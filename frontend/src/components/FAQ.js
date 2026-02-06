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
      faqTitle: 'Frequently Asked Questions',
      faqSubtitle: 'Comprehensive answers about security, operations and transparency',
      
      q1: 'Is it safe to transfer funds to DXCapital management?',
      a1: 'Yes. DXCapital is a platform legally registered in Hong Kong with a physical office in Dubai. Client funds are managed by a professional team of analysts and traders with continuous practice of more than 9 years. The company uses a combination of manual and algorithmic trading with risk control and transparent reporting. All operations and accruals are recorded in the personal account, which ensures full transparency and control by the client.',
      
      q2: 'Where is the company registered and what documents confirm its legality?',
      a2: 'DXCapital is registered in Dubai (UAE) and operates in accordance with local legislation requirements. All legal documents, licenses confirming registration, and others are available upon request.',
      
      q3: 'How does DXCapital store and protect client funds?',
      a3: 'Client funds are stored in specialized trading and settlement accounts, separated from operational ones. This eliminates the possibility of mixing client funds with the company\'s internal assets. All operations go through verified payment gateways, and transactions are recorded in the client\'s personal account. Funds are expressed in USDT, which protects the client from the volatility of national currencies.',
      
      q4: 'Who has access to my funds and can anyone besides me control them?',
      a4: 'Only the DXCapital system has access to the deposit body within the framework of executing the staking strategy. Withdrawal of funds is possible only at the client\'s initiative through the personal account. The company cannot transfer, write off or use your funds outside the selected work mechanism. Any actions with capital are recorded in reports and displayed in the personal account.',
      
      q5: 'Can I withdraw funds before the end of the selected staking period?',
      a5: 'Yes, but with conditions. During the first month, each client has the opportunity to withdraw the deposit body, but the profit remains on the platform. After the end of the first month, the deposit body becomes fixed until the end of the selected period (3, 6 or 12 months) - profit can be withdrawn at any time without restrictions.',
      
      q6: 'What happens if I want to terminate participation early? Do I lose profits?',
      a6: 'If you terminate participation within the first month - you receive the deposit body, and the profit remains with the platform. If after - the deposit body is available only at the end of the selected staking period, and accumulated profit is available for withdrawal on the 15th and 30th of each month.',
      
      q7: 'How are profits calculated and in what currency do I receive them?',
      a7: 'Accruals are made daily according to your rate, taking into account the selected participation level, staking period and bonuses, if any, in your personal account. All updates are displayed in the personal account daily, profit is credited in USDT. Information about accruals is duplicated through notifications from the DXCapital Telegram bot.',
      
      q8: 'When and how can I withdraw profits?',
      a8: 'Profit is available for withdrawal on the 15th and 30th of each month. Funds are transferred after you form a request in your personal account. You receive money to the wallet specified during registration. Operations are carried out in USDT through the DXCapital system and recorded in the transaction history of the personal account. You can manage the amount of your profit - withdraw completely, or, for example, withdraw part and reinvest part.',
      
      q9: 'Are there any fees for depositing or withdrawing funds?',
      a9: 'DXCapital does not charge internal commissions for deposit or withdrawal. The client pays only the standard blockchain commission of the USDT network (TRC20 or ERC20), which depends on network load and is not regulated by the platform.',
      
      q10: 'What does DXCapital do in case of market drawdown?',
      a10: 'The platform uses a system of diversification and risk management: distribution of assets across strategies, combination of manual and algorithmic trading, regular market analysis and position rebalancing. The main goal is to minimize drawdowns and ensure stable returns even during market fluctuations.',
      
      q11: 'Is there capital insurance or an internal reserve to compensate for losses?',
      a11: 'DXCapital uses an internal compensation reserve, which is formed from part of the company\'s profit. It is designed to stabilize client profitability and protect portfolios from short-term drawdowns, but is not an external insurance fund.',
      
      q12: 'Can I monitor trading operations or platform performance statistics?',
      a12: 'Yes. The main statistics of the platform are displayed on the website and synchronized with your personal Telegram bot, and you can see more detailed information directly about your deposit in your personal account in the "Report" section. In addition, the website and Telegram channel publish all key news, information about platform updates and interim results of the platform\'s work.',
      
      q13: 'What guarantees does the client receive?',
      a13: 'Legal: DXCapital is a company officially registered in Hong Kong with a physical office in Dubai. Financial: fixed profitability conditions specified when activating the plan. Technical: automated reporting and secure transparent architecture of the personal account. Operational: possibility of communication with a personal manager and transparency of all actions through the system.',
      
      q14: 'How is client personal data protected?',
      a14: 'DXCapital complies with international data protection standards (including GDPR principles). Data encryption, two-factor authentication and KYC procedure are used. Access to the account is possible only through confirmed devices and verified channels.',
      
      q15: 'How to contact support?',
      a15: 'Support is available: through the DXCapital personal account (manager contact form), through the official Telegram bot, through the official email support@dxcapital.ae. There is also the possibility of direct contact with a personal manager who maintains your interaction history.'
    },
    ru: {
      faqTitle: 'Часто Задаваемые Вопросы',
      faqSubtitle: 'Исчерпывающие ответы о безопасности, операциях и прозрачности',
      
      q1: 'Безопасно ли передавать средства в управление DXCapital?',
      a1: 'Да. DXCapital - платформа, юридически зарегистрированная в Гонконге и имеющая физический офис в Дубае. Средства клиентов управляются профессиональной командой аналитиков и трейдеров с непрерывной практикой более 9ти лет. Компания использует комбинацию ручного и алгоритмического трейдинга с контролем рисков и прозрачной отчётностью. Все операции и начисления фиксируются в личном кабинете, что обеспечивает полную прозрачность и контроль со стороны клиента.',
      
      q2: 'Где зарегистрирована компания и какие документы подтверждают её легальность?',
      a2: 'DXCapital зарегистрирована в Дубае (ОАЭ) и функционирует в соответствии с требованиями местного законодательства. Все юридические документы, лицензии, подтверждающие регистрацию, и прочее доступны по запросу.',
      
      q3: 'Как DXCapital хранит и защищает средства клиентов?',
      a3: 'Средства клиентов хранятся на специализированных торговых и расчётных счетах, разделённых с операционными. Это исключает возможность смешивания клиентских средств с внутренними активами компании. Все операции проходят через верифицированные платёжные шлюзы, а транзакции фиксируются в личном кабинете клиента. Средства выражены в USDT, что защищает клиента от волатильности национальных валют.',
      
      q4: 'Кто имеет доступ к моим деньгам и может ли кто-то кроме меня ими распоряжаться?',
      a4: 'Доступ к телу депозита имеет только система DXCapital в рамках исполнения стратегии стейкинга. Вывод средств возможен только по инициативе клиента через личный кабинет. Компания не имеет возможности перевести, списать или использовать ваши средства вне выбранного механизма работы. Любые действия с капиталом фиксируются в отчётности и отображаются в личном кабинете.',
      
      q5: 'Можно ли вывести средства раньше окончания выбранного периода стейкинга?',
      a5: 'Да, но с условиями. В течение первого месяца каждый клиент имеет возможность вывести тело депозита, однако прибыль при этом остаётся на платформе. После окончания первого месяца тело депозита становится зафиксированным до конца выбранного периода (3, 6 или 12 месяцев) - прибыль при этом можно выводить в любое время без ограничений.',
      
      q6: 'Что происходит, если я хочу досрочно завершить участие? Теряю ли я прибыль?',
      a6: 'Если вы завершаете участие в течение первого месяца - вы получаете тело депозита, а прибыль остаётся платформе. Если после - тело депозита доступно только по окончании выбранного периода стейкинга, а накопленная прибыль доступна к выводу 15го и 30го числа каждого месяца.',
      
      q7: 'Как происходит начисление прибыли и в какой валюте я её получаю?',
      a7: 'Начисления осуществляются ежедневно по вашей ставке, с учётом выбранного уровня участия, срока стейкинга и бонусов, если таковые имеются в вашем личном кабинете. Все обновления отображаются в личном кабинете ежедневно, прибыль начисляется в USDT. Информация о начислениях дублируется посредством уведомлений от Telegram-бота DXCapital.',
      
      q8: 'Когда и как можно вывести прибыль?',
      a8: 'Прибыль доступна к выводу 15го и 30го числа каждого месяца. Средства перечисляются после того, как вы формируете запрос в личном кабинете. Вы получаете деньги на кошелёк, указанный при регистрации. Операции осуществляются в USDT через систему DXCapital и фиксируются в истории транзакций личного кабинета. Вы можете управлять суммой своей прибыли - выводить полностью, либо, к примеру, часть вывести, а часть реинвестировать.',
      
      q9: 'Есть ли комиссии при вводе или выводе средств?',
      a9: 'DXCapital не удерживает внутренних комиссий за ввод или вывод. Клиент оплачивает только стандартную blockchain-комиссию сети USDT (TRC20 или ERC20), которая зависит от нагрузки сети и не регулируется платформой.',
      
      q10: 'Что делает DXCapital в случае просадки на рынке?',
      a10: 'Платформа использует систему диверсификации и управления рисками: распределение активов по стратегиям, комбинация ручного и алгоритмического трейдинга, регулярный анализ рынка и ребалансировка позиций. Главная цель - минимизировать просадки и обеспечивать стабильную доходность даже при рыночных колебаниях.',
      
      q11: 'Есть ли страхование капитала или внутренний резерв для компенсации убытков?',
      a11: 'DXCapital использует внутренний компенсационный резерв, который формируется за счёт части прибыли компании. Он предназначен для стабилизации доходности клиента и защиты портфелей от краткосрочных просадок, но не является внешним страховым фондом.',
      
      q12: 'Можно ли наблюдать за торговыми операциями или статистикой?',
      a12: 'Да. Основная статистика платформы отображается на сайте и синхронизирована с вашим персональным Telegram-ботом, а более развёрнутую информацию непосредственно по вашему депозиту вы можете видеть в личном кабинете в разделе "Отчёт". В дополнение ко всему прочему, на сайте и в Telegram-канале публикуются все ключевые новости, информация об обновлениях платформы и промежуточные результаты работы платформы.',
      
      q13: 'Какие гарантии получает клиент?',
      a13: 'Юридическая: DXCapital компания, официально зарегистрированная в Гонконге с физическим офисом в Дубае. Финансовая: фиксированные условия доходности, прописанные при активации плана. Техническая: автоматизированная отчётность и безопасная прозрачная архитектура личного кабинета. Операционная: возможность связи с персональным менеджером и прозрачность всех действий через систему.',
      
      q14: 'Как защищаются персональные данные клиентов?',
      a14: 'DXCapital соблюдает международные стандарты защиты данных (включая принципы GDPR). Используется шифрование данных, двухфакторная аутентификация и процедура KYC. Доступ к аккаунту возможен только через подтверждённые устройства и верифицированные каналы.',
      
      q15: 'Как связаться с поддержкой?',
      a15: 'Поддержка доступна: через личный кабинет DXCapital (форма связи с менеджером), через официального Telegram-бота, через официальную почту support@dxcapital.ae. Также доступна возможность прямого обращения к персональному менеджеру, который ведёт вашу историю взаимодействий.'
    }
  }

  const t = (key) => translations[language]?.[key] || translations.en[key] || key
  return { t, language }
}

function useScrollAnimation() {
  const [visibleElements, setVisibleElements] = useState(new Set(['header']))
  const observerRef = useRef(null)
  const initialLoadRef = useRef(true)

  useEffect(() => {
    if (initialLoadRef.current) {
      const timer = setTimeout(() => {
        const indices = ['header', 'faq-0', 'faq-1', 'faq-2', 'faq-3', 'faq-4', 'faq-5', 'faq-6', 'faq-7', 'faq-8', 'faq-9', 'faq-10', 'faq-11', 'faq-12', 'faq-13', 'faq-14']
        setVisibleElements(new Set(indices))
        initialLoadRef.current = false
      }, 100)
      return () => clearTimeout(timer)
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => new Set([...prev, entry.target.dataset.index]))
          }
        })
      },
      {
        threshold: 0.2,
        rootMargin: '0px'
      }
    )

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  const registerElement = (element, index) => {
    if (element && observerRef.current && !initialLoadRef.current) {
      element.dataset.index = index
      observerRef.current.observe(element)
    }
  }

  return { visibleElements, registerElement }
}

export default function FAQ({ isMobile, isTablet }) {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState(null)
  const { visibleElements, registerElement } = useScrollAnimation()
  const videoRef = useRef(null)
  const [videoLoaded, setVideoLoaded] = useState(false)

  // Принудительная загрузка и воспроизведение видео
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

  const faqs = [
    { question: t('q1'), answer: t('a1') },
    { question: t('q2'), answer: t('a2') },
    { question: t('q3'), answer: t('a3') },
    { question: t('q4'), answer: t('a4') },
    { question: t('q5'), answer: t('a5') },
    { question: t('q6'), answer: t('a6') },
    { question: t('q7'), answer: t('a7') },
    { question: t('q8'), answer: t('a8') },
    { question: t('q9'), answer: t('a9') },
    { question: t('q10'), answer: t('a10') },
    { question: t('q11'), answer: t('a11') },
    { question: t('q12'), answer: t('a12') },
    { question: t('q13'), answer: t('a13') },
    { question: t('q14'), answer: t('a14') },
    { question: t('q15'), answer: t('a15') }
  ]

  return (
    <section id="faq" style={{
      padding: isMobile ? '20px 20px 80px' : '0 40px 120px',
      paddingTop: isMobile ? '20px' : '0',
      marginTop: '10px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* VIDEO BACKGROUND - ОПТИМИЗИРОВАНО */}
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
          src="/profile/FAQmobile.mp4" 
          type="video/mp4" 
          media="(max-width: 768px)" 
        />
        <source 
          src="/profile/FAQpk.mp4" 
          type="video/mp4" 
          media="(min-width: 769px)" 
        />
      </video>

      {/* GRADIENT OVERLAY */}
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
        maxWidth: '1000px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <div 
          ref={(el) => registerElement(el, 'header')}
          style={{
            textAlign: 'center',
            marginBottom: isMobile ? '60px' : '80px',
            opacity: visibleElements.has('header') ? 1 : 0,
            transform: visibleElements.has('header') ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
          <h2 style={{
            fontSize: isMobile ? '40px' : isTablet ? '56px' : '64px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '24px',
            lineHeight: '1.1',
            letterSpacing: '-2px',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 40px rgba(45, 212, 191, 0.3)'
          }}>
            {fixPrepositions(t('faqTitle'))}
          </h2>
          <p style={{
            fontSize: isMobile ? '18px' : '20px',
            color: 'rgba(255, 255, 255, 0.75)',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6',
            letterSpacing: '-0.5px',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
          }}>
            {fixPrepositions(t('faqSubtitle'))}
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '16px' : '20px'
        }}>
          {faqs.map((faq, index) => (
            <div 
              key={index}
              ref={(el) => registerElement(el, `faq-${index}`)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(45, 212, 191, 0.25)',
                borderRadius: '32px',
                overflow: 'hidden',
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: visibleElements.has(`faq-${index}`) ? 1 : 0,
                transform: visibleElements.has(`faq-${index}`) ? 'translateY(0)' : 'translateY(40px)',
                transitionDelay: `${index * 0.05}s`,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
              }}>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                style={{
                  width: '100%',
                  padding: isMobile ? '24px' : '28px 32px',
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.4s',
                  position: 'relative'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(45, 212, 191, 0.1)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'none'
                }}
              >
                <div style={{
                  position: 'absolute',
                  left: isMobile ? '24px' : '32px',
                  top: isMobile ? '24px' : '28px',
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: '700',
                  color: 'rgba(45, 212, 191, 0.6)',
                  minWidth: isMobile ? '32px' : '40px',
                  textShadow: '0 0 15px rgba(45, 212, 191, 0.4)'
                }}>
                  {String(index + 1).padStart(2, '0')}
                </div>

                <span style={{
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: '600',
                  color: 'white',
                  textAlign: 'left',
                  paddingLeft: isMobile ? '48px' : '60px',
                  lineHeight: '1.5',
                  letterSpacing: '-0.3px',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                }}>
                  {fixPrepositions(faq.question)}
                </span>

                <div style={{
                  minWidth: isMobile ? '32px' : '40px',
                  height: isMobile ? '32px' : '40px',
                  marginLeft: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(45, 212, 191, 0.15)',
                  borderRadius: '50%',
                  transition: 'all 0.4s',
                  boxShadow: '0 0 20px rgba(45, 212, 191, 0.3)'
                }}>
                  <svg
                    width={isMobile ? '16' : '20'}
                    height={isMobile ? '16' : '20'}
                    fill="none"
                    stroke="#2dd4bf"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    style={{
                      transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.4s',
                      filter: 'drop-shadow(0 0 8px rgba(45, 212, 191, 0.5))'
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              <div style={{
                maxHeight: openIndex === index ? '1000px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <div style={{
                  padding: isMobile ? '0 24px 28px' : '0 32px 32px',
                  paddingLeft: isMobile ? '72px' : '92px'
                }}>
                  <p style={{
                    fontSize: isMobile ? '15px' : '16px',
                    color: 'rgba(255, 255, 255, 0.85)',
                    lineHeight: '1.8',
                    margin: 0,
                    letterSpacing: '-0.2px',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
                  }}>
                    {fixPrepositions(faq.answer)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
