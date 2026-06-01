import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email().nonempty(),
  password: z.string().nonempty(),
  rememberMe: z.boolean()
}); /*.refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['password', 'confirmPassword'],
});*/

export type SignInForm = z.infer<typeof signInSchema>;

// définir le schéma de validation (avec Zod)
export const signUpSchema = z.object({
  firstname: z.string().trim().min(2, { error: 'au moins 2 lettres!!!' }).max(255),
  lastname: z.string().nonempty().min(2).max(255),
  email: z.email(),
  username: z.string().trim().min(2).max(255),
  password: z
    .string()
    .trim()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),
  confirmPassword: z
    .string()
    .nonempty()
    .trim()
    .min(8),
  birthDate: z
    .date()
    .min(new Date('1900-01-01'), {
      message: 'La date doit être postérieure au 1er janvier 2026',
    })
    .max(new Date(), {
      message: "La date doit être antérieure à aujourd'hui",
    }),
  newsletter: z.boolean(),
});

export type SignUpForm = z.infer<typeof signUpSchema>;
