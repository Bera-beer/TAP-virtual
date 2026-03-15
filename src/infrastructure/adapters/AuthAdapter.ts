import type { AuthRepository } from '@/core/ports/AuthRepository';
import type { AuthToken } from '@/core/domain/auth';

export class AuthAdapter implements AuthRepository {
  async login(): Promise<AuthToken> {
    const apiUrl = import.meta.env.VITE_API_URL;
    const email = import.meta.env.VITE_ADMIN_USER;
    const password = import.meta.env.VITE_ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error('Admin credentials not found in environment');
    }

    const response = await fetch(`${apiUrl}/admin-auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to login admin: ${response.status} ${response.statusText} ${errorText}`);
    }

    return await response.json();
  }
}
