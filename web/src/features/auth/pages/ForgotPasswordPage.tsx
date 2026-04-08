import { Link } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useToast } from '../../../hooks/useToast'
import { supabase } from '../../../lib/supabase'
import { getSupabaseAuthMessage } from '../../../lib/errors/auth-messages'

const schema = z.object({
  email: z.email('Email invalide'),
})

type FormValues = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
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
    const redirectTo = `${window.location.origin}/reinitialiser-mot-de-passe`
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo,
    })
    setLoading(false)

    if (error) {
      pushToast(getSupabaseAuthMessage(error.message, 'reset'), 'error')
      return
    }

    setSent(true)
    pushToast('Si cette adresse existe, un email de reinitialisation vient de partir.', 'info')
  }

  if (sent) {
    return (
      <section className="auth-card">
        <h1>Email envoye</h1>
        <p className="muted">
          Si un compte est associe a cette adresse, tu recevras un lien pour choisir un nouveau mot de passe.
          Pense a verifier les courriers indesirables.
        </p>
        <p className="muted">
          <Link to="/login">Retour a la connexion</Link>
        </p>
      </section>
    )
  }

  return (
    <section className="auth-card">
      <h1>Mot de passe oublie</h1>
      <p className="muted">Indique ton adresse e-mail : nous enverrons un lien de reinitialisation a cette adresse.</p>
      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <label className="field-label" htmlFor="forgot-email">
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register('email')}
        />
        {errors.email && <p className="field-error">{errors.email.message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Envoi...' : 'Envoyer le lien'}
        </button>
      </form>
      <p className="muted">
        <Link to="/login">Retour a la connexion</Link>
      </p>
    </section>
  )
}
