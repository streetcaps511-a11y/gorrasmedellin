import { useState } from 'react';

/**
 * Hook para manejar los filtros del dashboard
 * @returns {Object} Estado y setters de filtros
 */
export const useDashboardFilters = () => {
  const currentYear = new Date().getFullYear().toString();
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [searchTerm, setSearchTerm] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const resetFilters = () => {
    setSelectedDay("");
    setSelectedMonth("");
    setSelectedYear(currentYear);
    setSearchTerm("");
    setProductSearch("");
    setCustomerSearch("");
  };

  return {
    selectedDay,
    setSelectedDay,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    searchTerm,
    setSearchTerm,
    productSearch,
    setProductSearch,
    customerSearch,
    setCustomerSearch,
    resetFilters,
  };
};
