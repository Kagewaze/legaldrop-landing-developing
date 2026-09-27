'use client'

import { useState } from 'react'

import {
  DROPOFF_OPTIONS,
  PICKUP_OPTIONS,
  describeDropoff,
  describePickup,
  safeDropOffered,
  validateDropoff,
  validatePickup,
} from '@/lib/endpoint-contacts.mjs'

// Pickup and drop-off contacts — WHO is at each end of the delivery.
//
// POST /order requires a pickup name and phone, a receiver name and at least one
// of receiverPhone/receiverEmail. Discovering that after the card is charged
// would mean a paid customer with no order, so they are collected here and
// validated before the pay button enables — never after.
//
// ⚠️ THE BOOKER IS NOT ASSUMED TO BE AT EITHER END (Wave 2B.2). This used to ask
// for "Your name / Your phone" at pickup. Each end now starts unchosen, and the
// fields follow the chosen kind of contact. Rules: lib/endpoint-contacts.mjs.
//
// ⚠️ NO PIN, NO PROOF OF DELIVERY HERE. How a handover is verified belongs to the
// driver flow in a later wave.

const FIELD =
  'w-full rounded-xl border-[1.5px] border-[#e3dfe8] bg-white px-4 py-3 text-[15px] text-[#17131c] placeholder:text-[#8d8695] transition-colors focus:border-brand-600 focus:outline-none focus:ring-0'

const LABEL = 'mb-1.5 block text-[13px] font-bold text-[#17131c]'

const LEGEND =
  'mb-1 text-[13px] font-extrabold tracking-[0.08em] text-[#8d8695]'

function FieldError({ id, message }) {
  if (!message) return null
  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-rose-700"
    >
      <span aria-hidden="true">⚠</span>
      {message}
    </p>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
  optional,
  error,
  hint,
  onBlur,
}) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  return (
    <label className="block" htmlFor={id}>
      <span className={LABEL}>
        {label}
        {optional && (
          <span className="ml-1 font-normal text-[#8d8695]">(optional)</span>
        )}
      </span>
      {hint && (
        <span id={hintId} className="mb-1.5 block text-[13px] text-[#5f5868]">
          {hint}
        </span>
      )}
      <input
        id={id}
        type={type}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={
          [hint ? hintId : null, error ? errorId : null]
            .filter(Boolean)
            .join(' ') || undefined
        }
        className={`${FIELD} ${error ? 'border-rose-400' : ''}`}
      />
      <FieldError id={errorId} message={error} />
    </label>
  )
}

function Note({ id, label, value, onChange, placeholder }) {
  return (
    <label className="block sm:col-span-2" htmlFor={id}>
      <span className={LABEL}>
        {label}
        <span className="ml-1 font-normal text-[#8d8695]">(optional)</span>
      </span>
      <textarea
        id={id}
        rows={2}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        // text-base (16px) on the phone: iOS Safari zooms the viewport for anything smaller.
        className={`${FIELD} min-h-[76px] resize-y text-base sm:text-[15px]`}
      />
    </label>
  )
}

/**
 * A native radio group: arrow-key navigation and screen-reader grouping come from
 * the platform. The chosen option shows a filled radio and a bold label, so state
 * is never carried by colour alone. Whole row is the 56px target.
 */
function Choice({ name, legend, question, options, value, onChange, error }) {
  const errorId = `${name}-error`
  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className={LEGEND}>{legend}</legend>
      <p className="mb-3 text-[15px] font-bold text-[#17131c]">{question}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const checked = value === option.value
          return (
            <label
              key={option.value}
              className={`flex min-h-[56px] cursor-pointer items-start gap-3 rounded-xl border-[1.5px] px-4 py-3 transition-colors focus-within:ring-2 focus-within:ring-brand-600 ${
                checked
                  ? 'border-brand-600 bg-[#faf7fd]'
                  : 'border-[#e3dfe8] bg-white hover:border-[#cfc6da]'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="mt-1 h-4 w-4 accent-brand-600"
              />
              <span>
                <span
                  className={`block text-[15px] text-[#17131c] ${checked ? 'font-extrabold' : 'font-semibold'}`}
                >
                  {option.label}
                </span>
                <span className="block text-[13px] text-[#5f5868]">
                  {option.description}
                </span>
              </span>
            </label>
          )
        })}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  )
}

