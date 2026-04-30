'use client'

import { useEffect } from 'react'

type SeenUser = string | number | { id: string | number }

const getId = (value: SeenUser) => {
  if (typeof value === 'object' && value?.id !== undefined) {
    return String(value.id)
  }

  return String(value)
}

export default function NotificationRedDot() {
  useEffect(() => {
    let currentUserId: string | null = null
    let unseenApprovalIds: Array<string | number> = []

    const findNotificationsLabel = () => {
      const elements = Array.from(document.querySelectorAll('a, button, div, span'))

      return elements.find((el) => {
        return el.textContent?.trim() === 'Notifications'
      }) as HTMLElement | undefined
    }

    const addDot = () => {
      const label = findNotificationsLabel()
      if (!label) return

      label.style.position = 'relative'

      if (label.querySelector('[data-approval-dot="true"]')) return

      const dot = document.createElement('span')
      dot.setAttribute('data-approval-dot', 'true')

      dot.style.width = '8px'
      dot.style.height = '8px'
      dot.style.borderRadius = '999px'
      dot.style.background = '#dc2626'
      dot.style.position = 'absolute'
      dot.style.top = '6px'
      dot.style.right = '-12px'
      dot.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.15)'

      label.appendChild(dot)
    }

    const removeDot = () => {
      const dot = document.querySelector('[data-approval-dot="true"]')
      dot?.remove()
    }

    const markAsSeen = async () => {
      if (!currentUserId || unseenApprovalIds.length === 0) return

      try {
        await Promise.all(
          unseenApprovalIds.map(async (approvalId) => {
            const res = await fetch(`/api/user-approvals/${approvalId}?depth=1`, {
              credentials: 'include',
            })

            const approval = await res.json()

            const existingSeenIds = (approval?.seenBy || []).map(getId)

            const nextSeenIds = Array.from(new Set([...existingSeenIds, currentUserId]))

            await fetch(`/api/user-approvals/${approvalId}`, {
              method: 'PATCH',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                seenBy: nextSeenIds,
              }),
            })
          }),
        )

        unseenApprovalIds = []
        removeDot()
      } catch (error) {
        console.error('Failed to mark notifications as seen:', error)
      }
    }

    const attachClickHandler = () => {
      const label = findNotificationsLabel()
      if (!label) return

      label.addEventListener('click', markAsSeen)
    }

    const loadNotifications = async () => {
      try {
        const meRes = await fetch('/api/users/me', {
          credentials: 'include',
        })

        const meData = await meRes.json()
        const user = meData?.user

        if (!user?.id) return
        if (user.role !== 'admin' && user.role !== 'master-admin') return

        currentUserId = String(user.id)

        const approvalsRes = await fetch(
          '/api/user-approvals?where[status][equals]=pending&depth=1&limit=100',
          {
            credentials: 'include',
          },
        )

        const approvalsData = await approvalsRes.json()
        const approvals = approvalsData?.docs || []

        const unseen = approvals.filter((approval: any) => {
          const seenIds = (approval.seenBy || []).map(getId)
          return !seenIds.includes(currentUserId)
        })

        unseenApprovalIds = unseen.map((approval: any) => approval.id)

        if (unseenApprovalIds.length > 0) {
          addDot()
          attachClickHandler()
        } else {
          removeDot()
        }
      } catch (error) {
        console.error('Notification red dot error:', error)
      }
    }

    const timer = setTimeout(loadNotifications, 800)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  return null
}
