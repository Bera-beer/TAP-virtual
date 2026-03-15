import { AuthService } from '@/core/application/AuthService';
import { AuthAdapter } from '../adapters/AuthAdapter';

const authAdapter = new AuthAdapter();
export const authService = new AuthService(authAdapter);
