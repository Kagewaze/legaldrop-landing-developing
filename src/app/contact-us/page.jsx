"use client"
import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useForm } from 'react-hook-form';
import { useId, useRef, useState } from 'react';
import axios from "axios"

import { Layout } from '@/components/Layout'
import { API_BASE_URL } from '@/lib/config'
import {
  PARTNER_SIGNUP_URL,
  ROUTES,
  SERVICE_AREA,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  formatPhone,
} from '@/lib/navigation'

// /contact-us — brought onto the design system.
//
// CONTACT DETAILS ARE NOT WRITTEN HERE. This page used to hardcode a phone
// number and a Gmail address while the footer, reading SUPPORT_PHONE and
// SUPPORT_EMAIL from src/lib/navigation.js, printed nothing — two sources of
// truth disagreeing on the one page whose entire job is being reachable. Both
// now come from navigation.js, and each row is gated independently so one can
// ship without the other. If you are here to add a phone number, add it there.
//
// The page is deliberately useful with both of them null, which is the state it
// ships in: the form is the working channel, and the left column carries the
// destinations a visitor most often actually wanted.

// Field language copied from the send flow (src/components/send/ContactFields.jsx)
// so focus reads brand purple here exactly as it does there. Before this, these
// inputs set no border and no ring, inheriting @tailwindcss/forms' defaults —
// a grey-500 border and a BLUE focus ring, the only blue on the site.
const FIELD =
  'block w-full rounded-control border-[1.5px] border-[#e3dfe8] bg-white px-4 py-3 text-base text-[#17131c] placeholder:text-[#8d8695] transition-colors focus:border-brand-600 focus:outline-none focus:ring-0'

const LABEL = 'mb-1.5 block text-start text-sm font-semibold text-[#17131c]'

// role="alert" matches the precedent in send/AddressAutocomplete.jsx: a message
// that appears in response to what the user just did has to be announced, not
// merely rendered.
const ERROR = 'mt-1.5 text-sm text-[#b42318]'

const CONTACT_LINK = 'transition-colors hover:text-[#17131c]'

// ── WHAT THE BACKEND ACTUALLY CONFIRMS, AND WHY THE COPY IS WORDED AS IT IS ──
//
// POST /contact-form answers 201 with:
//
//   { success: true,
//     data: { …fields, id, createdAt, updatedAt, deletedAt },
//     message: 'Contact form created successfully' }
//
// That is a DATABASE WRITE RECEIPT. There is no messageId, no provider status
// and no delivery field anywhere in it — the backend does not distinguish a
// message it merely stored from one that reached a human.
//
// So this form must not say "sent". It previously alerted 'Message sent
// successfully!' on any 2xx, which asserted delivery the response never
// claimed; while mail delivery was broken the page cheerfully confirmed a
// send that never happened. The success copy below therefore confirms RECEIPT,
// which is exactly what a row id evidences and no more, and the fallback
// contact route stays on screen in BOTH outcomes so nobody is left with a
// confirmation as their only option.
//
// If the backend ever returns real delivery evidence, tighten SUCCESS_MESSAGE
// then — not before.
const SUCCESS_MESSAGE =
  'Thanks — we have your message and will get back to you.'

const ERROR_MESSAGE =
  'Your message could not be submitted. Nothing was lost — your details are still in the form, so you can try again.'

// Bounds the textarea. The backend publishes no limit, so this is a client-side
// guard against a paste that would be rejected downstream with no useful error.
const MESSAGE_MAX = 2000

// Long enough to exclude an accidental keypress, short enough not to lecture
// someone with a genuinely brief question.
const MESSAGE_MIN = 10

// Accepts what people actually type: 4167201043, 416-720-1043, (416) 720-1043,
// +1 416 720 1043, 416.720.1043.
//
// The old rule was /^\d{10}$/ against the raw input, which rejected every one
// of those but the first — a valid customer with a correctly written number was
// told it was invalid. Validation runs on the DIGITS, and normalisePhone below
// is what the backend receives, so presentation and payload cannot disagree.
function phoneDigits(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
}

// The backend was verified to accept a bare 10-digit string, so that is what it
// keeps receiving. This normalisation changes what the USER may type, not the
// request contract.
function normalisePhone(value) {
  return phoneDigits(value)
}

