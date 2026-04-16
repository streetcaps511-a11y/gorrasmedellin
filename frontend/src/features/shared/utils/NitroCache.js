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
      sessionStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(payload));
    } catch (error) {
      console.error(`❌ [NitroCache] Error saving ${key}:`, error);
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
      const saved = sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!saved) return defaultValue;
      
      const parsed = JSON.parse(saved);

      // Si se ha indicado maxAgeMs, verificar si el dato está expirado
      if (maxAgeMs != null && parsed.timestamp) {
        const age = Date.now() - parsed.timestamp;
        if (age > maxAgeMs) {
          sessionStorage.removeItem(`${CACHE_PREFIX}${key}`);
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
      const saved = sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
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
      sessionStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } else {
      Object.keys(sessionStorage).forEach(k => {
        if (k.startsWith(CACHE_PREFIX)) {
          sessionStorage.removeItem(k);
        }
      });
    }
  }
};
