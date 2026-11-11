/**
 * Pure client-side data layer (localStorage).
 * No backend / MongoDB required.
 */

const USERS_KEY = 'ai_detector_users';
const ANALYSES_KEY = 'ai_detector_analyses';
const TOKEN_KEY = 'ai_detector_token';
const USER_KEY = 'ai_detector_user';

function uid() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Users ───────────────────────────────────────────────

export function getUsers() {
  return read(USERS_KEY, []);
}

export function saveUsers(users) {
  write(USERS_KEY, users);
}

export function findUserByEmail(email) {
  const normalized = email.toLowerCase().trim();
  return getUsers().find((u) => u.email === normalized) || null;
}

export function createUser({ name, email, password }) {
  const users = getUsers();
  const normalized = email.toLowerCase().trim();
  if (users.some((u) => u.email === normalized)) {
    throw new Error('Email already registered');
  }
  const user = {
    id: uid(),
    name: name.trim(),
    email: normalized,
    password, // plain for local demo – never do this in production with a real server
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return { id: user.id, name: user.name, email: user.email };
}

export function updateUser(id, updates) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('User not found');
  if (updates.name) users[idx].name = updates.name.trim();
  if (updates.email) {
    const normalized = updates.email.toLowerCase().trim();
    if (users.some((u) => u.email === normalized && u.id !== id)) {
      throw new Error('Email already registered');
    }
    users[idx].email = normalized;
  }
  if (updates.password) users[idx].password = updates.password;
  saveUsers(users);
  return { id: users[idx].id, name: users[idx].name, email: users[idx].email };
}

export function verifyPassword(email, password) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) return null;
  return { id: user.id, name: user.name, email: user.email };
}

// ─── Session ─────────────────────────────────────────────

export function setSession(user) {
  const token = `local_${user.id}_${Date.now()}`;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return token;
}

export function getSessionUser() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    if (!token || !raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ─── Analyses ────────────────────────────────────────────

export function getAnalyses(userId) {
  const all = read(ANALYSES_KEY, []);
  return all
    .filter((a) => a.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getAnalysis(id, userId) {
  return getAnalyses(userId).find((a) => a.id === id) || null;
}

export function saveAnalysis(userId, data) {
  const all = read(ANALYSES_KEY, []);
  const entry = {
    id: uid(),
    userId,
    ...data,
    createdAt: new Date().toISOString(),
  };
  all.unshift(entry);
  // Keep last 200 per browser
  write(ANALYSES_KEY, all.slice(0, 200));
  return entry;
}

export function deleteAnalysis(id, userId) {
  const all = read(ANALYSES_KEY, []);
  write(
    ANALYSES_KEY,
    all.filter((a) => !(a.id === id && a.userId === userId))
  );
}

export function deleteAnalyses(ids, userId) {
  const set = new Set(ids);
  const all = read(ANALYSES_KEY, []);
  write(
    ANALYSES_KEY,
    all.filter((a) => !(set.has(a.id) && a.userId === userId))
  );
}

export function getStats(userId) {
  const list = getAnalyses(userId);
  const total = list.length;
  if (total === 0) {
    return {
      total: 0,
      totalWords: 0,
      avgAi: 0,
      avgHuman: 0,
      aiLike: 0,
      humanLike: 0,
      mixed: 0,
      thisWeek: 0,
      thisMonth: 0,
      weeklyActivity: [],
      monthlyActivity: [],
      recent: [],
    };
  }

  let sumAi = 0;
  let totalWords = 0;
  let aiLike = 0;
  let humanLike = 0;
  let mixed = 0;
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  let thisWeek = 0;
  let thisMonth = 0;

  // last 7 days
  const dayMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayMap[key] = { date: key, label: d.toLocaleDateString(undefined, { weekday: 'short' }), count: 0, ai: 0, human: 0, mixed: 0 };
  }

  // last 6 months
  const monthMap = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthMap[key] = {
      month: key,
      label: d.toLocaleDateString(undefined, { month: 'short' }),
      count: 0,
      ai: 0,
      human: 0,
      mixed: 0,
    };
  }

  list.forEach((a) => {
    const ai = a.aiScore ?? a.aiProbability ?? 50;
    const human = a.humanScore ?? a.humanProbability ?? 100 - ai;
    sumAi += ai;
    totalWords += a.wordCount || 0;

    if (ai >= 65) aiLike++;
    else if (human >= 65) humanLike++;
    else mixed++;

    const created = new Date(a.createdAt);
    if (created >= weekAgo) thisWeek++;
    if (created >= monthAgo) thisMonth++;

    const dayKey = a.createdAt.slice(0, 10);
    if (dayMap[dayKey]) {
      dayMap[dayKey].count++;
      if (ai >= 65) dayMap[dayKey].ai++;
      else if (human >= 65) dayMap[dayKey].human++;
      else dayMap[dayKey].mixed++;
    }

    const monthKey = a.createdAt.slice(0, 7);
    if (monthMap[monthKey]) {
      monthMap[monthKey].count++;
      if (ai >= 65) monthMap[monthKey].ai++;
      else if (human >= 65) monthMap[monthKey].human++;
      else monthMap[monthKey].mixed++;
    }
  });

  return {
    total,
    totalWords,
    avgAi: Math.round(sumAi / total),
    avgHuman: Math.round(100 - sumAi / total),
    aiLike,
    humanLike,
    mixed,
    thisWeek,
    thisMonth,
    weeklyActivity: Object.values(dayMap),
    monthlyActivity: Object.values(monthMap),
    recent: list.slice(0, 5).map((a) => ({
      ...a,
      _id: a.id,
    })),
  };
}