// The two "Other ways to reach us" links, extracted so the identical recipe is
// not typed twice in the branch below.
//
// ⚠️ PHASE 9 ADDED `inline-flex min-h-6 items-center`. These rendered 20px tall
// — the only sub-24px targets left on any public route, against WCAG 2.5.8
// Target Size (Minimum, AA, 24x24). The criterion's inline exception does not
// cover them: each is a standalone block link heading its own list item with a
// description beneath, not a link inside a sentence.
//
// Same remedy as Footer.jsx, where the reasoning is recorded at length:
// inline-flex is what allows a min-height to apply to an otherwise inline box.
// Text size and colour are unchanged, so the only visual effect is 4px of box.
// No `after` hit-area overlay is used here — Footer needs one because its links
// sit on a 32px pitch, whereas these are a whole list item apart, so the box can
// simply be the correct size.
const OTHER_WAY_LINK =
  'inline-flex min-h-6 items-center rounded-control text-base font-semibold text-brand-600 transition-colors hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600'

// Built ONLY from destinations that already exist and are already flagged
// shippable in navigation.js, filtered through the same `live` gate the Footer
// uses — so a route that has not shipped cannot leak onto the page that
// promises to help. No response-time claim appears here or anywhere on this
// page: nobody has measured one.
const OTHER_WAYS = [
  {
    ...ROUTES.send,
    label: 'Send a package',
    description: 'Get a price and book a driver online.',
  },
  {
    href: PARTNER_SIGNUP_URL,
    live: true,
    external: true,
    label: 'Set up a business account',
    // PHASE 4.3: was "Standing routes and per-location billing for clinics and
    // firms." Both claims were removed from /medical in the same pass and this
    // was the third public surface carrying them — found by searching rendered
    // routes rather than only the two pages the phase was scoped to.
    //
    // Scheduling is not a product this repository can evidence (no date or time
    // picker in send/page.jsx, no scheduling field in send-flow.js or
    // buildOrderPayload.js) and no billing surface exists at all. Replaced with
    // what the partner platform demonstrably does.
    description: 'Book and track deliveries for your clinic or firm from one account.',
  },
]

