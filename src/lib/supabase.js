import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan variables de entorno de Supabase')
  throw new Error('Configuración de Supabase incompleta')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Obtiene los datos de una mascota por ID
 * @param {string} id - ID de la mascota
 * @returns {Promise<Object|null>} Datos de la mascota o null si no existe
 */
export async function getPetById(id) {
  try {
    console.log('🔍 Consultando Supabase para mascota:', id)
    
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ Mascota no encontrada:', id)
        return null
      }
      throw error
    }

    console.log('✅ Mascota encontrada en Supabase:', data.name)
    return data
  } catch (error) {
    console.error('❌ Error consultando Supabase:', error)
    throw new Error('Error al consultar la base de datos')
  }
}