// Debug script to check API URL configuration
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('All env vars:', import.meta.env);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
console.log('Resolved API_BASE_URL:', API_BASE_URL);
console.log('Full cart abandonment URL:', `${API_BASE_URL}/cart-abandonment/abandoned-carts`);
