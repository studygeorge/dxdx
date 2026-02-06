#!/bin/bash

echo "🗄️  Setting up PostgreSQL database for DXCAPAI..."

# Создаем базу данных и пользователя
sudo -u postgres psql << 'SQL'
-- Создаем пользователя
CREATE USER dxcapai_user WITH PASSWORD 'hlwGJSTWxNlt0T5gvmsODyLaW';

-- Создаем базу данных
CREATE DATABASE dxcapai_db WITH 
  OWNER dxcapai_user 
  ENCODING 'UTF8' 
  LC_COLLATE = 'en_US.UTF-8' 
  LC_CTYPE = 'en_US.UTF-8';

-- Даем права на базу
GRANT ALL PRIVILEGES ON DATABASE dxcapai_db TO dxcapai_user;
SQL

# Подключаемся к созданной базе и настраиваем схему
sudo -u postgres psql -d dxcapai_db << 'SQL'
-- Создаем схему
CREATE SCHEMA IF NOT EXISTS app_schema;

-- Даем права на схему
GRANT ALL ON SCHEMA app_schema TO dxcapai_user;
GRANT ALL ON ALL TABLES IN SCHEMA app_schema TO dxcapai_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA app_schema TO dxcapai_user;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA app_schema TO dxcapai_user;

-- Устанавливаем права по умолчанию
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

-- Показываем результат
SELECT 'Database setup completed!' as status;
\l dxcapai_db
\dn
SQL

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
