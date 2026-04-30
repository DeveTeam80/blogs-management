export default function BeforeLogin() {
  return (
    <style>{`
      a[href="/admin/forgot"] {
        display: none !important;
      }
    `}</style>
  )
}
