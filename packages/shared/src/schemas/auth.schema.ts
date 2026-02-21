import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Correo electronico invalido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(128),
  firstName: z.string().min(1, 'Nombre requerido').max(100),
  lastName: z.string().min(1, 'Apellido requerido').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Correo electronico invalido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    cognitoSub: string;
    seekingMode: string;
  };
}
