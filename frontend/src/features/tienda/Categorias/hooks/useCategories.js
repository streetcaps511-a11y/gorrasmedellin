/* === HOOK DE LÓGICA === 
   Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo. 
   Separa la 'inteligencia' de la interfaz visual para mantener el código limpio. 
   Recibe eventos de la UI y se comunica con los Servicios API. */

import { useState, useEffect, useMemo, useCallback } from "react";
import { getCategorias } from "../services/categoriasApi";
import { NitroCache } from "../../../shared/utils/NitroCache";
import { useSearch } from "../../../shared/contexts";

const CATS_CACHE_KEY = 'tienda_categorias';
const CATS_TTL = 30 * 1000; // 30 segundos

const getCachedCats = () => {
  const cached = NitroCache.get(CATS_CACHE_KEY);
  return cached?.data || [];
};

const imgPorCategoria = {
  "NIKE 1.1": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762950188/gorrarojaymorada9_sufoqt.jpg",
  "A/N 1.1": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762988183/negraconelescudo_zzh4l9.jpg",
  "BEISBOLERA PREMIUM": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910786/gorraazulblancoLA_rembf2.jpg",
  "DIAMANTE IMPORTADA": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762914412/gorraconrosas_ko3326.jpg",
  "EQUINAS-AGROPECUARIAS": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762916288/gorraazulcerdoverde_e10kc7.jpg",
  "EXCLUSIVA 1.1": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762956762/gorranube_jrten0.jpg",
  "MONASTERY 1.1": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762957919/gorramonasterygris_ij6ksq.jpg",
  "MULTIMARCA": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762957956/gorrablancachromebeart_amqbro.jpg",
  "PLANA CERRADA 1.1": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762988576/gorranegrajordan_arghad.jpg",
  "PLANA IMPORTADA": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762995130/gorranegraAA_zkdg1e.jpg",
  "PORTAGORRAS": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762994460/portagorras-1sencillo_xxe5hf.jpg",
  "PREMIUM": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762987076/gorrahugoboss_ev6z54.jpg",
  "camisetas": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1763002983/TALLA_M_3_youtflecha_hphfng.jpg",
  "default": "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1000&q=80",
};

export const useCategories = () => {
  const { searchTerm: searchQuery } = useSearch();
  const [categories, setCategories] = useState(() => getCachedCats());
  const [loading, setLoading] = useState(() => getCachedCats().length === 0);

  const fetchCats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCategorias();
      if (res?.data?.data) {
        const cats = res.data.data.map(c => ({
            id: c.id_categoria || c.id,
            Nombre: c.nombre_categoria || c.nombre,
            Descripcion: c.descripcion || '',
            ImagenUrl: c.imagenUrl || c.ImagenUrl || ''
        }));
        setCategories(cats);
        NitroCache.set(CATS_CACHE_KEY, cats);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setCategories([]);
      } else {
        console.error("Error fetching categories:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (NitroCache.isFresh(CATS_CACHE_KEY, CATS_TTL)) {
      setLoading(false);
    } else {
      fetchCats();
    }
    
    window.scrollTo(0, 0);

    // 📡 ESCUCHAR ACTUALIZACIONES DESDE OTRAS PESTAÑAS (Sync Instantáneo)
    const channel = new BroadcastChannel('app_sync');
    channel.onmessage = (event) => {
      if (event.data === 'categorias_updated') {
        NitroCache.clear(CATS_CACHE_KEY);
        fetchCats();
      }
    };

    return () => channel.close();
  }, [fetchCats]);

  const sortedCategories = useMemo(() => {
    let filtered = categories;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = categories.filter(cat => 
        cat.Nombre.toLowerCase().includes(query) ||
        cat.Descripcion?.toLowerCase().includes(query)
      );
    }

    return [...filtered].sort((a, b) => {
      if (a.Nombre?.toLowerCase() === "camisetas") return 1;
      if (b.Nombre?.toLowerCase() === "camisetas") return -1;
      return 0;
    });
  }, [searchQuery, categories]);

  const getCategoryImage = (cat) => {
    if (cat.ImagenUrl) return cat.ImagenUrl;
    const normalizedName = cat.Nombre?.toUpperCase();
    return imgPorCategoria[normalizedName] || imgPorCategoria[cat.Nombre] || imgPorCategoria.default;
  };

  return {
    searchQuery,
    sortedCategories,
    loading,
    getCategoryImage,
    defaultImg: imgPorCategoria.default
  };
};
