import { Container } from '@/components/Container'

const faqs = [
  [
    {
      question: 'What About Us:',
      answer:
        'We Providing secure, reliable, and compliant delivery solutions for businesses and individuals.',
    },
    {
      question: 'What Is TDG-Certified Drivers',
      answer:
        'Expert couriers trained and certified for the transportation of dangerous goods, ensuring compliance and safety at every step.',
    },
    {
      question: 'What Is Secure Process Serving',
      answer:
        'Reliable and compliant delivery of legal documents with digital proof of service for law firms and professionals.',
    },
  ],
  [
    {
      question: 'What Is Wholesale B2B Delivery',
      answer:
        'Efficient and trackable delivery solutions for businesses managing bulk orders or sensitive materials.',
    },
    {
      question: 'Why Choose Us?',
      answer:
        "Real-Time Tracking: Always know where your delivery is. Compliance-Driven: TDG-certified couriers and secure handling. Flexible Delivery Options: Tailored solutions for legal, medical, and B2B needs. Customer Support: Dedicated to providing personalized assistance"
    },
  ],
  [
    {
      question: 'How do you guarantee the safety of medical supply or legal document deliveries?',
      answer:
        'Follow HIPAA and legal compliance protocols to ensure privacy and adherence to the law. Utilize trained couriers with expertise in handling sensitive items.Implement real-time tracking and require proof of delivery upon receipt to confirm safe handoff.',
    },
    {
      question: 'What do we provide?',
      answer:
        'Reliable logistics for B2B operations, offering scalable solutions for bulk deliveries, with full transparency and tracking from pickup to drop-off.',
    },
  ],
]

export function Faqs() {
  return (
    <section
      id="faqs"
      aria-labelledby="faqs-title"
      className="border-t border-gray-200 py-20 sm:py-32"
    >
      <Container>
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2
            id="faqs-title"
            className="text-3xl font-medium tracking-tight text-gray-900"
          >
            Frequently asked questions
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            If you have anything else you want to ask,{' '}
            <a
              href="mailto:info@legaldrop.com"
              className="text-[#6b21a8] underline"
            >
              reach out to us
            </a>
            .
          </p>
        </div>
        <ul
          role="list"
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:max-w-none lg:grid-cols-3"
        >
          {faqs.map((column, columnIndex) => (
            <li key={columnIndex}>
              <ul role="list" className="space-y-10">
                {column.map((faq, faqIndex) => (
                  <li key={faqIndex}>
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                      {faq.question}
                    </h3>
                    <p className="mt-4 text-sm text-gray-700">{faq.answer}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
