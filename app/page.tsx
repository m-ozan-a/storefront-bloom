import { getManifest } from '@/lib/owuan';
import { SpecSection } from '@/components/sections/SpecSection';
import type { ManifestCampaign } from '@/lib/owuan/types';
import { Percent, Truck } from 'lucide-react';

function getCampaignIcon(type: string) {
  switch (type) {
    case 'discount_percent':
    case 'discount_amount':
      return <Percent className="h-5 w-5" />;
    case 'free_shipping':
      return <Truck className="h-5 w-5" />;
    default:
      return <Percent className="h-5 w-5" />;
  }
}

function CampaignBanner({ campaign }: { campaign: ManifestCampaign }) {
  let label = '';
  switch (campaign.campaignType) {
    case 'discount_percent':
      label = `%${campaign.discountPercent} İndirim`;
      break;
    case 'discount_amount':
      label = `₺${campaign.discountAmount} İndirim`;
      break;
    case 'free_shipping':
      label = 'Ücretsiz Kargo';
      break;
    case 'buy_x_get_y':
      label = campaign.title;
      break;
    default:
      label = campaign.title;
  }

  return (
    <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-200 px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600">
        {getCampaignIcon(campaign.campaignType)}
      </div>
      <div>
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{campaign.title}</p>
      </div>
    </div>
  );
}

export default async function HomePage() {
  let activeCampaigns: ManifestCampaign[] = [];
  let homepageSpec: unknown = null;
  let showCampaigns = true;
  try {
    const manifest = await getManifest();
    activeCampaigns = manifest.activeCampaigns || [];
    homepageSpec = manifest.activeTheme?.spec ?? null;
    const components: Record<string, boolean> = manifest.activeTheme?.components || {};
    showCampaigns = components['campaigns'] !== false;
  } catch {}

  return (
    <main>
      {showCampaigns && activeCampaigns.length > 0 && (
        <section className="container mx-auto px-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeCampaigns.slice(0, 3).map((campaign) => (
              <CampaignBanner key={campaign.uid} campaign={campaign} />
            ))}
          </div>
        </section>
      )}
      <SpecSection spec={homepageSpec} />
    </main>
  );
}
