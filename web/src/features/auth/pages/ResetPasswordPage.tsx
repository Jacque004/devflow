import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useToast } from '../../../hooks/useToast'
import { supabase } from '../../../lib/supabase'
import { getAuthErrorMessage } from '../../../lib/errors/auth-messages'
import { useAuthStore } from '../../../stores/useAuthStore'
import { Skeleton } from '../../../components/ui/Skeleton'

const schema = z
  .object({
    password: z.string().min(6, 'Minimum 6 caracteres'),
    confirmPassword: z.string().min(6, 'Minimum 6 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const initialized = useAuthStore((s) => s.initialized)
  const user = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState(false)
  const { pushToast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: values.password })
    setLoading(false)

    if (error) {
      pushToast(getAuthErrorMessage(error, 'profile'), 'error')
      return
    }

    pushToast('Mot de passe mis a jour', 'success')
    void navigate('/dashboard')
  }

  if (!initialized) {
    return (
      <section className="auth-card" aria-busy="true" aria-live="polite">
        <h1>Chargement...</h1>
        <Skeleton height={24} />
      </section>
    )
  }

  if (!user) {
    return (
      <section className="auth-card">
        <h1>Lien invalide ou expire</h1>
        <p className="muted">
          Ce lien de reinitialisation ne fonctionne pas. Demande un nouveau lien ou connecte-toi si tu as deja un mot de
          passe.
        </p>
        <p className="muted">
          <Link to="/mot-de-passe-oublie">Demander un nouveau lien</Link>
          {' · '}
          <Link to="/login">Connexion</Link>
        </p>
      </section>
    )
  }

  return (
    <section className="auth-card">
      <h1>Nouveau mot de passe</h1>
      <p className="muted">Choisis un nouveau mot de passe pour ton compte.</p>
      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <label className="field-label" htmlFor="reset-password">
          Nouveau mot de passe
        </label>
        <input
          id="reset-password"
          type="password"
          placeholder="Nouveau mot de passe"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          {...register('password')}
        />
        {errors.password && <p className="field-error">{errors.password.message}</p>}

        <label className="field-label" htmlFor="reset-confirm-password">
          Confirmation
        </label>
        <input
          id="reset-confirm-password"
          type="password"
          placeholder="Confirmer le mot de passe"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : 'Enregistrer le mot de passe'}
        </button>
      </form>
    </section>
  )
}
