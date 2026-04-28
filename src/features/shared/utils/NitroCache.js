/**
 * 🚀 NITRO CACHE UTILITY
 * Maneja la persistencia de datos en sessionStorage para una experiencia instantánea.
 */

const CACHE_PREFIX = 'nitro_cache_v1_';

export const NitroCache = {
  /**
   * Guarda datos en la caché persistente
   */
  set: (key, data) => {
    try {
      const payload = {
        data,
        timestamp: Date.now(),
        isInitialized: true
      };
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(payload));
    } catch (error) {
      // 🛡️ Silenciar errores de cuota para no bloquear el dashboard
      if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        console.warn(`⚠️ [NitroCache] Storage full for ${key}. skipping save.`);
        // Intentar limpiar una vez pero no reintentar infinitamente
        if (!window._nitro_cleaned) {
          localStorage.clear(); 
          window._nitro_cleaned = true;
        }
      } else {
        console.error(`❌ [NitroCache] Error saving ${key}:`, error);
      }
    }
  },

  /**
   * Recupera datos de la caché.
   * @param {string} key - Clave del dato
   * @param {*} defaultValue - Valor por defecto si no existe
   * @param {number} [maxAgeMs] - Edad máxima en ms. Si el dato es más viejo, retorna defaultValue.
   */
  get: (key, defaultValue = null, maxAgeMs = null) => {
    try {
      const saved = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!saved) return defaultValue;
      
      const parsed = JSON.parse(saved);

      // Si se ha indicado maxAgeMs, verificar si el dato está expirado
      if (maxAgeMs != null && parsed.timestamp) {
        const age = Date.now() - parsed.timestamp;
        if (age > maxAgeMs) {
          localStorage.removeItem(`${CACHE_PREFIX}${key}`);
          return defaultValue;
        }
      }

      return parsed;
    } catch (error) {
      console.error(`❌ [NitroCache] Error reading ${key}:`, error);
      return defaultValue;
    }
  },

  /**
   * Verifica si una clave existe y no ha expirado
   * @param {string} key
   * @param {number} [maxAgeMs]
   */
  isFresh: (key, maxAgeMs = 60000) => {
    try {
      const saved = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!saved) return false;
      const parsed = JSON.parse(saved);
      if (!parsed?.timestamp) return false;
      return (Date.now() - parsed.timestamp) < maxAgeMs;
    } catch {
      return false;
    }
  },

  /**
   * Limpia una entrada o toda la caché
   */
  clear: (key = null) => {
    if (key) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } else {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(k);
        }
      });
    }
  }
};
