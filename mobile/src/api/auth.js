import client from './client'

export const login = (email, password) => {
  console.log(">> LOGIN body:", { email, password })
  return client.post('/auth/login', { email, password }).then(r => r.data)
}

export const register = (name, email, password) => {
  console.log(">> REGISTER body:", { name, email, password })
  return client.post('/auth/register', { name, email, password }).then(r => r.data)
}
