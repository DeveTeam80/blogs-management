export default function BeforeLogin() {
  return (
    <>
      <style>{`
        a[href="/admin/forgot"] {
          display: none !important;
        }

        /* Hide document ID badge */
        .id-label {
          display: none !important;
        }

        /* Hide theme/appearance toggle everywhere */
        [class*="theme"],
        [class*="Theme"],
        [id*="theme"],
        [id*="Theme"],
        [class*="appearance"],
        [class*="Appearance"],
        label[for*="theme"],
        .nav__theme,
        .theme-selector,
        .payload__theme-selector {
          display: none !important;
        }
      `}</style>
    </>
  )
}
