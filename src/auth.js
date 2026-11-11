import {
  createUser,
  verifyPassword,
  updateUser,
  setSession,
  getSessionUser,
  clearSession,
  findUserByEmail,
} from './utils/storage';

export function getSession() {
  return getSessionUser();
}

export function getToken() {
  return localStorage.getItem('ai_detector_token');
}

export async function register(name, email, password) {
  try {
    if (!name?.trim() || !email?.trim() || !password) {
      return { ok: false, error: 'Please fill all fields' };
    }
    if (password.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters' };
    }
    if (findUserByEmail(email)) {
      return { ok: false, error: 'Email already registered' };
    }
    const user = createUser({ name, email, password });
    setSession(user);
    return { ok: true, user };
  } catch (err) {
    return { ok: false, error: err.message || 'Registration failed' };
  }
}

export async function login(email, password) {
  try {
    if (!email?.trim() || !password) {
      return { ok: false, error: 'Please provide email and password' };
    }
    const user = verifyPassword(email, password);
    if (!user) {
      return { ok: false, error: 'Invalid credentials' };
    }
    setSession(user);
    return { ok: true, user };
  } catch (err) {
    return { ok: false, error: err.message || 'Login failed' };
  }
}

export function logout() {
  clearSession();
}

export async function verifySession() {
  const user = getSessionUser();
  if (!user) {
    clearSession();
    return null;
  }
  const fresh = findUserByEmail(user.email);
  if (!fresh) {
    clearSession();
    return null;
  }
  const sessionUser = { id: fresh.id, name: fresh.name, email: fresh.email };
  setSession(sessionUser);
  return sessionUser;
}

export async function updateProfile(updates) {
  try {
    const current = getSessionUser();
    if (!current) return { ok: false, error: 'Not authenticated' };
    const user = updateUser(current.id, updates);
    setSession(user);
    return { ok: true, user };
  } catch (err) {
    return { ok: false, error: err.message || 'Update failed' };
  }
}

export async function changePassword(currentPassword, newPassword) {
  try {
    const current = getSessionUser();
    if (!current) return { ok: false, error: 'Not authenticated' };
    if (!newPassword || newPassword.length < 6) {
      return { ok: false, error: 'New password must be at least 6 characters' };
    }
    const matched = verifyPassword(current.email, currentPassword);
    if (!matched) {
      return { ok: false, error: 'Current password is incorrect' };
    }
    updateUser(current.id, { password: newPassword });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message || 'Password change failed' };
  }
}
