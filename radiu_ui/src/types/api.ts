// types/api.ts
export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  message?: string;
}