// ALWAYS RENDERED WITH BOTH OUTCOMES, success as well as failure.
//
// On failure it is the obvious need: the form did not go through, so there has
// to be another way through. On SUCCESS it matters for a subtler reason — the
// backend confirms storage, not delivery, so "we have your message" is the
// honest ceiling. Someone who needs an answer today should not have to guess
// whether that is enough, and a second route costs nothing to show.
//
// Reads the same SUPPORT_* constants as the page header and the footer, so
// when a real number lands in navigation.js it appears here with no edit. While
// they are null this degrades to the routes that do exist.
function FallbackContact() {
  return (
    <p className="mt-2 text-sm text-[#5f5868]">
      {SUPPORT_PHONE || SUPPORT_EMAIL ? (
        <>
          If it is urgent, reach us directly
          {SUPPORT_PHONE && (
            <>
              {' '}on{' '}
              <a href={`tel:${SUPPORT_PHONE}`} className="font-semibold text-brand-600 underline underline-offset-4">
                {formatPhone(SUPPORT_PHONE)}
              </a>
            </>
          )}
          {SUPPORT_PHONE && SUPPORT_EMAIL && ' or'}
          {SUPPORT_EMAIL && (
            <>
              {' '}at{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-brand-600 underline underline-offset-4">
                {SUPPORT_EMAIL}
              </a>
            </>
          )}
          .
        </>
      ) : (
        <>
          You can also{' '}
          <Link href={ROUTES.send.href} className="font-semibold text-brand-600 underline underline-offset-4">
            book a delivery directly
          </Link>
          .
        </>
      )}
    </p>
  )
}

export default function ContactUs() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  // null | 'success' | 'error' — drives the polite live region below.
  const [status, setStatus] = useState(null);
  const baseId = useId();

  // DUPLICATE-SUBMIT GUARD. The disabled button stops the ordinary double
  // click, but not Enter held down in a field, and not a click that lands in
  // the same tick as the state update. A ref is checked and set synchronously,
  // so the second call returns before it can reach the network.
  const inFlight = useRef(false);

  const onSubmit = async (contactData) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus(null);
    setLoading(true);

    try {
      // HONEYPOT. A field no human sees and no assistive technology reaches;
      // anything in it means a bot filled every input on the page. The
      // submission is dropped WITHOUT a network call and the ordinary success
      // state is shown, because telling a bot it was detected only teaches the
      // next attempt what to avoid.
      if (String(contactData.company ?? '').trim() !== '') {
        setStatus('success');
        reset();
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/contact-form`,
        {
          firstName: contactData.firstName,
          lastName: contactData.lastName,
          email: contactData.email,
          // Digits only — see normalisePhone.
          phoneNumber: normalisePhone(contactData.phoneNumber),
          message: contactData.message,
        },
        { headers: { 'Content-Type': 'application/json' } },
      );

      // ⚠️ SUCCESS IS NOT "the request did not throw".
      //
      // axios resolves for any 2xx, and the old handler treated that alone as
      // proof. It is not: a 200 carrying { success: false }, an empty body, or
      // an HTML error page from a proxy all resolve. The one thing that
      // evidences the message was stored is the row id the API returns with
      // success: true, so that — and only that — flips the success state.
      const body = response?.data;
      const stored = body?.success === true && Boolean(body?.data?.id);

      if (!stored) {
        throw new Error('Contact endpoint did not confirm storage');
      }

      setStatus('success');
      // Cleared only on a confirmed write. On any failure the typed content
      // survives, which is the whole point of not resetting in `finally`.
      reset();
    } catch (error) {
      // ACTIONABLE WITHOUT THE MESSAGE BODY. Status, endpoint and the API's own
      // error text are enough to diagnose; the visitor's message is their
      // content and is deliberately not written to the console.
      console.error('[contact-form] submission failed', {
        status: error?.response?.status ?? null,
        endpoint: `${API_BASE_URL}/contact-form`,
        apiMessage: error?.response?.data?.message ?? error?.message ?? null,
      });
      setStatus('error');
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  };

  // Both null today. The whole <dl> is skipped rather than left as an empty
  // list, same as the Footer's contact block.
  const hasContact = Boolean(SUPPORT_PHONE || SUPPORT_EMAIL)
  const otherWays = OTHER_WAYS.filter((way) => way.live)

  return (
    <Layout>
      <div className="bg-white" id="contact-us">
        <div className="mx-auto max-w-[1200px] px-8 py-16 sm:py-20">
          {/* 5/7 rather than 50/50, and items-start rather than the grid's
              default stretch. Both columns used to be cells of one row whose
              height was set by the taller one, so the left column's short
              content sat top-aligned above ~435px of nothing. */}
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h1 className="text-pretty text-4xl font-extrabold text-[#17131c] sm:text-5xl">
                Get in touch
              </h1>
              <p className="mt-4 text-lg text-[#5f5868]">
                We are one click away from serving you better today!
              </p>

              {hasContact && (
                <dl className="mt-8 space-y-4 text-base text-[#5f5868]">
                  {SUPPORT_PHONE && (
                    <div className="flex items-center gap-x-3">
                      <dt className="flex-none">
                        <span className="sr-only">Telephone</span>
                        <PhoneIcon aria-hidden="true" className="h-6 w-6 text-[#8d8695]" />
                      </dt>
                      <dd>
                        {/* href takes the stored digits; only the label is
                            formatted. See formatPhone in navigation.js. */}
                        <a href={`tel:${SUPPORT_PHONE}`} className={CONTACT_LINK}>
                          {formatPhone(SUPPORT_PHONE)}
                        </a>
                      </dd>
                    </div>
                  )}
                  {SUPPORT_EMAIL && (
                    <div className="flex items-center gap-x-3">
                      <dt className="flex-none">
                        <span className="sr-only">Email</span>
                        <EnvelopeIcon aria-hidden="true" className="h-6 w-6 text-[#8d8695]" />
                      </dt>
                      <dd>
                        <a href={`mailto:${SUPPORT_EMAIL}`} className={CONTACT_LINK}>
                          {SUPPORT_EMAIL}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              )}

              {otherWays.length > 0 && (
                <div className="mt-8 rounded-card bg-[#faf7fd] p-6 shadow-card">
                  <h2 className="text-xl font-bold text-[#17131c]">
                    Other ways to reach us
                  </h2>
                  <ul className="mt-4 space-y-4">
                    {otherWays.map((way) => (
                      <li key={way.href}>
                        {/* PARTNER_SIGNUP_URL is a different origin, so it is a plain
                            anchor — next/link is for in-app routes. */}
                        {way.external ? (
                          <a href={way.href} className={OTHER_WAY_LINK}>
                            {way.label}
                          </a>
                        ) : (
                          <Link href={way.href} className={OTHER_WAY_LINK}>
                            {way.label}
                          </Link>
                        )}
                        <p className="mt-1 text-sm text-[#5f5868]">
                          {way.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* #5f5868, not #8d8695. At 14px on this section's opaque white
                  ground the lighter tone measures 3.51:1, under the 4.5:1
                  floor; #5f5868 measures 6.81:1. Neither colour carries alpha
                  and the ground is #ffffff, so there is nothing to composite —
                  the pair is the measurement.

                  This is the same token failure Phase 0 recorded as A1/A2 and
                  Phase 1 remediated on the homepage and the two B2B pages.
                  /contact-us was missed then and was never re-audited until the
                  Phase 4.3 sweep, which was the first pass to look at this
                  route at all. No new token: #5f5868 is the existing secondary
                  body tone already used across the site. */}
              <p className="mt-6 text-sm text-[#5f5868]">{SERVICE_AREA}</p>
            </div>

            <div className="lg:col-span-7">
              {/* border + shadow-card is the site's recipe for a white card on
                  a white page — see home/Reviews.jsx and home/Services.jsx.
                  shadow-card alone is a 6% tint and does not read here. */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="rounded-card border-[1.5px] border-[#eeebf1] bg-white p-6 shadow-card sm:p-8"
              >
                <h2 className="text-xl font-bold text-[#17131c]">
                  Send us a message
                </h2>

                <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className={LABEL}>
                      First Name
                    </label>
                    {/* aria-invalid marks the field itself as failing, and
                        aria-describedby binds the message to it — without the
                        pair, a screen-reader user tabbing back into the input
                        hears the label and no indication anything is wrong.
                        role="alert" alone only announces once, at the moment
                        the message appears. */}
                    <input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      aria-invalid={errors.firstName ? 'true' : undefined}
                      aria-describedby={errors.firstName ? `${baseId}-firstName-error` : undefined}
                      className={FIELD}
                      {...register('firstName', { required: 'First name is required' })}
                    />
                    {errors.firstName && <p id={`${baseId}-firstName-error`} role="alert" className={ERROR}>{errors.firstName.message}</p>}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className={LABEL}>
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      aria-invalid={errors.lastName ? 'true' : undefined}
                      aria-describedby={errors.lastName ? `${baseId}-lastName-error` : undefined}
                      className={FIELD}
                      {...register('lastName', { required: 'Last name is required' })}
                    />
                    {errors.lastName && <p id={`${baseId}-lastName-error`} role="alert" className={ERROR}>{errors.lastName.message}</p>}
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-2">
                    <label htmlFor="email" className={LABEL}>
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      aria-invalid={errors.email ? 'true' : undefined}
                      aria-describedby={errors.email ? `${baseId}-email-error` : undefined}
                      className={FIELD}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          // Requires a dot in the domain, which the previous
                          // /^\S+@\S+$/ did not — it accepted "a@b". Still
                          // deliberately loose: the only real test of an
                          // address is sending to it, and an over-strict
                          // pattern rejects valid addresses.
                          value: /^\S+@\S+\.\S+$/,
                          message: 'Enter a valid email address, like name@example.com',
                        },
                      })}
                    />
                    {errors.email && <p id={`${baseId}-email-error`} role="alert" className={ERROR}>{errors.email.message}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="phoneNumber" className={LABEL}>
                      Phone Number
                    </label>
                    {/* maxLength={10} IS GONE, and it had to be: it capped the
                        input at ten CHARACTERS, so "(416) 720-1043" was
                        physically untypeable — the field silently stopped
                        accepting keystrokes mid-number. Validation now runs on
                        the extracted digits instead. */}
                    <input
                      id="phoneNumber"
                      type="tel"
                      autoComplete="tel"
                      maxLength={20}
                      aria-invalid={errors.phoneNumber ? 'true' : undefined}
                      aria-describedby={`${baseId}-phoneNumber-${errors.phoneNumber ? 'error' : 'hint'}`}
                      className={FIELD}
                      {...register('phoneNumber', {
                        required: 'Phone number is required',
                        validate: (value) =>
                          phoneDigits(value).length === 10 ||
                          'Enter a 10-digit phone number, like (416) 720-1043',
                      })}
                    />
                    {errors.phoneNumber ? (
                      <p id={`${baseId}-phoneNumber-error`} role="alert" className={ERROR}>{errors.phoneNumber.message}</p>
                    ) : (
                      <p id={`${baseId}-phoneNumber-hint`} className="mt-1.5 text-sm text-[#5f5868]">
                        Any format is fine.
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className={LABEL}>
                      Message
                    </label>
                    {/* WAS UNVALIDATED AND OPTIONAL. An empty message
                        submitted happily, producing a stored contact record
                        with nothing to respond to. */}
                    <textarea
                      id="message"
                      rows={4}
                      maxLength={MESSAGE_MAX}
                      aria-invalid={errors.message ? 'true' : undefined}
                      aria-describedby={`${baseId}-message-${errors.message ? 'error' : 'hint'}`}
                      className={FIELD}
                      {...register('message', {
                        required: 'Please tell us how we can help',
                        validate: (value) =>
                          String(value ?? '').trim().length >= MESSAGE_MIN ||
                          `Please write at least ${MESSAGE_MIN} characters so we can help.`,
                        maxLength: {
                          value: MESSAGE_MAX,
                          message: `Please keep your message under ${MESSAGE_MAX} characters.`,
                        },
                      })}
                    />
                    {errors.message ? (
                      <p id={`${baseId}-message-error`} role="alert" className={ERROR}>{errors.message.message}</p>
                    ) : (
                      <p id={`${baseId}-message-hint`} className="mt-1.5 text-sm text-[#5f5868]">
                        Up to {MESSAGE_MAX.toLocaleString()} characters.
                      </p>
                    )}
                  </div>

                  {/* HONEYPOT. Not `display:none` — some bots skip hidden
                      fields, and some browsers skip them on autofill. It is
                      pushed off-screen instead, then removed from the tab order
                      and from the accessibility tree, so no keyboard or screen
                      reader user can land on it. tabIndex={-1} and
                      autoComplete="off" stop a password manager filling it. */}
                  <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-px w-px overflow-hidden">
                    <label htmlFor={`${baseId}-company`}>Company</label>
                    <input
                      id={`${baseId}-company`}
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      {...register('company')}
                    />
                  </div>
                </div>

                {/* ── OUTCOME, ANNOUNCED POLITELY ──────────────────────────
                    This replaces two alert() calls. alert() is a modal that
                    steals focus, cannot be styled, is dismissed before a
                    screen-reader user can review it, and on failure destroyed
                    the one thing that mattered — the chance to read the error
                    beside the form still holding your text.

                    aria-live="polite", never "assertive": the visitor has just
                    pressed a button and is waiting: the result is expected, so
                    it should be spoken at the next natural pause rather than
                    interrupting whatever is being read.

                    The container is ALWAYS in the DOM, empty when idle.
                    A live region injected at the same moment as its text is
                    frequently not announced at all — the region has to be
                    present and observed before the content arrives. */}
                <div aria-live="polite" className="mt-6 empty:mt-0">
                  {status === 'success' && (
                    <div className="rounded-control border-[1.5px] border-[#bfe3c9] bg-[#f2faf4] px-4 py-3">
                      <p className="text-base font-semibold text-[#17131c]">
                        {SUCCESS_MESSAGE}
                      </p>
                      <FallbackContact />
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="rounded-control border-[1.5px] border-[#f0c5c0] bg-[#fdf4f3] px-4 py-3">
                      <p className="text-base font-semibold text-[#b42318]">
                        {ERROR_MESSAGE}
                      </p>
                      <FallbackContact />
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-control bg-brand-600 px-[30px] py-4 text-base font-semibold text-white transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#ece7f1] disabled:text-[#9b93a5]"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
