export interface AuthToken {
  access_token: string;
}

export interface AuthContext {
  token: string | null;
  isAuthenticated: boolean;
}
