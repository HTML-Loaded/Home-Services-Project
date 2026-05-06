import { clearTokens, setTokens } from './api';

export function isAuthed() {
  return Boolean(localStorage.getItem('access'));
}

export function logout() {
  clearTokens();
}

export function saveLogin(tokens) {
  setTokens(tokens);
}
