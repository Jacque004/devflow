import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useToast } from '../../../hooks/useToast'
import { supabase } from '../../../lib/supabase'
import { getSupabaseAuthMessage } from '../../../lib/errors/auth-messages'

const loginSchema = z.object({
  email: z.email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { pushToast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })
    setLoading(false)

    if (error) {
      pushToast(getSupabaseAuthMessage(error.message, 'login'), 'error')
      return
    }

    pushToast('Connexion reussie', 'success')
    void navigate('/dashboard')
  }

  return (
    <section className="auth-card">
      <h1>Connexion</h1>
      <p className="muted">Connecte-toi pour acceder a ton espace DevFlow.</p>
      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <label className="field-label" htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register('email')}
        />
        {errors.email && <p className="field-error">{errors.email.message}</p>}

        <label className="field-label" htmlFor="login-password">
          Mot de passe
        </label>
        <input
          id="login-password"
          type="password"
          placeholder="Mot de passe"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          {...register('password')}
        />
        {errors.password && <p className="field-error">{errors.password.message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      <p className="muted">
        <Link to="/mot-de-passe-oublie" className="inline-link">
          Mot de passe oublie ?
        </Link>
      </p>
      <p className="muted auth-legal-links">
        <Link to="/cgu" className="inline-link">
          CGU
        </Link>
        {' · '}
        <Link to="/politique-confidentialite" className="inline-link">
          Confidentialite
        </Link>
      </p>
      <p className="muted">
        Pas encore de compte ? <Link to="/signup">Creer un compte</Link>
      </p>
    </section>
  )
}
