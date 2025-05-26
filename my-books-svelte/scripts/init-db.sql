-- Script de inicialización para MyBooks
-- Este script se ejecuta automáticamente cuando se crea la base de datos

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Mensaje de bienvenida
DO $$
BEGIN
    RAISE NOTICE '🚀 Inicializando base de datos MyBooks...';
END $$; 