'use client'

// Sender and recipient details.
//
// The design collects none of these, but POST /order requires senderName,
// senderPhone, receiverName and at least one of receiverPhone/receiverEmail.
// Discovering that after the card is charged would mean a paid customer with no
// order, so they are collected here and validated before the pay button
// enables — never after.

const FIELD =
  'w-full rounded-xl border-[1.5px] border-[#e3dfe8] bg-white px-4 py-3 text-[15px] text-[#17131c] placeholder:text-[#8d8695] transition-colors focus:border-brand-600 focus:outline-none focus:ring-0'

const LABEL = 'mb-1.5 block text-[13px] font-bold text-[#17131c]'

function Field({ id, label, value, onChange, placeholder, type = 'text', autoComplete, optional }) {
  return (
    <label className="block" htmlFor={id}>
      <span className={LABEL}>
        {label}
        {optional && (
          <span className="ml-1 font-normal text-[#8d8695]">(optional)</span>
        )}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={FIELD}
      />
    </label>
  )
}

export function ContactFields({ contact, onChange, disabled }) {
  return (
    <fieldset disabled={disabled} className="disabled:opacity-60">
      <legend className="mb-3 text-[13px] font-extrabold tracking-[0.08em] text-[#8d8695]">
        CONTACT DETAILS
      </legend>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          id="senderName"
          label="Your name"
          value={contact.senderName}
          onChange={(value) => onChange('senderName', value)}
          placeholder="Full name"
          autoComplete="name"
        />
        <Field
          id="senderPhone"
          label="Your phone"
          type="tel"
          value={contact.senderPhone}
          onChange={(value) => onChange('senderPhone', value)}
          placeholder="(416) 555-0123"
          autoComplete="tel"
        />
        <Field
          id="receiverName"
          label="Recipient name"
          value={contact.receiverName}
          onChange={(value) => onChange('receiverName', value)}
          placeholder="Full name"
        />
        <Field
          id="receiverPhone"
          label="Recipient phone"
          type="tel"
          value={contact.receiverPhone}
          onChange={(value) => onChange('receiverPhone', value)}
          placeholder="(416) 555-0123"
        />
        <div className="sm:col-span-2">
          <Field
            id="receiverEmail"
            label="Recipient email"
            type="email"
            value={contact.receiverEmail}
            onChange={(value) => onChange('receiverEmail', value)}
            placeholder="name@example.com"
            optional
          />
        </div>
      </div>

      <p className="mt-3 text-[13px] text-[#5f5868]">
        The driver uses these to reach you and the recipient about this
        delivery.
      </p>
    </fieldset>
  )
}
