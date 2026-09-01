import { notFound } from 'next/navigation'

import { DropBatchRequestFlow } from '@/components/dropbatch/DropBatchRequestFlow'
import { DROPBATCH_PUBLIC_QUOTE_ENABLED } from '@/lib/config'

export const metadata = {
  title: 'Get your DropBatch price | Druppr',
  description: 'Get an authoritative DropBatch price for an ASAP or scheduled long-distance route.',
}

export default function DropBatchRequestPage() {
  if (!DROPBATCH_PUBLIC_QUOTE_ENABLED) notFound()
  return <DropBatchRequestFlow />
}
