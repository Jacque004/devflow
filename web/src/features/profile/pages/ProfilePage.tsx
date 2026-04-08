import { User as UserIcon } from 'lucide-react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useAuthStore } from '../../../stores/useAuthStore'
import { supabase } from '../../../lib/supabase'
import { useToast } from '../../../hooks/useToast'
import { getAuthErrorMessage } from '../../../lib/errors/auth-messages'

function formatDate(iso: string | undefined) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

const emailSchema = z.object({
  newEmail: z.email('Email invalide'),
})

type EmailFormValues = z.infer<typeof emailSchema>

const passwordSchema = z
  .object({
    newPassword: z.string().min(6, 'Minimum 6 caracteres'),
    confirmPassword: z.string().min(6, 'Minimum 6 caracteres'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const { pushToast } = useToast()
  const [emailLoading, setEmailLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { newEmail: '' },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  })

  const onEmailSubmit = async (values: EmailFormValues) => {
    if (!user?.email) return
    if (values.newEmail.trim().toLowerCase() === user.email.toLowerCase()) {
      pushToast('La nouvelle adresse est identique a celle deja enregistree.', 'error')
      return
    }

    setEmailLoading(true)
    const emailRedirectTo = `${window.location.origin}/profil`
    const { data, error } = await supabase.auth.updateUser(
      { email: values.newEmail.trim() },
      { emailRedirectTo },
    )
    setEmailLoading(false)

    if (error) {
      pushToast(getAuthErrorMessage(error, 'profile'), 'error')
      return
    }

    if (data.user) {
      setUser(data.user)
    }

    emailForm.reset()
    pushToast(
      'Verifie la boite mail de la nouvelle adresse pour confirmer le changement. Ton adresse actuelle reste utilisee jusqu a confirmation.',
      'info',
    )
  }

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setPasswordLoading(true)
    const { error } = await supabase.auth.updateUser({ password: values.newPassword })
    setPasswordLoading(false)

    if (error) {
      pushToast(getAuthErrorMessage(error, 'profile'), 'error')
      return
    }

    passwordForm.reset()
    pushToast('Mot de passe mis a jour.', 'success')
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Profil</h1>
          <p className="muted">Informations liees a ton compte DevFlow.</p>
        </div>
      </div>

      <article className="card profile-card">
        <div className="profile-card-heading">
          <span className="profile-avatar" aria-hidden>
            <UserIcon className="h-8 w-8" strokeWidth={1.5} />
          </span>
          <div>
            <h2 className="profile-name">
              {user?.user_metadata?.full_name && typeof user.user_metadata.full_name === 'string'
                ? user.user_metadata.full_name
                : user?.email?.split('@')[0] ?? 'Utilisateur'}
            </h2>
            <p className="muted profile-email">{user?.email ?? '—'}</p>
          </div>
        </div>

        <dl className="profile-details">
          <div>
            <dt>Adresse e-mail</dt>
            <dd>{user?.email ?? '—'}</dd>
          </div>
          <div>
            <dt>Compte cree le</dt>
            <dd>{formatDate(user?.created_at)}</dd>
          </div>
          <div>
            <dt>Derniere connexion</dt>
            <dd>{formatDate(user?.last_sign_in_at)}</dd>
          </div>
          <div>
            <dt>Identifiant utilisateur</dt>
            <dd>
              <code className="profile-id">{user?.id ?? '—'}</code>
            </dd>
          </div>
        </dl>

        <p className="muted profile-hint">
          Pour te deconnecter, utilise le bouton <strong>Deconnexion</strong> dans la barre du haut.
        </p>
      </article>

      <article className="card profile-card profile-settings-card">
        <h2 className="profile-settings-title">Compte</h2>
        <p className="muted profile-settings-intro">
          Changer l adresse e-mail envoie un message de confirmation a la nouvelle boite. Le mot de passe peut etre
          modifie a tout moment.
        </p>

        <div className="profile-settings-block">
          <h3 className="profile-settings-subtitle">Changer l adresse e-mail</h3>
          <form className="form-grid profile-settings-form" onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
            <label className="field-label" htmlFor="profile-new-email">
              Nouvelle adresse
            </label>
            <input
              id="profile-new-email"
              type="email"
              autoComplete="email"
              placeholder="nouvelle@adresse.fr"
              aria-invalid={Boolean(emailForm.formState.errors.newEmail)}
              {...emailForm.register('newEmail')}
            />
            {emailForm.formState.errors.newEmail && (
              <p className="field-error">{emailForm.formState.errors.newEmail.message}</p>
            )}
            <button type="submit" disabled={emailLoading} className="profile-settings-submit">
              {emailLoading ? 'Envoi...' : 'Demander le changement'}
            </button>
          </form>
        </div>

        <div className="profile-settings-block">
          <h3 className="profile-settings-subtitle">Changer le mot de passe</h3>
          <form className="form-grid profile-settings-form" onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <label className="field-label" htmlFor="profile-new-password">
              Nouveau mot de passe
            </label>
            <input
              id="profile-new-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(passwordForm.formState.errors.newPassword)}
              {...passwordForm.register('newPassword')}
            />
            {passwordForm.formState.errors.newPassword && (
              <p className="field-error">{passwordForm.formState.errors.newPassword.message}</p>
            )}

            <label className="field-label" htmlFor="profile-confirm-password">
              Confirmation
            </label>
            <input
              id="profile-confirm-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(passwordForm.formState.errors.confirmPassword)}
              {...passwordForm.register('confirmPassword')}
            />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="field-error">{passwordForm.formState.errors.confirmPassword.message}</p>
            )}

            <button type="submit" disabled={passwordLoading} className="profile-settings-submit">
              {passwordLoading ? 'Enregistrement...' : 'Mettre a jour le mot de passe'}
            </button>
          </form>
        </div>
      </article>
    </section>
  )
}
