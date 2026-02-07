/**
 * Вычисляет дату активации нового ROI после реинвестирования или апгрейда
 * Новый ROI активируется 15-го или 30-го числа (28-го в феврале)
 * 
 * @param reinvestDate - Дата реинвестирования
 * @returns - Дата активации нового ROI
 */
export function getNextActivationDate(reinvestDate: Date = new Date()): Date {
  const date = new Date(reinvestDate)
  const currentDay = date.getDate()
  const currentMonth = date.getMonth()
  const currentYear = date.getFullYear()
  
  // Определяем ближайшую дату активации: 15-е или 30-е (28-е для февраля)
  let activationDay: number
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
 * @param reinvestDate - Дата реинвестирования
 * @returns - Количество дней до активации
 */
export function getDaysUntilActivation(reinvestDate: Date = new Date()): number {
  const activationDate = getNextActivationDate(reinvestDate)
  const now = new Date(reinvestDate)
  now.setHours(0, 0, 0, 0)
  
  const diffTime = activationDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * Проверяет, активирован ли уже новый ROI
 * 
 * @param reinvestDate - Дата реинвестирования
 * @param checkDate - Дата проверки (по умолчанию - сегодня)
 * @returns - true если новый ROI уже активен
 */
export function isNewROIActive(reinvestDate: Date, checkDate: Date = new Date()): boolean {
  const activationDate = getNextActivationDate(reinvestDate)
  activationDate.setHours(0, 0, 0, 0)
  
  const check = new Date(checkDate)
  check.setHours(0, 0, 0, 0)
  
  return check >= activationDate
}
