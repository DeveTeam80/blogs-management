'use client'

import { useEffect } from 'react'

export default function HideCloudinaryMediaInfo() {
  useEffect(() => {
    const style = document.createElement('style')

    style.innerHTML = `
      [data-path="cloudinary"],
      [data-field-name="cloudinary"],
      #field-cloudinary {
        display: none !important;
      }
    `

    document.head.appendChild(style)

    const hideCloudinarySection = () => {
      const elements = Array.from(
        document.querySelectorAll('label, legend, h1, h2, h3, h4, h5, h6, p, span, div'),
      )

      elements.forEach((element) => {
        const text = element.textContent?.trim()

        if (text === 'Cloudinary Media Information') {
          const wrapper =
            element.closest('[data-path="cloudinary"]') ||
            element.closest('[data-field-name="cloudinary"]') ||
            element.closest('.field-type') ||
            element.closest('fieldset') ||
            element.parentElement?.parentElement

          if (wrapper instanceof HTMLElement) {
            wrapper.style.display = 'none'
          }
        }
      })
    }

    hideCloudinarySection()

    const observer = new MutationObserver(() => {
      hideCloudinarySection()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
      style.remove()
    }
  }, [])

  return null
}
