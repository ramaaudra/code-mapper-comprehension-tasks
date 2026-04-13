interface StatusAnnouncerProps {
  message?: string | null
  politeness?: 'polite' | 'assertive'
}

export function StatusAnnouncer({
  message,
  politeness = 'polite'
}: StatusAnnouncerProps) {
  if (!message) {
    return null
  }

  if (politeness === 'assertive') {
    return (
      <div aria-live='assertive' role='alert' className='sr-only'>
        {message}
      </div>
    )
  }

  return (
    <div aria-live='polite' role='status' className='sr-only'>
      {message}
    </div>
  )
}
