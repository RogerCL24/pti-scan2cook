import bcrypt from "bcrypt";

const users = new Map();   // id -> { id, email, password }
const byEmail = new Map(); // email -> id

export const UsersRepo = {
  async create({ email, password }) {
    const id = crypto.randomUUID();
    const hashed = await bcrypt.hash(password, 10);
    const user = { id, email, password: hashed, createdAt: new Date().toISOString() };
    users.set(id, user);
    byEmail.set(email, id);
    return user; // devuelve con password hash por si lo necesitas internamente
  },
  async findByEmail(email) {
    const id = byEmail.get(email);
    return id ? users.get(id) : null;
  },
};
