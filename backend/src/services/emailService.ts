import nodemailer, { Transporter } from 'nodemailer';

// Интерфейсы
interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ============== ЗАХАРДКОЖЕННАЯ КОНФИГУРАЦИЯ SMTP ==============
const transporter: Transporter = nodemailer.createTransport({
  host: 'smtp.ultamail.com',
  port: 587,
  secure: false,
  auth: {
    type: 'login',
    user: 'info@dxcapital-ai.com',
    pass: '@V3ri1S8eR0r'
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 30000
});

// ============== УПРОЩЕННЫЙ ШАБЛОН ==============
const getWelcomeEmailTemplate = (
  userName: string,
  userEmail: string,
  language: string = 'ru'
): EmailTemplate => {
  const templates: Record<string, EmailTemplate> = {
    ru: {
      subject: 'Добро пожаловать в DXCapital',
      text: `
Здравствуйте, ${userName}!

Благодарим вас за регистрацию на платформе DXCapital - ваш личный кабинет успешно создан.

Чтобы получить полный доступ к функционалу платформы и активировать инвестиционные инструменты, пройдите KYC-верификацию.

Войти: https://dxcapital-ai.com/

После прохождения верификации вам будут доступны:
• Выбор инвестиционного плана и периода стейкинга
• Управление средствами
• Инвестиционная статистика платформы
• Информация о партнёрской программе и бонусах
• Поддержка персонального менеджера

Если у вас возникли вопросы на каком-либо из этапов, смело обращайтесь в нашу службу заботы.

С уважением,
Команда DXCapital

---
DXCapital - Платформа инвестиций
© ${new Date().getFullYear()} DXCapital. Все права защищены.

Вы получили это письмо, потому что зарегистрировались на платформе DXCapital.
Если это были не вы, проигнорируйте это сообщение.
Письмо отправлено на: ${userEmail}
      `,
      html: `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #2dd4bf;">Добро пожаловать в DXCapital</h2>
  
  <p>Здравствуйте, <strong>${userName}</strong>!</p>
  
  <p>Благодарим вас за регистрацию на платформе <strong>DXCapital</strong> — ваш личный кабинет успешно создан.</p>
  
  <p style="background: #f0f9ff; border-left: 4px solid #2dd4bf; padding: 15px; margin: 20px 0;">
    <strong>📋 Важно:</strong> Чтобы получить полный доступ к функционалу платформы и активировать инвестиционные инструменты, пройдите <strong>KYC-верификацию</strong>.
  </p>
  
  <p style="text-align: center; margin: 30px 0;">
    <a href="https://dxcapital-ai.com/" style="display: inline-block; background: #2dd4bf; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;"> Войти</a>
  </p>
  
  <h3 style="color: #2dd4bf;">После прохождения верификации вам будут доступны:</h3>
  <ul>
    <li>Выбор инвестиционного плана и периода стейкинга</li>
    <li>Управление средствами</li>
    <li>Инвестиционная статистика платформы</li>
    <li>Информация о партнёрской программе и бонусах</li>
    <li>Поддержка персонального менеджера</li>
  </ul>
  
  <p>Если у вас возникли вопросы на каком-либо из этапов, смело обращайтесь в нашу службу заботы.</p>
  
  <p style="margin-top: 30px;">
    С уважением,<br>
    <strong>Команда DXCapital</strong>
  </p>
  
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
  
  <p style="font-size: 12px; color: #666; text-align: center;">
    <strong>DXCapital</strong> — Платформа инвестиций<br>
    © ${new Date().getFullYear()} DXCapital. Все права защищены.<br><br>
    Вы получили это письмо, потому что зарегистрировались на платформе DXCapital.<br>
    Если это были не вы, проигнорируйте это сообщение.<br>
    Письмо отправлено на: ${userEmail}
  </p>
</body>
</html>
      `
    },
    en: {
      subject: 'Welcome to DXCapital',
      text: `
Welcome aboard, ${userName}!

Thank you for registering on the DXCapital platform - your personal account has been successfully created.

To get full access to the platform features and activate investment tools, please complete KYC verification.

Login: https://dxcapital-ai.com/

After completing verification, you will have access to:
• Selection of investment plan and staking period
• Fund management
• Platform investment statistics
• Referral program and bonus information
• Personal manager support

If you have any questions at any stage, feel free to contact our support team.

Best regards,
DXCapital Team

---
DXCapital - Investment Platform
© ${new Date().getFullYear()} DXCapital. All rights reserved.

You received this email because you registered on DXCapital platform.
If this wasn't you, please ignore this message.
Email sent to: ${userEmail}
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #2dd4bf;">Welcome to DXCapital</h2>
  
  <p>Welcome aboard, <strong>${userName}</strong>!</p>
  
  <p>Thank you for registering on the <strong>DXCapital</strong> platform — your personal account has been successfully created.</p>
  
  <p style="background: #f0f9ff; border-left: 4px solid #2dd4bf; padding: 15px; margin: 20px 0;">
    <strong>📋 Important:</strong> To get full access to the platform features and activate investment tools, please complete <strong>KYC verification</strong>.
  </p>
  
  <p style="text-align: center; margin: 30px 0;">
    <a href="https://dxcapital-ai.com/" style="display: inline-block; background: #2dd4bf; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">🔐 Login</a>
  </p>
  
  <h3 style="color: #2dd4bf;">After completing verification, you will have access to:</h3>
  <ul>
    <li>Selection of investment plan and staking period</li>
    <li>Fund management</li>
    <li>Platform investment statistics</li>
    <li>Referral program and bonus information</li>
    <li>Personal manager support</li>
  </ul>
  
  <p>If you have any questions at any stage, feel free to contact our support team.</p>
  
  <p style="margin-top: 30px;">
    Best regards,<br>
    <strong>DXCapital Team</strong>
  </p>
  
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
  
  <p style="font-size: 12px; color: #666; text-align: center;">
    <strong>DXCapital</strong> — Investment Platform<br>
    © ${new Date().getFullYear()} DXCapital. All rights reserved.<br><br>
    You received this email because you registered on DXCapital platform.<br>
    If this wasn't you, please ignore this message.<br>
    Email sent to: ${userEmail}
  </p>
</body>
</html>
      `
    }
  };

  return templates[language] || templates.ru;
};

/**
 * Отправка приветственного письма
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  language: string = 'ru'
): Promise<EmailResult> {
  try {
    const template = getWelcomeEmailTemplate(userName, userEmail, language);
    
    const info = await transporter.sendMail({
      from: '"DXCapital" <info@dxcapital-ai.com>',
      to: userEmail,
      subject: template.subject,
      text: template.text, // ✅ Добавлен текстовый вариант
      html: template.html
    });

    console.log('✅ Welcome email sent successfully:', {
      to: userEmail,
      messageId: info.messageId,
      response: info.response
    });
    
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Email sending error:', {
      email: userEmail,
      error: error.message,
      code: error.code,
      command: error.command
    });
    return { success: false, error: error.message };
  }
}

/**
 * Универсальная отправка письма
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<EmailResult> {
  try {
    const info = await transporter.sendMail({
      from: '"DXCapital" <info@dxcapital-ai.com>',
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Текстовая версия
      html
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Email sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Проверка подключения к SMTP
 */
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    console.log('📧 Email config:', {
      host: 'smtp.ultamail.com',
      port: 587,
      secure: false,
      user: 'info@dxcapital-ai.com',
      from: 'DXCapital <info@dxcapital-ai.com>'
    });
    return true;
  } catch (error: any) {
    console.error('❌ SMTP connection failed:', {
      error: error.message,
      code: error.code,
      command: error.command
    });
    return false;
  }
}

export default {
  sendWelcomeEmail,
  sendEmail,
  testEmailConnection
};