export function ContactFields({ contact, onChange, disabled, section }) {
  // Errors appear for a field once it has been left, so an untouched form is not
  // a wall of red. The pay button stays disabled until everything is valid.
  const [touched, setTouched] = useState({})
  const touch = (field) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }))
  const pickupErrors = validatePickup(contact)
  const dropoffErrors = validateDropoff(contact)
  const shown = (errors, field) => (touched[field] ? errors[field] : undefined)

  const pickupType = contact.pickupContactType
  const dropoffType = contact.dropoffContactType
  const pickupBusiness = pickupType === 'business'
  const dropoffBusiness = dropoffType === 'business'

  return (
    <fieldset disabled={disabled} className="space-y-8 disabled:opacity-60">
      {/* ── PICKUP ─────────────────────────────────────────────────────────── */}
      <div>
        <Choice
          name="pickupContactType"
          legend="PICKUP CONTACT"
          question="Who will give the package to the driver?"
          options={PICKUP_OPTIONS}
          value={pickupType}
          onChange={(value) => onChange('pickupContactType', value)}
        />
        {pickupType && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {pickupBusiness && (
              <div className="sm:col-span-2">
                <Field
                  id="pickupOrganization"
                  label="Business name"
                  value={contact.pickupOrganization}
                  onChange={(value) => onChange('pickupOrganization', value)}
                  onBlur={touch('pickupOrganization')}
                  placeholder="Store, office or building"
                  autoComplete="organization"
                  error={shown(pickupErrors, 'pickupOrganization')}
                />
              </div>
            )}
            <Field
              id="senderName"
              label={
                pickupBusiness
                  ? 'Contact or desk name'
                  : pickupType === 'requester'
                    ? 'Your name'
                    : 'Contact name'
              }
              optional={pickupBusiness}
              value={contact.senderName}
              onChange={(value) => onChange('senderName', value)}
              onBlur={touch('senderName')}
              placeholder="Full name"
              autoComplete={pickupType === 'requester' ? 'name' : 'off'}
              error={shown(pickupErrors, 'senderName')}
            />
            <Field
              id="senderPhone"
              label={
                pickupBusiness
                  ? 'Business or desk phone'
                  : pickupType === 'requester'
                    ? 'Your phone'
                    : 'Contact phone'
              }
              type="tel"
              value={contact.senderPhone}
              onChange={(value) => onChange('senderPhone', value)}
              onBlur={touch('senderPhone')}
              placeholder="(416) 555-0123"
              autoComplete={pickupType === 'requester' ? 'tel' : 'off'}
              error={shown(pickupErrors, 'senderPhone')}
            />
            <div className="sm:col-span-2">
              <Field
                id="senderEmail"
                label="Email"
                type="email"
                optional
                value={contact.senderEmail}
                onChange={(value) => onChange('senderEmail', value)}
                onBlur={touch('senderEmail')}
                placeholder="name@example.com"
                autoComplete={pickupType === 'requester' ? 'email' : 'off'}
                error={shown(pickupErrors, 'senderEmail')}
              />
            </div>
            <Note
              id="senderNote"
              label="Pickup instructions"
              value={contact.senderNote}
              onChange={(value) => onChange('senderNote', value)}
              placeholder="Entrance, suite, who to ask for at the desk."
            />
          </div>
        )}
      </div>

      {/* ── DROP-OFF ───────────────────────────────────────────────────────── */}
      <div>
        <Choice
          name="dropoffContactType"
          legend="DROP-OFF CONTACT"
          question="Who should receive the package?"
          options={DROPOFF_OPTIONS}
          value={dropoffType}
          onChange={(value) => onChange('dropoffContactType', value)}
        />
        {dropoffType && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {dropoffBusiness && (
              <div className="sm:col-span-2">
                <Field
                  id="receiverOrganization"
                  label="Receiving business name"
                  value={contact.receiverOrganization}
                  onChange={(value) => onChange('receiverOrganization', value)}
                  onBlur={touch('receiverOrganization')}
                  placeholder="Business, mailroom or reception"
                  autoComplete="off"
                  error={shown(dropoffErrors, 'receiverOrganization')}
                />
              </div>
            )}
            <div className="sm:col-span-2">
              <Field
                id="receiverName"
                label={
                  {
                    requester: 'Your name',
                    person: 'Recipient name',
                    business: 'Representative or desk name',
                    anyone: 'Name on the package',
                  }[dropoffType]
                }
                optional={dropoffBusiness}
                hint={
                  dropoffType === 'anyone'
                    ? "Anyone at the address can receive it. We still label the delivery with a name — the household, company or person it's for."
                    : undefined
                }
                value={contact.receiverName}
                onChange={(value) => onChange('receiverName', value)}
                onBlur={touch('receiverName')}
                placeholder="Full name"
                autoComplete={dropoffType === 'requester' ? 'name' : 'off'}
                error={shown(dropoffErrors, 'receiverName')}
              />
            </div>
            <Field
              id="receiverPhone"
              label="Phone"
              type="tel"
              value={contact.receiverPhone}
              onChange={(value) => onChange('receiverPhone', value)}
              onBlur={touch('receiverPhone')}
              placeholder="(416) 555-0123"
              autoComplete={dropoffType === 'requester' ? 'tel' : 'off'}
              error={shown(dropoffErrors, 'receiverPhone')}
            />
            <Field
              id="receiverEmail"
              label="Email"
              type="email"
              optional
              value={contact.receiverEmail}
              onChange={(value) => onChange('receiverEmail', value)}
              onBlur={touch('receiverEmail')}
              placeholder="name@example.com"
              autoComplete={dropoffType === 'requester' ? 'email' : 'off'}
              error={shown(dropoffErrors, 'receiverEmail')}
            />

            {/* ⚠️ receiverNote IS THE EXISTING BACKEND FIELD, NOT A WEB INVENTION.
                Mobile has always sent it, POST /order already accepts it, the
                delivery_point row already stores it, and the driver app already
                renders it as "Recipient Note". See EMPTY_STATE.contact in
                src/lib/send-flow.js for the end-to-end trace. NO maxLength: the
                contract has none, so capping it here would reject notes the app
                accepts. */}
            <Note
              id="receiverNote"
              label="Delivery instructions"
              value={contact.receiverNote}
              onChange={(value) => onChange('receiverNote', value)}
              placeholder="Unit, buzzer, loading dock, reception, or handling notes."
            />
          </div>
        )}
      </div>

      {/* ── DELIVERY METHOD — a separate control from who receives ─────────── */}
      {safeDropOffered(section) && dropoffType && (
        <Choice
          name="deliveryPreference"
          legend="DELIVERY METHOD"
          question="How should the package be left?"
          options={[
            {
              value: 'recipient_handoff',
              label: 'Hand to recipient',
              description:
                'The driver hands the package to someone at the address',
            },
            {
              value: 'safe_drop',
              label: 'Safe drop, if permitted',
              description:
                'A request to leave it in a safe place. The driver may still need to hand it to someone.',
            },
          ]}
          value={contact.deliveryPreference ?? 'recipient_handoff'}
          onChange={(value) => onChange('deliveryPreference', value)}
        />
      )}

      <p className="text-[13px] text-[#5f5868]">
        The driver uses these to reach the pickup and drop-off contacts about
        this delivery. They don&apos;t need a Druppr account.
      </p>
    </fieldset>
  )
}

