'use client'

import { useEffect } from 'react'

export default function HideDocId() {
  useEffect(() => {
    const id = 'hide-doc-id-style'
    if (document.getElementById(id)) return

    const style = document.createElement('style')
    style.id = id
    style.innerHTML = `.id-label { display: none !important; }`
    document.head.appendChild(style)
  }, [])

  return null
}
