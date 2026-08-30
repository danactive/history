import type { Metadata } from 'next'

import AdminAssetsClient from '../../../src/components/AdminAssets/AssetsClient'
import { getAllAssetStripAddresses } from '../../../src/lib/admin/assets'

export const metadata: Metadata = {
  title: 'Admin > Assets - History App',
}

export default async function AdminAssetsPage() {
  const addresses = await getAllAssetStripAddresses()
  return <AdminAssetsClient addresses={addresses} />
}
