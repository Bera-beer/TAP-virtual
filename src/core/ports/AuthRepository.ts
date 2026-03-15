import type { AuthToken } from '../domain/auth';

export interface AuthRepository {
  login(): Promise<AuthToken>;
}
