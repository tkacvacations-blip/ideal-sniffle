import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PromoBannerData {
  id: string;
  message: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
}

export function PromoBanner() {
  console.log('🎉 PromoBanner COMPONENT LOADED');

  const [banner, setBanner] = useState<PromoBannerData | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  console.log('🔔 PromoBanner component rendered', { banner, isVisible });

  useEffect(() => {
    console.log('🚀 PromoBanner useEffect running');

    const urlParams = new URLSearchParams(window.location.search);
    const promoCode = urlParams.get('promo') || urlParams.get('code');

    if (promoCode?.toUpperCase() === 'NOBANNER') {
      setIsVisible(false);
      console.log('NOBANNER promo code detected - hiding banner');
      return;
    }

    fetchActiveBanner();
  }, []);

  const fetchActiveBanner = async () => {
    try {
      console.log('Fetching active promo banner...');
      const { data, error } = await supabase
        .from('promo_banners')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching promo banner:', error);
        return;
      }

      console.log('Promo banner data:', data);

      if (data) {
        setBanner(data);
        console.log('Banner set successfully:', data);
      } else {
        console.log('No active promo banner found');
      }
    } catch (error) {
      console.error('Error fetching promo banner:', error);
    }
  };

  if (!banner || !isVisible) {
    console.log('PromoBanner returning null', { banner, isVisible });
    return null;
  }

  console.log('PromoBanner rendering banner', banner);

  return (
    <div
      className="relative py-3 px-4 text-center transition-all"
      style={{
        backgroundColor: banner.background_color,
        color: banner.text_color,
      }}
    >
      <p className="font-medium text-sm md:text-base">
        {banner.message}
      </p>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
        aria-label="Close banner"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
