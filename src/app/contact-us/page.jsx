"use client"
import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useForm } from 'react-hook-form';
import { useState } from 'react';
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

export default function ContactUs() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
   const [loading, setLoading] = useState(false);

  const onSubmit = async (contactData) => {
    setLoading(true);
    let data = JSON.stringify(contactData);


    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${API_BASE_URL}/contact-form`,
      headers: {
        'Content-Type': 'application/json',
      },
      data : data
    };

    axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      alert('Message sent successfully!');

      reset();
    })
    .catch((error) => {
      console.log(error);
      alert('Failed to send the form. Something went wrong.');
    })
    .finally(() => {
      setLoading(false);
    }
  );
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
                    <input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      className={FIELD}
                      {...register('firstName', { required: 'First name is required' })}
                    />
                    {errors.firstName && <p role="alert" className={ERROR}>{errors.firstName.message}</p>}
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
                      className={FIELD}
                      {...register('lastName', { required: 'Last name is required' })}
                    />
                    {errors.lastName && <p role="alert" className={ERROR}>{errors.lastName.message}</p>}
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
                      className={FIELD}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Invalid email format',
                        },
                      })}
                    />
                    {errors.email && <p role="alert" className={ERROR}>{errors.email.message}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="phoneNumber" className={LABEL}>
                      Phone Number
                    </label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      autoComplete="tel"
                      maxLength={10}
                      className={FIELD}
                      {...register('phoneNumber', { required: 'Phone Number is required',
                    pattern: {
                          value: /^\d{10}$/,
                          message: 'Phone number must be 10 digits',
                    },
                    })}
                    />
                    {errors.phoneNumber && <p role="alert" className={ERROR}>{errors.phoneNumber.message}</p>}
                  </div>

                  {/* Message */}
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className={LABEL}>
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className={FIELD}
                      {...register('message')}
                    />
                  </div>
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
