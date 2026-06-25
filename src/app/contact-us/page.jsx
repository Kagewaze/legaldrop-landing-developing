"use client"
import Image from 'next/image'
import track from '@/images/track.jpg'
import { Button } from '@/components/Button'
import { CirclesBackground } from '@/components/CirclesBackground'
import { Container } from '@/components/Container'
import { Layout } from '@/components/Layout'
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { BuildingOffice2Icon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'
import axios from "axios"

export default function ContactUs() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
   const [loading, setLoading] = useState(false); 

  const onSubmit = async (contactData) => {
    setLoading(true);
    let data = JSON.stringify(contactData);


    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://seal-app-9hhnm.ondigitalocean.app/api/contact-form',
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

  return (
    <Layout>
      <div className="relative isolate bg-white" id="contact-us">
        <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
        <div className="relative px-6 pb-20 pt-24 sm:pt-32 lg:static lg:px-8 lg:py-48">
        <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
            <div className="absolute inset-y-0 left-0 -z-10 w-full overflow-hidden bg-gray-100 ring-1 ring-gray-900/10 lg:w-1/2">
              <svg
                aria-hidden="true"
                className="absolute inset-0 size-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
              >
                <defs>
                  <pattern
                    x="100%"
                    y={-1}
                    id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
                    width={200}
                    height={200}
                    patternUnits="userSpaceOnUse"
                  >
                    <path d="M130 200V.5M.5 .5H200" fill="none" />
                  </pattern>
                </defs>
                <rect fill="white" width="100%" height="100%" strokeWidth={0} />
                <svg x="100%" y={-1} className="overflow-visible fill-gray-50">
                  <path d="M-470.5 0h201v201h-201Z" strokeWidth={0} />
                </svg>
                <rect fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)" width="100%" height="100%" strokeWidth={0} />
              </svg>
            </div>
            <h2 className="text-pretty text-4xl font-semibold tracking-tight text-purple-900 sm:text-5xl">
              Get In Touch
            </h2>
            <p className="mt-6 text-lg/8 text-gray-600">
            We are one click away from serving you better today!
            </p>
            <dl className="mt-10 space-y-4 text-base/7 text-gray-600">
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <span className="sr-only">Telephone</span>
                  <PhoneIcon aria-hidden="true" className="h-7 w-6 text-gray-400" />
                </dt>
                <dd>
                  <a href="tel: +13435984928" className="hover:text-gray-900">
                  +13435984928
                  </a>
                </dd>
              </div>
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <span className="sr-only">Email</span>
                  <EnvelopeIcon aria-hidden="true" className="h-7 w-6 text-gray-400" />
                </dt>
                <dd>
                  <a href="mailto:legaldropeng@gmail.com" className="hover:text-gray-900">
                  legaldropeng@gmail.com
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 pb-24 pt-20 sm:pb-32 lg:px-8 lg:py-48"
          >
            <div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm/6 font-semibold text-gray-900 text-start"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900"
                    {...register('firstName', { required: 'First name is required' })}
                  />
                  {errors.firstName && <p className="text-red-500">{errors.firstName.message}</p>}
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm/6 font-semibold text-gray-900 text-start"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900"
                    {...register('lastName', { required: 'Last name is required' })}
                  />
                  {errors.lastName && <p className="text-red-500">{errors.lastName.message}</p>}
                </div>

                {/* Email */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="email"
                    className="block text-sm/6 font-semibold text-gray-900 text-start"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email format',
                      },
                    })}
                  />
                  {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm/6 font-semibold text-gray-900 text-start"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    autoComplete="phoneNumber"
                    maxLength={10}
                    className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900"
                    {...register('phoneNumber', { required: 'Phone Number is required',
                  pattern: {
                        value: /^\d{10}$/,
                        message: 'Phone number must be 10 digits',
                  },
                  })}
                  />
                  {errors.phoneNumber && <p className="text-red-500">{errors.phoneNumber.message}</p>}
                </div>

                {/* Message */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="message"
                    className="block text-sm/6 font-semibold text-gray-900 text-start"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900"
                    {...register('message')}
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <Button
                type="submit"
                className="rounded-md bg-purple-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus:outline-2 focus:outline-offset-2 focus:outline-purple-600"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
