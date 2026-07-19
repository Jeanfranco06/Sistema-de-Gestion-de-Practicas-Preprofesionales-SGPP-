import { useQuery, useMutation } from '@tanstack/react-query';
import * as authService from '../api/authService';

export interface LoginPayload {
  username: string;
  password: string;
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ username, password }: LoginPayload) => authService.login(username, password),
  });
}

export function useGetMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authService.getMe(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authService.resetPassword(token, newPassword),
  });
}

export function useValidateResetToken(token: string | undefined) {
  return useQuery({
    queryKey: ['auth', 'validate-reset-token', token],
    queryFn: () => authService.validateResetToken(token!),
    enabled: !!token,
    retry: 0,
    staleTime: 0,
  });
}
