import type { AuthRepository } from '../ports/AuthRepository';

export class AuthService {
  private repository: AuthRepository;
  private currentToken: string | null = null;

  constructor(repository: AuthRepository) {
    this.repository = repository;
  }

  async initializeAuth(): Promise<void> {
    try {
      const response = await this.repository.login();
      if (response && response.access_token) {
        this.currentToken = response.access_token;
        localStorage.setItem('admin_token', this.currentToken);
        console.log('Admin authentication successful, token stored.');
      }
    } catch (error) {
      console.error('Admin authentication failed during initialization:', error);
    }
  }

  getToken(): string | null {
    if (this.currentToken) return this.currentToken;
    return localStorage.getItem('admin_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
