#!/usr/bin/env python3
"""
Bot de Telegram para procesar boletas con OCR.

Comandos:
- /start - Mensaje de bienvenida
- /vincular CODIGO - Vincula tu cuenta de gastos
- /desvincular - Desvincula esta cuenta de Telegram
- /estado - Muestra si estás vinculado

Uso:
- Envía una foto de tu boleta y el bot la procesará automáticamente
"""

import os
import logging
import uuid
import httpx
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    ContextTypes,
    filters,
)
from telegram.request import HTTPXRequest

# Configuración
TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
OCR_SERVICE_URL = os.getenv("OCR_SERVICE_URL", "http://localhost:8081")
BACKEND_URL = os.getenv("GASTOS_BACKEND_URL", "http://localhost:8080")

# Logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

# Mapeo de IDs de categoría a nombres descriptivos
CATEGORY_NAMES = {
    "food": "Comida",
    "transport": "Transporte",
    "housing": "Vivienda",
    "services": "Servicios",
    "health": "Salud",
    "education": "Educación",
    "leisure": "Ocio",
    "shopping": "Compras personales",
    "home": "Hogar",
    "other": "Otro",
}

# Almacenamiento temporal de boletas pendientes de confirmación
pending_receipts = {}


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Mensaje de bienvenida."""
    user = update.effective_user
    await update.message.reply_text(
        f"¡Hola {user.first_name}! 👋\n\n"
        "Soy el bot de Gastos Personales. Puedo procesar tus boletas automáticamente.\n\n"
        "📋 *Cómo empezar:*\n"
        "1. Ve a la web y genera un código de vinculación\n"
        "2. Envíame: /vincular CODIGO\n"
        "3. ¡Listo! Ahora solo envía fotos de tus boletas\n\n"
        "📸 *Uso:*\n"
        "Envía una foto de tu boleta y la procesaré con OCR.\n\n"
        "*Comandos:*\n"
        "/vincular CODIGO - Vincula tu cuenta\n"
        "/desvincular - Desvincula esta cuenta\n"
        "/estado - Ver estado de vinculación",
        parse_mode="Markdown",
    )


async def vincular(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Vincula la cuenta de Telegram con la cuenta de gastos."""
    if not context.args:
        await update.message.reply_text(
            "❌ Uso: /vincular CODIGO\n\n"
            "Genera el código en la web, en Configuración > Telegram."
        )
        return

    code = context.args[0].upper()
    user = update.effective_user

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BACKEND_URL}/api/telegram/link",
                json={
                    "code": code,
                    "telegramId": user.id,
                    "telegramUsername": user.username,
                    "telegramName": user.full_name,
                },
                timeout=30.0,
            )

            if response.status_code == 200:
                data = response.json()
                await update.message.reply_text(
                    f"✅ ¡Vinculado correctamente!\n\n"
                    f"Hola {data['firstName']} {data['lastName']}.\n"
                    f"Ahora puedes enviarme fotos de tus boletas."
                )
            elif response.status_code == 404:
                await update.message.reply_text(
                    "❌ Código inválido o expirado.\n"
                    "Genera uno nuevo en la web."
                )
            elif response.status_code == 400:
                error = response.json().get("message", "Error desconocido")
                await update.message.reply_text(f"❌ {error}")
            else:
                await update.message.reply_text(
                    "❌ Error al vincular. Intenta de nuevo."
                )

    except httpx.RequestError as e:
        logger.error(f"Error connecting to backend: {e}")
        await update.message.reply_text(
            "❌ No pude conectar con el servidor. Intenta más tarde."
        )


async def desvincular(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Desvincula esta cuenta de Telegram."""
    user = update.effective_user

    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{BACKEND_URL}/api/telegram/unlink-by-telegram/{user.id}",
                timeout=30.0,
            )

            if response.status_code == 204:
                await update.message.reply_text(
                    "✅ Cuenta desvinculada.\n"
                    "Ya no recibirás confirmaciones de gastos aquí."
                )
            elif response.status_code == 404:
                await update.message.reply_text(
                    "ℹ️ Esta cuenta de Telegram no está vinculada."
                )
            else:
                await update.message.reply_text(
                    "❌ Error al desvincular. Intenta de nuevo."
                )

    except httpx.RequestError as e:
        logger.error(f"Error connecting to backend: {e}")
        await update.message.reply_text(
            "❌ No pude conectar con el servidor. Intenta más tarde."
        )


async def estado(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Muestra el estado de vinculación."""
    user = update.effective_user

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BACKEND_URL}/api/telegram/user/{user.id}",
                timeout=30.0,
            )

            if response.status_code == 200:
                data = response.json()
                await update.message.reply_text(
                    f"✅ *Cuenta vinculada*\n\n"
                    f"Usuario: {data['firstName']} {data['lastName']}\n"
                    f"DNI: {data['dni']}\n\n"
                    "Envía una foto de boleta para procesarla.",
                    parse_mode="Markdown",
                )
            elif response.status_code == 404:
                await update.message.reply_text(
                    "❌ *No estás vinculado*\n\n"
                    "Usa /vincular CODIGO para vincular tu cuenta.",
                    parse_mode="Markdown",
                )
            else:
                await update.message.reply_text(
                    "❌ Error al consultar estado."
                )

    except httpx.RequestError as e:
        logger.error(f"Error connecting to backend: {e}")
        await update.message.reply_text(
            "❌ No pude conectar con el servidor."
        )


