'use client'

import { useEffect, useState } from 'react'
import clsx from 'clsx'

const ALERT_CONFIG = {
  success: {
    title: 'Payment successful',
    message: 'Thanks! Your payment was processed successfully.',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    icon: '✅',
  },
  cancel: {
    title: 'Payment cancelled',
    message: 'The payment was cancelled. You can try again whenever you are ready.',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
    icon: '⚠️',
  },
}

export function PaymentAlert({ type }) {
  const [visible, setVisible] = useState(Boolean(type))

  useEffect(() => {
    if (!type) {
      return undefined
    }

    setVisible(true)

    const timeout = setTimeout(() => {
      setVisible(false)
    }, 15000)

    return () => {
      clearTimeout(timeout)
    }
  }, [type])

  if (!type || !visible) {
    return null
  }

  const alertConfig = ALERT_CONFIG[type]

  if (!alertConfig) {
    return null
  }

  return (
    <div
      className={clsx(
        'flex items-start gap-3 rounded-2xl px-4 py-3 text-sm font-medium shadow-sm ring-1 ring-inset',
        alertConfig.className,
      )}
      role="status"
    >
      <span className="text-base" aria-hidden>
        {alertConfig.icon}
      </span>
      <div className="flex flex-col">
        <span className="font-semibold leading-5">{alertConfig.title}</span>
        <span className="mt-1 text-sm font-normal leading-5">{alertConfig.message}</span>
      </div>
    </div>
  )
}
