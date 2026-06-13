import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/browser';
import { apiRequest } from '@/lib/api';

export type AuthLoginResponse = {
  token: string;
  username?: string;
  email?: string;
  role?: string;
};

export type PasskeySummary = {
  id: number;
  device_name: string;
  created_at: string;
  last_used_at: string | null;
};

export const requestMagicLink = (email: string) =>
  apiRequest<{ message: string }>('/auth/magic-link/request/', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim() }),
  });

export const verifyMagicLink = (token: string) =>
  apiRequest<AuthLoginResponse>('/auth/magic-link/verify/', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });

export const requestOtp = (email: string, purpose: 'login_otp' | 'password_reset') =>
  apiRequest<{ message: string }>('/auth/otp/request/', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), purpose }),
  });

export const verifyOtpLogin = (email: string, code: string) =>
  apiRequest<AuthLoginResponse>('/auth/otp/verify-login/', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), code: code.trim() }),
  });

export const verifyOtpPasswordReset = (
  email: string,
  code: string,
  password: string,
  confirmPassword?: string
) =>
  apiRequest<{ message: string }>('/auth/otp/verify-password-reset/', {
    method: 'POST',
    body: JSON.stringify({
      email: email.trim(),
      code: code.trim(),
      password,
      confirm_password: confirmPassword ?? password,
    }),
  });

export const passkeyLoginOptions = (email?: string) =>
  apiRequest<{
    options: PublicKeyCredentialRequestOptionsJSON;
    challenge: string;
  }>('/auth/passkeys/login/options/', {
    method: 'POST',
    body: JSON.stringify(email ? { email: email.trim() } : {}),
  });

export const passkeyLoginVerify = (credential: AuthenticationResponseJSON, challenge: string) =>
  apiRequest<AuthLoginResponse>('/auth/passkeys/login/verify/', {
    method: 'POST',
    body: JSON.stringify({ credential, challenge }),
  });

export const passkeyRegisterOptions = () =>
  apiRequest<{
    options: PublicKeyCredentialCreationOptionsJSON;
    challenge: string;
  }>('/auth/passkeys/register/options/', { method: 'POST', body: JSON.stringify({}) });

export const passkeyRegisterVerify = (
  credential: RegistrationResponseJSON,
  challenge: string,
  deviceName?: string
) =>
  apiRequest<{ message: string; device_name: string }>('/auth/passkeys/register/verify/', {
    method: 'POST',
    body: JSON.stringify({
      credential,
      challenge,
      device_name: deviceName,
    }),
  });

export const listPasskeys = () => apiRequest<PasskeySummary[]>('/auth/passkeys/');

export const deletePasskey = (id: number) =>
  apiRequest<{ message: string }>(`/auth/passkeys/${id}/`, { method: 'DELETE' });