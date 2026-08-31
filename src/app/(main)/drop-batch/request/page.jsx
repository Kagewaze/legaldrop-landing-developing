import { notFound } from 'next/navigation'

import { DropBatchRequestFlow } from '@/components/dropbatch/DropBatchRequestFlow'
import { DROPBATCH_PUBLIC_QUOTE_ENABLED } from '@/lib/config'

export const metadata = {
  title: 'Check DropBatch availability | Druppr',
  description: 'Check an authoritative DropBatch price for a scheduled long-distance route.',
}

export default function DropBatchRequestPage() {
  if (!DROPBATCH_PUBLIC_QUOTE_ENABLED) notFound()
  return <DropBatchRequestFlow />
}
