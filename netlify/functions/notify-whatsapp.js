// Rate limiting en memoria (se resetea con cada deploy)
const rateLimitMap = new Map()

// Configuración
const RATE_LIMIT_MINUTES = 5

/**
 * Obtiene la IP del cliente desde los headers
 */
function getClientIP(headers) {
  return headers['x-forwarded-for']?.split(',')[0]?.trim() || 
         headers['x-real-ip'] || 
         'unknown'
}

/**
 * Obtiene información geográfica aproximada desde la IP
 */
async function getLocationFromIP(ip) {
  if (ip === 'unknown' || ip === '127.0.0.1') {
    return { city: 'Desconocida', country: 'Desconocido', region: '' }
  }

  try {
    const geoProvider = process.env.GEO_PROVIDER_URL || 'https://ipapi.co'
    const response = await fetch(`${geoProvider}/${ip}/json/`, {
      timeout: 5000
    })
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    
    const data = await response.json()
    
    return {
      city: data.city || data.locality || 'Desconocida',
      country: data.country_name || data.country || 'Desconocido',
      region: data.region || data.state || ''
    }
  } catch (error) {
    console.log('⚠️ Error obteniendo geolocalización:', error.message)
    return { city: 'Desconocida', country: 'Desconocido', region: '' }
  }
}

/**
 * Verifica rate limiting
 */
function checkRateLimit(petId, ip) {
  const key = `${petId}|${ip}`
  const now = Date.now()
  const lastRequest = rateLimitMap.get(key)
  
  if (lastRequest && (now - lastRequest) < (RATE_LIMIT_MINUTES * 60 * 1000)) {
    return false // Rate limited
  }
  
  rateLimitMap.set(key, now)
  return true // OK to proceed
}

/**
 * Envía datos al webhook de n8n para procesar WhatsApp
 */
async function sendToN8nWebhook(petName, ownerPhone, location, timestamp) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  
  if (!webhookUrl) {
    throw new Error('URL del webhook de n8n no configurada')
  }

  const payload = {
    petName,
    ownerPhone,
    location,
    timestamp,
    // Datos adicionales que pueden ser útiles
    source: 'pet-nfc'
  }

  console.log('🔗 Enviando a webhook n8n:', { url: webhookUrl, petName, location })

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Error del webhook n8n:', errorText)
    throw new Error(`Error en webhook n8n: ${response.status} ${response.statusText}`)
  }

  const result = await response.json().catch(() => ({ success: true }))
  console.log('✅ Webhook n8n procesado exitosamente')
  
  return result
}

/**
 * Modo simulación para testing sin webhook real
 */
function simulateN8nWebhook(petName, ownerPhone, location, timestamp) {
  console.log('🧪 MODO SIMULACIÓN - Datos que se enviarían a n8n:')
  console.log('🐕 Mascota:', petName)
  console.log('📱 Teléfono:', ownerPhone)
  console.log('📍 Ubicación:', location)
  console.log('🕐 Timestamp:', timestamp)
  console.log('---')
  
  return {
    success: true,
    webhookId: 'simulated_' + Date.now()
  }
}

export const handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, error: 'Método no permitido' })
    }
  }

  try {
    // Parsear datos del request
    const { petId, petName, ownerPhone, timestamp, userAgent } = JSON.parse(event.body)
    
    if (!petId || !petName || !ownerPhone) {
      console.log('❌ Datos faltantes:', { petId, petName, ownerPhone })
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: 'Datos requeridos faltantes' })
      }
    }

    // Obtener IP y ubicación
    const clientIP = getClientIP(event.headers)
    console.log(`🔍 Procesando notificación - Pet: ${petId}, IP: ${clientIP}`)

    // Verificar rate limiting
    if (!checkRateLimit(petId, clientIP)) {
      console.log('⏰ Rate limit aplicado')
      return {
        statusCode: 429,
        body: JSON.stringify({ 
          ok: false, 
          error: 'Demasiadas notificaciones recientes. Espera unos minutos.' 
        })
      }
    }

    // Obtener ubicación aproximada
    const location = await getLocationFromIP(clientIP)
    
    // Preparar datos para n8n
    const locationText = location.city !== 'Desconocida' 
      ? `${location.city}, ${location.country}`
      : 'Ubicación no disponible'
    
    const formattedTimestamp = new Date().toISOString()
    
    // Enviar a webhook n8n (real o simulado)
    let webhookResult
    const isSimulationMode = !process.env.N8N_WEBHOOK_URL
    
    if (isSimulationMode) {
      console.log('🧪 Ejecutando en modo simulación')
      webhookResult = simulateN8nWebhook(petName, ownerPhone, locationText, formattedTimestamp)
    } else {
      webhookResult = await sendToN8nWebhook(petName, ownerPhone, locationText, formattedTimestamp)
    }

    // Log exitoso
    console.log('✅ Notificación procesada exitosamente:', {
      petId,
      petName,
      ownerPhone: ownerPhone.replace(/\d(?=\d{4})/g, '*'), // Ocultar parte del teléfono en logs
      location: locationText,
      timestamp: formattedTimestamp,
      webhookId: webhookResult.webhookId || webhookResult.success,
      isSimulation: isSimulationMode
    })

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        ok: true,
        webhookId: webhookResult.webhookId || 'success',
        location: locationText,
        timestamp: formattedTimestamp,
        isSimulation: isSimulationMode
      })
    }

  } catch (error) {
    console.error('❌ Error en notify-whatsapp:', error)
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        ok: false, 
        error: error.message || 'Error interno del servidor'
      })
    }
  }
}
