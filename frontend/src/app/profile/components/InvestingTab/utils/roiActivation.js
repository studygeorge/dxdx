/**
 * Вычисляет дату активации нового ROI после реинвестирования или апгрейда
 * Новый ROI активируется 15-го или 30-го числа (28-го в феврале)
 * 
 * @param {Date} reinvestDate - Дата реинвестирования
 * @returns {Date} - Дата активации нового ROI
 */
export function getNextActivationDate(reinvestDate = new Date()) {
  const date = new Date(reinvestDate)
  const currentDay = date.getDate()
  const currentMonth = date.getMonth()
  const currentYear = date.getFullYear()
  
  // Определяем ближайшую дату активации: 15-е или 30-е (28-е для февраля)
  let activationDay
  let activationMonth = currentMonth
  let activationYear = currentYear
  
  // Проверяем февраль
  const isFebruary = currentMonth === 1
  const lastDayOfMonth = isFebruary ? 28 : 30
  
  if (currentDay < 15) {
    // Если до 15-го числа, активация 15-го текущего месяца
    activationDay = 15
  } else if (currentDay < lastDayOfMonth) {
    // Если между 15-м и 30-м (или 28-м), активация 30-го (или 28-го)
    activationDay = lastDayOfMonth
  } else {
    // Если после 30-го (или 28-го), активация 15-го следующего месяца
    activationDay = 15
    activationMonth += 1
    
    // Проверка перехода на следующий год
    if (activationMonth > 11) {
      activationMonth = 0
      activationYear += 1
    }
  }
  
  return new Date(activationYear, activationMonth, activationDay, 0, 0, 0, 0)
}

/**
 * Вычисляет количество дней до активации нового ROI
 * 
 * @param {Date} reinvestDate - Дата реинвестирования
 * @returns {number} - Количество дней до активации
 */
export function getDaysUntilActivation(reinvestDate = new Date()) {
  const activationDate = getNextActivationDate(reinvestDate)
  const now = new Date(reinvestDate)
  now.setHours(0, 0, 0, 0)
  
  const diffTime = activationDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * Форматирует дату активации для отображения
 * 
 * @param {Date} reinvestDate - Дата реинвестирования
 * @param {string} language - Язык ('en' или 'ru')
 * @returns {string} - Форматированная дата
 */
export function formatActivationDate(reinvestDate = new Date(), language = 'en') {
  const activationDate = getNextActivationDate(reinvestDate)
  
  const months = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 
         'July', 'August', 'September', 'October', 'November', 'December'],
    ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
         'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  }
  
  const day = activationDate.getDate()
  const month = months[language][activationDate.getMonth()]
  const year = activationDate.getFullYear()
  
  if (language === 'ru') {
    return `${day} ${month} ${year}`
  }
  
  return `${month} ${day}, ${year}`
}

/**
 * Проверяет, активирован ли уже новый ROI
 * 
 * @param {Date} reinvestDate - Дата реинвестирования
 * @param {Date} checkDate - Дата проверки (по умолчанию - сегодня)
 * @returns {boolean} - true если новый ROI уже активен
 */
export function isNewROIActive(reinvestDate, checkDate = new Date()) {
  const activationDate = getNextActivationDate(reinvestDate)
  activationDate.setHours(0, 0, 0, 0)
  
  const check = new Date(checkDate)
  check.setHours(0, 0, 0, 0)
  
  return check >= activationDate
}

/**
 * Получает текст подсказки об активации нового ROI
 * 
 * @param {Date} reinvestDate - Дата реинвестирования
 * @param {string} language - Язык ('en' или 'ru')
 * @returns {string} - Текст подсказки
 */
export function getActivationHintText(reinvestDate = new Date(), language = 'en') {
  const daysUntil = getDaysUntilActivation(reinvestDate)
  const formattedDate = formatActivationDate(reinvestDate, language)
  
  const texts = {
    en: {
      immediate: 'New rate will be applied from the next day',
      scheduled: `New rate will be applied from ${formattedDate} (in ${daysUntil} days)`,
      scheduleInfo: 'ROI changes are applied on the 15th or 30th (28th in February) of each month'
    },
    ru: {
      immediate: 'Новая ставка будет применена со следующего дня',
      scheduled: `Новая ставка будет применена с ${formattedDate} (через ${daysUntil} дн.)`,
      scheduleInfo: 'Изменения ROI применяются 15-го или 30-го (28-го в феврале) числа каждого месяца'
    }
  }
  
  return daysUntil <= 1 
    ? texts[language].immediate 
    : texts[language].scheduled
}

/**
 * Экспортируем всё вместе для удобства
 */
export default {
  getNextActivationDate,
  getDaysUntilActivation,
  formatActivationDate,
  isNewROIActive,
  getActivationHintText
}
