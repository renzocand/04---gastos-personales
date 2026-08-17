# Gastos Personales

Aplicación para gestión de gastos personales con OCR y bot de Telegram.

## Arquitectura

- **backend/**: API REST en Spring Boot (Java 17)
- **frontend/**: SPA en Angular 21 con NgRx, Tailwind CSS
- **telegram-bot/**: Bot de Telegram en Python para registro de gastos
- **ocr-service/**: Servicio OCR para procesar boletas

## Configuración

### Variables de entorno

Copiar `.env.example` a `.env` y configurar:

```bash
cp .env.example .env
```

Variables requeridas:
- `TELEGRAM_BOT_TOKEN`: Token del bot de Telegram
- `GEMINI_API_KEY`: API key de Google Gemini (https://aistudio.google.com/apikey)
- `GEMINI_MODEL`: Modelo de Gemini (default: `gemini-flash-latest`)

### Docker

```bash
docker compose up -d
```

## Servicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| frontend | 3080 | Interfaz web (Angular + nginx) |
| backend | 8080 | API REST (Spring Boot) |
| ocr-service | 8081 | Procesamiento OCR |
| mysql | 3307 | Base de datos |

## Funcionalidades principales

### Dashboard
- Gráfico de dona interactivo (top 5 categorías + "Otros")
- Gráfico de barras apiladas por categoría (tendencia diaria)
- Tabla de gastos del mes con scroll virtual (@angular/cdk)
- Filtrado: clic en categoría del donut filtra la tabla
- Ordenamiento por fecha o monto

### Categorías personalizadas
- Cada usuario tiene sus propias categorías
- Color personalizable (paleta del sistema + color picker)
- Iconos dinámicos desde CDN de Lucide (+1400 iconos)
- Los colores se reflejan en todos los gráficos

### Bot de Telegram

El bot permite registrar gastos de dos formas:
1. **Foto de boleta**: Enviar imagen para OCR con Gemini
2. **Texto**: Enviar mensaje como "237 mantenimiento casa"

Comandos:
- `/start` - Bienvenida
- `/vincular CODIGO` - Vincular cuenta
- `/desvincular` - Desvincular cuenta
- `/estado` - Ver estado de vinculación

## Stack técnico

### Frontend
- Angular 21 (standalone components, signals)
- NgRx (store, effects, entity)
- Tailwind CSS 4
- Chart.js para gráficos
- Lucide icons (CDN para categorías)
- @angular/cdk (virtual scroll)

### Backend
- Spring Boot 3
- Java 17
- MySQL 8.4
- Flyway (migraciones)
- JWT para autenticación
