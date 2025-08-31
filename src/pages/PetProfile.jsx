import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getPetById } from '../lib/supabase'
import { notifyOwner } from '../lib/api'
import Toast from '../components/Toast'
import Avatar from '../components/Avatar'
import Button from '../components/Button'

export default function PetProfile() {
  const { id } = useParams()
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState({ show: false, type: '', message: '' })

  useEffect(() => {
    if (!id) return

    // Actualizar título de la página
    document.title = `Cargando... - PetNFC`

    const loadPetAndNotify = async () => {
      try {
        setLoading(true)
        console.log('🐕 Cargando perfil de mascota:', id)

        // Cargar datos de la mascota
        const petData = await getPetById(id)
        if (!petData) {
          setError('Mascota no encontrada')
          return
        }

        setPet(petData)
        document.title = `${petData.name} - PetNFC`
        
        console.log('✅ Mascota cargada:', petData.name)

        // Verificar rate limit local (básico)
        const lastNotificationKey = `pet-notification-${id}`
        const lastNotification = localStorage.getItem(lastNotificationKey)
        const now = Date.now()
        
        if (lastNotification && (now - parseInt(lastNotification)) < 5 * 60 * 1000) {
          console.log('⏰ Rate limit activo - no enviar notificación')
          setNotification({
            show: true,
            type: 'info',
            message: 'Ya se envió un aviso reciente al dueño'
          })
          return
        }

        // Intentar notificar al dueño
        try {
          console.log('📱 Enviando notificación al dueño...')
          const result = await notifyOwner({
            petId: id,
            petName: petData.name,
            ownerPhone: petData.owner_phone_e164
          })

          if (result.ok) {
            localStorage.setItem(lastNotificationKey, now.toString())
            setNotification({
              show: true,
              type: 'success',
              message: 'Aviso enviado al dueño por WhatsApp ✓'
            })
            console.log('✅ Notificación enviada exitosamente')
          } else {
            throw new Error(result.error || 'Error al enviar notificación')
          }
        } catch (notificationError) {
          console.error('❌ Error al notificar:', notificationError)
          setNotification({
            show: true,
            type: 'error',
            message: 'No pudimos notificar automáticamente. Intentá WhatsApp o Llamar'
          })
        }

      } catch (err) {
        console.error('❌ Error cargando mascota:', err)
        setError('Error al cargar los datos de la mascota')
      } finally {
        setLoading(false)
      }
    }

    loadPetAndNotify()
  }, [id])

  const handleWhatsApp = () => {
    if (!pet) return
    const message = `Hola, encontré a ${pet.name}`
    const url = `https://wa.me/${pet.owner_phone_e164}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
    console.log('📱 Abriendo WhatsApp:', url)
  }

  const handleCall = () => {
    if (!pet) return
    window.location.href = `tel:${pet.owner_phone_e164}`
    console.log('☎️ Iniciando llamada:', pet.owner_phone_e164)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-white border border-border rounded-2xl shadow-sm p-8 w-full max-w-sm text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-white border border-border rounded-2xl shadow-sm p-8 w-full max-w-sm text-center">
          <div className="text-6xl mb-4">🐕</div>
          <h2 className="text-xl font-semibold text-text mb-2">Oops!</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Intentar de nuevo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {notification.show && (
        <Toast
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}

      <div className="bg-white border border-border rounded-2xl shadow-sm p-6 w-full max-w-sm animate-slide-up">
        {/* Avatar de la mascota */}
        <div className="text-center mb-6">
          <Avatar 
            src={pet.photo_url} 
            alt={pet.name}
            size="lg"
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-text mb-1">{pet.name}</h1>
          <p className="text-slate-600 text-sm">
            Si encontraste a {pet.name}, por favor contacta a su dueño
          </p>
        </div>

        {/* Información de contacto */}
        <div className="mb-6">
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-slate-600 mb-1">Teléfono del dueño:</p>
            <p className="font-semibold text-text">{pet.owner_phone_e164}</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full"
            onClick={handleWhatsApp}
          >
            <span className="text-lg mr-2">📱</span>
            Enviar WhatsApp
          </Button>
          
          <Button 
            variant="secondary" 
            size="lg" 
            className="w-full"
            onClick={handleCall}
          >
            <span className="text-lg mr-2">📞</span>
            Llamar ahora
          </Button>
        </div>

        {/* Información adicional */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            PetNFC • Chapita inteligente para mascotas
          </p>
        </div>
      </div>
    </div>
  )
}