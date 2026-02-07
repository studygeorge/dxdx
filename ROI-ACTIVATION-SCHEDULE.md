# 📅 ROI ACTIVATION SCHEDULE - Активация ROI по расписанию

## 🎯 НОВАЯ БИЗНЕС-ЛОГИКА

### Старая логика:
```
Реинвест/Апгрейд → Новый ROI со следующего дня ❌
```

### Новая логика:
```
Реинвест/Апгрейд → Новый ROI с 15-го или 30-го числа ✅
До этой даты → Старый ROI на старую сумму
```

---

## 📊 ПРАВИЛА АКТИВАЦИИ

### Даты активации: 15-е и 30-е число (28-е для февраля)

| Дата реинвеста | Ближайшая дата активации |
|----------------|--------------------------|
| 1-14 января | 15 января |
| 15-29 января | 30 января |
| 30-31 января | 15 февраля |
| 1-14 февраля | 15 февраля |
| 15-27 февраля | 28 февраля |
| 28-29 февраля | 15 марта |
| 1-14 марта | 15 марта |
| 15-29 марта | 30 марта |
| 30-31 марта | 15 апреля |

### Примеры:

#### Пример 1: Реинвест 10 января
```
Текущая инвестиция: $1000, 17% (Advanced)
Реинвест: $85
Новая сумма: $1085

📅 Активация нового ROI: 15 января
⏳ До 15 января: 17% на $1000
✅ С 15 января: 17% на $1085
```

#### Пример 2: Апгрейд 20 января
```
Текущая инвестиция: $2900, 17% (Advanced)
Реинвест: $290
Новая сумма: $3190
Апгрейд: Advanced → Pro (20%)

📅 Активация нового ROI: 30 января
⏳ До 30 января: 17% на $2900
✅ С 30 января: 20% на $3190
```

#### Пример 3: Реинвест 31 декабря
```
Текущая инвестиция: $5000, 20% (Pro)
Реинвест: $500
Новая сумма: $5500

📅 Активация нового ROI: 15 января следующего года
⏳ До 15 января: 20% на $5000
✅ С 15 января: 20% на $5500
```

---

## 💻 FRONTEND РЕАЛИЗАЦИЯ

### Файлы:

#### 1. `utils/roiActivation.js` (новый)
Утилиты для расчёта дат активации:

```javascript
// Основные функции:
getNextActivationDate(reinvestDate)  // Возвращает Date активации
getDaysUntilActivation(reinvestDate) // Возвращает число дней
formatActivationDate(reinvestDate, language) // Форматирует дату
getActivationHintText(reinvestDate, language) // Текст подсказки
isNewROIActive(reinvestDate, checkDate) // Проверка активации
```

#### 2. `ReinvestModal.js` (обновлён)
Отображает информацию о дате активации:

```javascript
// Новый блок в UI:
📅 New rate will be applied from January 30, 2024 (in 10 days)
Until this date, 17% will be earned on $2900.00
```

#### 3. `InvestingTab/index.js` (обновлён)
Передаёт `language` prop в ReinvestModal.

---

## 🔧 BACKEND ТРЕБОВАНИЯ

### ⚠️ ВАЖНО: Backend должен реализовать ту же логику!

### Что нужно сделать в backend:

#### 1. Таблица инвестиций - новые поля:
```sql
ALTER TABLE investments ADD COLUMN pending_roi DECIMAL(5,2);
ALTER TABLE investments ADD COLUMN pending_amount DECIMAL(15,2);
ALTER TABLE investments ADD COLUMN roi_activation_date DATE;
```

#### 2. Логика реинвестирования:
```javascript
// Псевдокод:
async function reinvestProfit(investmentId, amount) {
  const investment = await getInvestment(investmentId)
  const currentAmount = investment.amount
  const currentROI = investment.roi
  
  const newAmount = currentAmount + amount
  const newPackage = getPackageByAmount(newAmount)
  const newROI = calculateROI(newPackage, investment.duration)
  
  // Вычисляем дату активации
  const activationDate = getNextActivationDate(new Date())
  
  // Обновляем инвестицию
  await updateInvestment(investmentId, {
    pending_amount: newAmount,
    pending_roi: newROI,
    roi_activation_date: activationDate
    // amount и roi НЕ меняем до даты активации!
  })
  
  return { success: true, activationDate }
}
```

