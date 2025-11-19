import api from './api';

export const registerUser = async (name, email, password) => {
  const res = await api.post('/auth/register', { name, email, password });
  console.log('RAW registerUser response:', res.data); // <-- añade esto
  return res.data;
};

export const loginUser = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  console.log('RAW loginUser response:', res.data); // <-- añade esto
  return res.data;
};
