import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useToast } from '../../../hooks/useToast'
import { supabase } from '../../../lib/supabase'
import { getSupabaseAuthMessage } from '../../../lib/errors/auth-messages'

const signupSchema = z
  .object({
    email: z.email('Email invalide'),
    password: z.string().min(6, 'Minimum 6 caracteres'),
    confirmPassword: z.string().min(6, 'Minimum 6 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type SignupFormValues = z.infer<typeof signupSchema>

export function SignupPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { pushToast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (values: SignupFormValues) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    })
    setLoading(false)

    if (error) {
      pushToast(getSupabaseAuthMessage(error.message, 'signup'), 'error')
      return
    }

    if (data.session) {
      pushToast('Compte cree et session active', 'success')
      void navigate('/dashboard')
      return
    }

    pushToast('Compte cree, confirme ton email avant connexion', 'info')
    void navigate('/login')
  }

  return (
    <section className="auth-card">
      <h1>Inscription</h1>
      <p className="muted">Cree ton compte DevFlow en quelques secondes.</p>
      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <label className="field-label" htmlFor="signup-email">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register('email')}
        />
        {errors.email && <p className="field-error">{errors.email.message}</p>}

        <label className="field-label" htmlFor="signup-password">
          Mot de passe
        </label>
        <input
          id="signup-password"
          type="password"
          placeholder="Mot de passe"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          {...register('password')}
        />
        {errors.password && <p className="field-error">{errors.password.message}</p>}

        <label className="field-label" htmlFor="signup-confirm-password">
          Confirmation
        </label>
        <input
          id="signup-confirm-password"
          type="password"
          placeholder="Confirmer le mot de passe"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Creation...' : 'Creer un compte'}
        </button>
      </form>
      <p className="muted auth-legal-hint">
        En creant un compte, tu acceptes les{' '}
        <Link to="/cgu" className="inline-link">
          CGU
        </Link>{' '}
        et la{' '}
        <Link to="/politique-confidentialite" className="inline-link">
          politique de confidentialite
        </Link>
        .
      </p>
      <p className="muted">
        Deja inscrit ? <Link to="/login">Se connecter</Link>
      </p>
    </section>
  )
}
