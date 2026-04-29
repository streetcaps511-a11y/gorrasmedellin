/**
 * 🚀 NITRO CACHE UTILITY
 * Maneja la persistencia de datos en sessionStorage para una experiencia instantánea.
 */

const CACHE_PREFIX = 'nitro_cache_v1_';

// 🧹 LIMPIEZA DE GHOSTS: Elimina rastros de localStorage de versiones anteriores
try {
  const oldPrefixes = ['nitro_cache_v1_', 'gm_cat_v2_'];
  Object.keys(localStorage).forEach(k => {
    if (oldPrefixes.some(p => k.startsWith(p))) {
      localStorage.removeItem(k);
    }
  });
} catch (e) {
  // Silenciar si hay problemas con localStorage (ej: modo incógnito)
}

export const NitroCache = {
  /**
   * Guarda datos en la caché persistente (ahora en sessionStorage)
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
      // 🛡️ Silenciar errores de cuota
      if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        console.warn(`⚠️ [NitroCache] Storage full for ${key}. skipping save.`);
        if (!window._nitro_cleaned) {
          sessionStorage.clear(); 
          window._nitro_cleaned = true;
        }
      } else {
        console.error(`❌ [NitroCache] Error saving ${key}:`, error);
      }
    }
  },

  /**
   * Recupera datos de la caché.
   */
  get: (key, defaultValue = null, maxAgeMs = null) => {
    try {
      const saved = sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!saved) return defaultValue;
      
      const parsed = JSON.parse(saved);

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