async def process_photo(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Procesa una foto de boleta."""
    user = update.effective_user

    # Verificar vinculación
    try:
        async with httpx.AsyncClient() as client:
            user_response = await client.get(
                f"{BACKEND_URL}/api/telegram/user/{user.id}",
                timeout=30.0,
            )

            if user_response.status_code != 200:
                await update.message.reply_text(
                    "❌ Primero debes vincular tu cuenta.\n"
                    "Usa: /vincular CODIGO"
                )
                return

            user_data = user_response.json()

    except httpx.RequestError as e:
        logger.error(f"Error checking user: {e}")
        await update.message.reply_text("❌ Error de conexión. Intenta más tarde.")
        return

    # Obtener la foto de mayor resolución
    photo = update.message.photo[-1]

    await update.message.reply_text("📸 Procesando tu boleta... esto puede tomar unos minutos.")

    try:
        # Descargar la foto
        photo_file = await photo.get_file()
        photo_bytes = await photo_file.download_as_bytearray()

        # Enviar al servicio OCR
        async with httpx.AsyncClient(timeout=httpx.Timeout(600.0)) as client:
            files = {"image": ("boleta.jpg", bytes(photo_bytes), "image/jpeg")}
            ocr_response = await client.post(
                f"{OCR_SERVICE_URL}/api/ocr/process",
                files=files,
            )

            if ocr_response.status_code != 200:
                await update.message.reply_text(
                    "❌ Error procesando la imagen. Intenta con otra foto."
                )
                return

            ocr_data = ocr_response.json()

        # Generar UUID para esta boleta
        receipt_id = str(uuid.uuid4())

        # Guardar datos en almacenamiento temporal
        pending_receipts[receipt_id] = ocr_data

        # Mostrar resultado
        items_text = "\n".join(
            f"  • {item['description']}: S/ {item['amount']:.2f} — {CATEGORY_NAMES.get(item['categoryId'], item['categoryId'])}"
            for item in ocr_data.get("items", [])
        )

        result_message = (
            f"✅ *Boleta procesada*\n\n"
            f"🏪 *Tienda:* {ocr_data.get('vendor', 'No detectado')}\n"
            f"📅 *Fecha:* {ocr_data.get('date', 'No detectada')}\n"
            f"💰 *Total:* S/ {ocr_data.get('total', 0):.2f}\n\n"
            f"📝 *Items:*\n{items_text if items_text else '  No se detectaron items'}\n\n"
            f"⏱️ Procesado en {ocr_data.get('processingTimeMs', 0) / 1000:.1f}s"
        )

        # Crear inline keyboard con botones de confirmación
        if ocr_data.get("items"):
            keyboard = [
                [
                    InlineKeyboardButton("✅ Guardar", callback_data=f"save:{receipt_id}"),
                    InlineKeyboardButton("✏️ Corregir categoría", callback_data=f"fix_category:{receipt_id}"),
                ]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            await update.message.reply_text(result_message, parse_mode="Markdown", reply_markup=reply_markup)
        else:
            await update.message.reply_text(result_message, parse_mode="Markdown")

    except httpx.RequestError as e:
        logger.error(f"Error processing photo: {e}")
        await update.message.reply_text(
            "❌ Error procesando la imagen. El servicio OCR no responde."
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        await update.message.reply_text(
            "❌ Error inesperado. Intenta de nuevo."
        )


def build_summary_message(ocr_data: dict) -> str:
    """Construye el mensaje de resumen de la boleta."""
    items_text = "\n".join(
        f"  • {item['description']}: S/ {item['amount']:.2f} — {CATEGORY_NAMES.get(item['categoryId'], item['categoryId'])}"
        for item in ocr_data.get("items", [])
    )

    return (
        f"✅ *Boleta procesada*\n\n"
        f"🏪 *Tienda:* {ocr_data.get('vendor', 'No detectado')}\n"
        f"📅 *Fecha:* {ocr_data.get('date', 'No detectada')}\n"
        f"💰 *Total:* S/ {ocr_data.get('total', 0):.2f}\n\n"
        f"📝 *Items:*\n{items_text if items_text else '  No se detectaron items'}"
    )


def build_summary_keyboard(receipt_id: str) -> InlineKeyboardMarkup:
    """Construye el teclado del resumen de boleta."""
    keyboard = [
        [
            InlineKeyboardButton("✅ Guardar", callback_data=f"save:{receipt_id}"),
            InlineKeyboardButton("✏️ Corregir categoría", callback_data=f"fix_category:{receipt_id}"),
        ]
    ]
    return InlineKeyboardMarkup(keyboard)


def build_items_keyboard(receipt_id: str, items: list) -> InlineKeyboardMarkup:
    """Construye el teclado con la lista de items para editar."""
    keyboard = []
    for index, item in enumerate(items):
        category_name = CATEGORY_NAMES.get(item['categoryId'], item['categoryId'])
        button_text = f"{item['description']} - {category_name}"
        keyboard.append([InlineKeyboardButton(button_text, callback_data=f"edit_item:{receipt_id}:{index}")])

    keyboard.append([InlineKeyboardButton("⬅️ Volver", callback_data=f"back_to_summary:{receipt_id}")])
    return InlineKeyboardMarkup(keyboard)


def build_categories_keyboard(receipt_id: str, item_index: int) -> InlineKeyboardMarkup:
    """Construye el teclado grid de categorías (2 por fila)."""
    categories = [
        ("food", "Comida"),
        ("transport", "Transporte"),
        ("housing", "Vivienda"),
        ("services", "Servicios"),
        ("health", "Salud"),
        ("education", "Educación"),
        ("leisure", "Ocio"),
        ("shopping", "Compras personales"),
        ("home", "Hogar"),
        ("other", "Otro"),
    ]

    keyboard = []
    for i in range(0, len(categories), 2):
        row = []
        for cat_id, cat_name in categories[i:i+2]:
            row.append(InlineKeyboardButton(cat_name, callback_data=f"set_cat:{receipt_id}:{item_index}:{cat_id}"))
        keyboard.append(row)

    keyboard.append([InlineKeyboardButton("⬅️ Cancelar", callback_data=f"back_to_items:{receipt_id}")])
    return InlineKeyboardMarkup(keyboard)


async def save_receipt_to_backend(query, user, receipt_id: str, ocr_data: dict) -> None:
    """Guarda el recibo en el backend y muestra el resultado."""
    items = ocr_data.get("items", [])
    date = ocr_data.get("date", "")
    vendor = ocr_data.get("vendor", "")
    total = ocr_data.get("total", 0)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BACKEND_URL}/api/telegram/expenses",
                json={
                    "telegramId": user.id,
                    "vendor": vendor,
                    "date": date,
                    "total": total,
                    "items": [
                        {
                            "description": item["description"],
                            "amount": item["amount"],
                            "categoryId": item["categoryId"]
                        }
                        for item in items
                    ]
                },
                timeout=30.0,
            )

            if response.status_code == 200:
                if receipt_id in pending_receipts:
                    del pending_receipts[receipt_id]
                saved_count = len(items)
                await query.edit_message_text(
                    f"✅ *{saved_count} gastos guardados correctamente*\n\n"
                    f"Puedes verlos en la web.",
                    parse_mode="Markdown"
                )
            elif response.status_code == 404:
                await query.edit_message_text(
                    "❌ Tu cuenta de Telegram no está vinculada.\n"
                    "Usa /vincular CODIGO para vincularla primero."
                )
            else:
                error = response.json().get("message", "Error desconocido")
                await query.edit_message_text(f"❌ Error al guardar: {error}")

    except httpx.RequestError as e:
        logger.error(f"Error saving receipt: {e}")
        await query.edit_message_text(
            "❌ No pude conectar con el servidor. Intenta de nuevo."
        )


async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Maneja los callbacks de los inline keyboards."""
    query = update.callback_query
    await query.answer()

    # Parsear callback_data
    parts = query.data.split(":")
    action = parts[0]

    if len(parts) < 2:
        return

    receipt_id = parts[1]

    # Verificar si la boleta existe
    if receipt_id not in pending_receipts:
        await query.edit_message_text("⚠️ Esta boleta expiró. Envía la foto de nuevo.")
        return

    ocr_data = pending_receipts[receipt_id]

    if action == "save":
        # Verificar duplicados antes de guardar
        user = query.from_user
        items = ocr_data.get("items", [])
        date = ocr_data.get("date", "")
        vendor = ocr_data.get("vendor", "")
        total = ocr_data.get("total", 0)

        try:
            async with httpx.AsyncClient() as client:
                # Verificar si es duplicado
                check_response = await client.get(
                    f"{BACKEND_URL}/api/telegram/check-duplicate",
                    params={
                        "telegramId": user.id,
                        "vendor": vendor,
                        "date": date,
                        "total": total
                    },
                    timeout=30.0,
                )

                if check_response.status_code == 200:
                    check_data = check_response.json()
                    if check_data.get("isDuplicate"):
                        # Es duplicado, preguntar al usuario
                        keyboard = [
                            [
                                InlineKeyboardButton("✅ Sí, guardar de todos modos", callback_data=f"force_save:{receipt_id}"),
                                InlineKeyboardButton("❌ No, cancelar", callback_data=f"cancel_save:{receipt_id}"),
                            ]
                        ]
                        reply_markup = InlineKeyboardMarkup(keyboard)
                        await query.edit_message_text(
                            "⚠️ *Esta boleta parece duplicada*\n\n"
                            "Ya existe una con el mismo vendor, fecha y total.\n"
                            "¿Guardar de todas formas?",
                            parse_mode="Markdown",
                            reply_markup=reply_markup
                        )
                        return

                # No es duplicado o no se pudo verificar, guardar normalmente
                await save_receipt_to_backend(query, user, receipt_id, ocr_data)

        except httpx.RequestError as e:
            logger.error(f"Error checking duplicate: {e}")
            # Si falla la verificación, intentar guardar de todas formas
            await save_receipt_to_backend(query, user, receipt_id, ocr_data)

    elif action == "force_save":
        # Guardar sin verificar duplicados
        user = query.from_user
        await save_receipt_to_backend(query, user, receipt_id, ocr_data)

    elif action == "cancel_save":
        # Cancelar guardado
        del pending_receipts[receipt_id]
        await query.edit_message_text(
            "❌ *Guardado cancelado*\n\n"
            "La boleta no fue guardada.",
            parse_mode="Markdown"
        )

    elif action == "fix_category":
        # Mostrar lista de items
        items = ocr_data.get("items", [])
        message = "*Selecciona el item a editar:*"
        keyboard = build_items_keyboard(receipt_id, items)
        await query.edit_message_text(message, parse_mode="Markdown", reply_markup=keyboard)

    elif action == "edit_item":
        # Mostrar grid de categorías
        if len(parts) < 3:
            return
        item_index = int(parts[2])
        items = ocr_data.get("items", [])

        if item_index >= len(items):
            return

        item = items[item_index]
        message = f"*Selecciona la categoría para:*\n{item['description']}"
        keyboard = build_categories_keyboard(receipt_id, item_index)
        await query.edit_message_text(message, parse_mode="Markdown", reply_markup=keyboard)

    elif action == "set_cat":
        # Actualizar categoría del item
        if len(parts) < 4:
            return
        item_index = int(parts[2])
        new_category_id = parts[3]

        items = ocr_data.get("items", [])
        if item_index < len(items):
            items[item_index]['categoryId'] = new_category_id

        # Volver a mostrar lista de items
        message = "*Selecciona el item a editar:*"
        keyboard = build_items_keyboard(receipt_id, items)
        await query.edit_message_text(message, parse_mode="Markdown", reply_markup=keyboard)

    elif action == "back_to_summary":
        # Volver al resumen
        message = build_summary_message(ocr_data)
        keyboard = build_summary_keyboard(receipt_id)
        await query.edit_message_text(message, parse_mode="Markdown", reply_markup=keyboard)

    elif action == "back_to_items":
        # Volver a lista de items
        items = ocr_data.get("items", [])
        message = "*Selecciona el item a editar:*"
        keyboard = build_items_keyboard(receipt_id, items)
        await query.edit_message_text(message, parse_mode="Markdown", reply_markup=keyboard)


def main() -> None:
    """Inicia el bot."""
    if not TELEGRAM_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN not set!")
        return

    # Crear aplicación con timeouts extendidos para descargar fotos
    request = HTTPXRequest(
        connection_pool_size=8,
        read_timeout=60.0,
        write_timeout=60.0,
        connect_timeout=30.0,
    )
    application = (
        Application.builder()
        .token(TELEGRAM_TOKEN)
        .request(request)
        .get_updates_request(request)
        .build()
    )

    # Registrar handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("vincular", vincular))
    application.add_handler(CommandHandler("desvincular", desvincular))
    application.add_handler(CommandHandler("estado", estado))
    application.add_handler(MessageHandler(filters.PHOTO, process_photo))
    application.add_handler(CallbackQueryHandler(handle_callback))

    # Iniciar bot
    logger.info("Bot starting...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