/** Restates who is at each end beside the total, before the customer pays. */
export function ContactSummary({ contact, section }) {
  if (!contact?.pickupContactType || !contact?.dropoffContactType) return null
  const pickup = describePickup(contact)
  const dropoff = describeDropoff(contact, { section })
  return (
    <dl className="mt-3 space-y-1 border-t border-[#f0eef2] pt-3 text-[13px] text-[#5f5868]">
      <div className="flex justify-between gap-4">
        <dt>{pickup.label}</dt>
        <dd className="text-right font-semibold text-[#17131c]">
          {pickup.value || '—'}
        </dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt>{dropoff.label}</dt>
        <dd className="text-right font-semibold text-[#17131c]">
          {dropoff.value || '—'}
        </dd>
      </div>
      {dropoff.preference && (
        <div className="flex justify-between gap-4">
          <dt>Delivery method</dt>
          <dd className="text-right font-semibold text-[#17131c]">
            {dropoff.preference}
          </dd>
        </div>
      )}
      <div>
        <button
          type="button"
          className="min-h-[44px] font-semibold text-brand-600 underline"
          onClick={() => {
            const target = document.querySelector(
              'input[name="pickupContactType"]:checked',
            )
            target?.scrollIntoView({ block: 'center' })
            target?.focus()
          }}
        >
          Edit contacts
        </button>
      </div>
    </dl>
  )
}
