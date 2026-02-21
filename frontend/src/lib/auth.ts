export interface AuthUser {
  sub: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { sub: payload.sub, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem('token');
  window.location.href = '/login';
}
