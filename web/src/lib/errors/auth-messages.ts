import type { AuthError } from '@supabase/supabase-js'

function normalize(input: string) {
  return input.toLowerCase()
}

/**
 * Utiliser de preference pour les erreurs renvoyees par le client (objet avec .code et .status).
 * Le 422 sur PATCH /auth/v1/user vient souvent d un mot de passe faible, d une reauth requise,
 * ou du changement d e-mail sans emailRedirectTo valide.
 */
export function getAuthErrorMessage(
  error: AuthError,
  context: 'login' | 'signup' | 'reset' | 'profile' = 'profile',
): string {
  const code = error.code
  if (code === 'weak_password') {
    return 'Mot de passe refuse : il est trop faible par rapport aux regles du projet (longueur ou complexite). Ajuste les regles dans Supabase (Authentication) ou choisis un mot de passe plus fort.'
  }
  if (code === 'reauthentication_needed' || code === 'reauth_nonce_missing') {
    return 'Pour cette action, tu dois te reconnecter : deconnecte-toi puis connecte-toi a nouveau.'
  }
  if (code === 'email_exists' || code === 'user_already_exists' || code === 'conflict') {
    return 'Cette adresse e-mail est deja utilisee par un autre compte.'
  }
  if (code === 'same_password') {
    return 'Le nouveau mot de passe doit etre different du precedent.'
  }
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') {
    return 'Trop de demandes ou d e-mails envoyes. Patiente quelques minutes puis reessaie.'
  }
  if (code === 'insufficient_aal') {
    return 'Niveau de securite insuffisant pour cette action. Reconnecte-toi ou verifie le MFA.'
  }

  return getSupabaseAuthMessage(error.message, context)
}

export function getSupabaseAuthMessage(
  message: string,
  context: 'login' | 'signup' | 'reset' | 'profile',
) {
  const error = normalize(message)

  if (error.includes('invalid login credentials')) {
    return 'Identifiants invalides. Verifie ton email et ton mot de passe.'
  }

  if (error.includes('email not confirmed')) {
    return 'Email non confirme. Verifie ta boite mail puis reessaie.'
  }

  if (error.includes('too many requests')) {
    return 'Trop de tentatives. Patiente quelques minutes puis reessaie.'
  }

  if (error.includes('user already registered')) {
    return 'Cet email est deja utilise. Connecte-toi ou reinitialise ton mot de passe.'
  }

  if (error.includes('password should be at least')) {
    return 'Le mot de passe est trop court.'
  }

  if (error.includes('unable to validate email address')) {
    return 'Adresse email invalide.'
  }

  if (context === 'signup' && error.includes('signup is disabled')) {
    return "L'inscription est desactivee temporairement."
  }

  if (error.includes('same password')) {
    return 'Le nouveau mot de passe doit etre different du precedent.'
  }

  if (error.includes('email address is already registered') || error.includes('already been registered')) {
    return 'Cette adresse est deja utilisee par un autre compte.'
  }

  if (context === 'reset' && error.includes('rate limit')) {
    return 'Trop de demandes. Patiente quelques minutes puis reessaie.'
  }

  return "Une erreur d'authentification est survenue. Reessaie."
}
