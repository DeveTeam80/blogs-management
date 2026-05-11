// Ping DB every 4 minutes to prevent Neon auto-suspend
if (process.env.NODE_ENV === 'development') {
  setInterval(
    async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/users/me`, {
          method: 'GET',
        })
      } catch {}
    },
    4 * 60 * 1000,
  )
}
