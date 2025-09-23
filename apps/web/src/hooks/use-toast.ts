// Hook simple pour les notifications (sera remplacé par une vraie implémentation)
export function toast({
  title,
  description,
  variant,
}: {
  title: string
  description: string
  variant?: 'default' | 'destructive'
}) {
  // Implémentation simple avec console pour le POC
  if (variant === 'destructive') {
    console.error(`${title}: ${description}`)
  } else {
    console.log(`${title}: ${description}`)
  }

  // Dans une vraie implémentation, on utiliserait une bibliothèque comme react-hot-toast
  // ou on implémenterait un système de notifications personnalisé
}