#### 3. Cron job - активация по расписанию:
```javascript
// Запускается каждый день в 00:01
async function activatePendingROI() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Находим все инвестиции с датой активации сегодня
  const pendingInvestments = await db.query(`
    SELECT * FROM investments 
    WHERE roi_activation_date = ? 
    AND pending_roi IS NOT NULL
  `, [today])
  
  for (const investment of pendingInvestments) {
    // Активируем новый ROI
    await db.query(`
      UPDATE investments 
      SET 
        amount = pending_amount,
        roi = pending_roi,
        pending_amount = NULL,
        pending_roi = NULL,
        roi_activation_date = NULL
      WHERE id = ?
    `, [investment.id])
    
    console.log(`✅ ROI activated for investment ${investment.id}`)
  }
}
```

#### 4. Начисление процентов - учитываем pending:
```javascript
async function calculateDailyInterest(investmentId) {
  const investment = await getInvestment(investmentId)
  const today = new Date()
  
  // Проверяем, активирован ли уже новый ROI
  if (investment.roi_activation_date && today < investment.roi_activation_date) {
    // Используем старый ROI на старую сумму
    const dailyInterest = (investment.amount * investment.roi) / 100 / 30
    return dailyInterest
  } else if (investment.pending_roi) {
    // Новый ROI уже активирован
    const dailyInterest = (investment.pending_amount * investment.pending_roi) / 100 / 30
    return dailyInterest
  } else {
    // Обычный расчёт
    const dailyInterest = (investment.amount * investment.roi) / 100 / 30
    return dailyInterest
  }
}
```

---

## 🔍 ПРОВЕРКА РАБОТЫ

### Frontend (сейчас):
1. Открыть: https://dxcapital-ai.com/profile
2. Нажать: "Reinvest Profit" на любой инвестиции
3. Ввести сумму реинвестирования
4. **Проверить:** Показывается дата активации ✅
5. **Пример текста:**
   ```
   📅 New rate will be applied from January 30, 2024 (in 10 days)
   Until this date, 17% will be earned on $2900.00
   ```

### Backend (требует реализации):
1. Реинвестировать прибыль
2. Проверить в БД:
   - `pending_amount` = новая сумма
   - `pending_roi` = новый ROI
   - `roi_activation_date` = 15-е или 30-е число
   - `amount` и `roi` НЕ изменились
3. Дождаться даты активации
4. Проверить в БД:
   - `amount` = `pending_amount`
   - `roi` = `pending_roi`
   - `pending_*` поля = NULL

---

## 📦 КОММИТ INFO

- **Commit:** `9d60f19`
- **Message:** "feat: ROI activation on 15th or 30th after reinvest/upgrade"
- **Files:**
  - `utils/roiActivation.js` (новый)
  - `ReinvestModal.js` (обновлён)
  - `InvestingTab/index.js` (обновлён)

---

## ⚠️ ВАЖНО ДЛЯ BACKEND РАЗРАБОТЧИКА

1. **Не меняйте `amount` и `roi` сразу при реинвесте!**
2. **Используйте `pending_*` поля до даты активации**
3. **Создайте cron job для активации по расписанию**
4. **Учитывайте pending поля при расчёте процентов**
5. **Синхронизируйте логику с `roiActivation.js`**

---

## 🎉 ГОТОВО!

- **Frontend:** ✅ Реализовано
- **Backend:** ⏳ Требует реализации
- **Repository:** https://github.com/studygeorge/dxdx
- **Branch:** main
- **Last commit:** 9d60f19

Frontend готов, backend нужно обновить по этой спецификации! 🚀
