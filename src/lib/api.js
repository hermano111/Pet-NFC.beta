/**
 * Envía notificación al dueño de la mascota vía WhatsApp
 * @param {Object} data - Datos de la notificación
 * @param {string} data.petId - ID de la mascota
 * @param {string} data.petName - Nombre de la mascota
 * @param {string} data.ownerPhone - Teléfono del dueño
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function notifyOwner({ petId, petName, ownerPhone }) {
  try {
    const payload = {
      petId,
      petName,
      ownerPhone,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    console.log('📡 Enviando notificación:', payload)

    const response = await fetch('/.netlify/functions/notify-whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}`)
    }

    return result
  } catch (error) {
    console.error('❌ Error en notifyOwner:', error)
    return { ok: false, error: error.message }
  }
}