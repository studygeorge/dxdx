import path from 'path'

// ✅ АБСОЛЮТНЫЙ ПУТЬ к директории uploads
export const UPLOADS_BASE_DIR = '/home/dxcapai-backend/uploads'

export const PATHS = {
  KYC_UPLOADS: path.join(UPLOADS_BASE_DIR, 'kyc'),
  // Можно добавить другие пути при необходимости
  GENERAL_UPLOADS: UPLOADS_BASE_DIR
}

// Функция для получения полного пути к KYC файлу
export function getKYCFilePath(filename: string): string {
  return path.join(PATHS.KYC_UPLOADS, filename)
}

// Функция для получения URL KYC файла
export function getKYCFileUrl(filename: string): string {
  return `/uploads/kyc/${filename}`
}