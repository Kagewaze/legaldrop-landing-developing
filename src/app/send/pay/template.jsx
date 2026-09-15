// Route commit marker only. No wait for payment quotes, intents or Stripe.
// StepChrome supplies the sole payment snapshot surface, outside these children.
export default function PaymentStepTemplate({ children }) {
  return <div data-booking-route="/send/pay">{children}</div>
}
