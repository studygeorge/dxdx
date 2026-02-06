// backend/src/config/config.ts
import dotenv from 'dotenv';
import path from 'path';

// Загружаем переменные окружения из .env файла
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ============== CONFIGURATION INTERFACES ==============

interface DatabaseConfig {
  url: string;
}

interface JWTConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  emailUser: string;      // ✅ ПЕРЕИМЕНОВАНО
  emailPassword: string;  // ✅ ПЕРЕИМЕНОВАНО
  fromName: string;
  fromEmail: string;
}

interface ServerConfig {
  port: number;
  host: string;
  nodeEnv: string;
}

interface CORSConfig {
  origin: string | string[];
  credentials: boolean;
}

interface Web3Config {
  enabled: boolean;
  provider?: string;
}

interface Config {
  server: ServerConfig;
  database: DatabaseConfig;
  jwt: JWTConfig;
  email: EmailConfig;
  cors: CORSConfig;
  web3: Web3Config;
}

// ============== HELPER FUNCTIONS ==============

/**
 * Получить переменную окружения с проверкой наличия
 */
function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Получить переменную окружения как число
 */
function getEnvAsNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return parsed;
}

/**
 * Получить переменную окружения как boolean
 */
function getEnvAsBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

// ============== CONFIGURATION OBJECT ==============

export const config: Config = {
  // Настройки сервера
  server: {
    port: getEnvAsNumber('PORT', 3001),
    host: getEnv('HOST', '0.0.0.0'),
    nodeEnv: getEnv('NODE_ENV', 'development')
  },

  // Настройки базы данных
  database: {
    url: getEnv('DATABASE_URL')
  },

  // Настройки JWT токенов
  jwt: {
    accessSecret: getEnv('JWT_SECRET'),
    refreshSecret: getEnv('JWT_REFRESH_SECRET'),
    accessExpiresIn: getEnv('JWT_ACCESS_EXPIRES_IN', '15m'),
    refreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '7d')
  },

  // Настройки email (SMTP)
  email: {
    smtpHost: getEnv('SMTP_HOST', 'eu.appsuite.cloud'),
    smtpPort: getEnvAsNumber('SMTP_PORT', 587), // ✅ ИЗМЕНЕНО НА 587
    smtpSecure: getEnvAsBoolean('SMTP_SECURE', false), // ✅ ИЗМЕНЕНО НА false
    emailUser: getEnv('EMAIL_USER', 'noreply@dxcapital-ai.com'), // ✅ ПЕРЕИМЕНОВАНО
    emailPassword: getEnv('EMAIL_PASSWORD', '32thA47JQ429aZb7o72xqk'), // ✅ ПЕРЕИМЕНОВАНО + ХАРДКОД
    fromName: getEnv('EMAIL_FROM_NAME', 'DXCapital'),
    fromEmail: getEnv('EMAIL_FROM_EMAIL', 'noreply@dxcapital-ai.com')
  },

  // Настройки CORS
  cors: {
    origin: process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : ['http://localhost:3000', 'https://dxcapital-ai.com', 'https://www.dxcapital-ai.com'],
    credentials: getEnvAsBoolean('CORS_CREDENTIALS', true)
  },

  // Настройки Web3
  web3: {
    enabled: getEnvAsBoolean('WEB3_ENABLED', true),
    provider: process.env.WEB3_PROVIDER
  }
};

// ============== VALIDATION ==============

/**
 * Валидация конфигурации при старте приложения
 */
export function validateConfig(): void {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
    // ✅ УДАЛЕНО EMAIL_PASSWORD из обязательных (т.к. есть хардкод fallback)
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}`
    );
  }

  console.log('✅ Configuration validated successfully');
  console.log('📧 SMTP Config:', {
    host: config.email.smtpHost,
    port: config.email.smtpPort,
    secure: config.email.smtpSecure,
    user: config.email.emailUser,
    password: config.email.emailPassword ? '***' + config.email.emailPassword.slice(-3) : 'NOT SET'
  });
}

// ============== EXPORTS ==============

export default config;

// Типизированные экспорты для удобства
export const {
  server: serverConfig,
  database: databaseConfig,
  jwt: jwtConfig,
  email: emailConfig,
  cors: corsConfig,
  web3: web3Config
} = config;
