/**
 * Formata um valor numérico para o formato de moeda brasileira
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado como R$ 0.000,00
 */
export function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata uma data para o formato brasileiro DD/MM/AAAA
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data formatada como DD/MM/AAAA
 */
export function formatDate(date) {
  if (!date) return '';
  
  const d = new Date(date);
  
  // Ajusta para timezone local se a data vier como string ISO
  if (typeof date === 'string' && date.includes('T')) {
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
  }
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Converte uma data no formato DD/MM/AAAA para AAAA-MM-DD (formato ISO para inputs)
 * @param {string} dateStr - Data no formato DD/MM/AAAA
 * @returns {string} Data no formato AAAA-MM-DD
 */
export function dateToISO(dateStr) {
  if (!dateStr) return '';
  
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month}-${day}`;
}

/**
 * Converte uma data no formato AAAA-MM-DD para DD/MM/AAAA
 * @param {string} isoDate - Data no formato AAAA-MM-DD
 * @returns {string} Data no formato DD/MM/AAAA
 */
export function isoToDate(isoDate) {
  if (!isoDate) return '';
  
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}
