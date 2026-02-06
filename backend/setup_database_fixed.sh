#!/bin/bash

echo "🗄️  Setting up PostgreSQL database for DXCAPAI (fixed version)..."

# Очищаем и создаем заново
sudo -u postgres psql << 'SQL1'
-- Удаляем если существуют
DROP USER IF EXISTS dxcapai_user;
DROP DATABASE IF EXISTS dxcapai_db;

-- Создаем пользователя
CREATE USER dxcapai_user WITH 
  PASSWORD 'hlwGJSTWxNlt0T5gvmsODyLaW'
  CREATEDB 
  LOGIN;

-- Создаем базу данных с template0 для избежания проблем с кодировкой
CREATE DATABASE dxcapai_db WITH 
  OWNER dxcapai_user 
  TEMPLATE template0
  ENCODING 'UTF8' 
  LC_COLLATE = 'C.UTF-8' 
  LC_CTYPE = 'C.UTF-8';

-- Даем права на базу
GRANT ALL PRIVILEGES ON DATABASE dxcapai_db TO dxcapai_user;

-- Проверяем что создалось
\l dxcapai_db
SQL1

# Теперь подключаемся к созданной базе и настраиваем
sudo -u postgres psql -d dxcapai_db << 'SQL2'
-- Создаем схему
CREATE SCHEMA IF NOT EXISTS app_schema;

-- Даем права на схему пользователю
GRANT ALL ON SCHEMA app_schema TO dxcapai_user;
GRANT ALL ON ALL TABLES IN SCHEMA app_schema TO dxcapai_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA app_schema TO dxcapai_user;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA app_schema TO dxcapai_user;

-- Устанавливаем права по умолчанию для будущих объектов
ALTER DEFAULT PRIVILEGES IN SCHEMA app_schema 
GRANT ALL ON TABLES TO dxcapai_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA app_schema 
GRANT ALL ON SEQUENCES TO dxcapai_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA app_schema 
GRANT ALL ON FUNCTIONS TO dxcapai_user;

-- Включаем расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Показываем статус
SELECT 'Database extensions installed!' as status;
\dx
SQL2

echo "✅ Database setup completed!"

# Тестируем подключение
echo "🔍 Testing connection..."
export PGPASSWORD='hlwGJSTWxNlt0T5gvmsODyLaW'
psql -h localhost -U dxcapai_user -d dxcapai_db -c "SELECT 'Connection successful!' as status, current_database(), current_user;"

if [ $? -eq 0 ]; then
    echo "✅ Database connection test successful!"
else
    echo "❌ Database connection test failed!"
    exit 1
fi
