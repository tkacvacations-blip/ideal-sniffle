import { useState, useEffect } from 'react';
import { Home } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HeroProps {
  onBookNow: () => void;
}

export function Hero({ onBookNow }: HeroProps) {
  const [heroImage, setHeroImage] = useState('/image.png');

  useEffect(() => {
    fetchHeroImage();

    const channel = supabase
      .channel('hero-image-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
          filter: 'setting_key=eq.hero_image_url',
        },
        (payload) => {
          if (payload.new && 'setting_value' in payload.new) {
            setHeroImage(payload.new.setting_value as string);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchHeroImage = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'hero_image_url')
        .maybeSingle();

      if (error) {
        console.error('Error fetching hero image:', error);
        return;
      }

      if (data && data.setting_value) {
        setHeroImage(data.setting_value);
      }
    } catch (error) {
      console.error('Exception fetching hero image:', error);
    }
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative text-white overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }}></div>
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <img
        src={heroImage}
        alt=""
        className="hidden"
        onError={(e) => console.error('Hero image failed to load:', heroImage, e)}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Home className="w-12 h-12" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">TKAC Vacations & Adventures</h1>
              <p className="text-sm md:text-base text-blue-100">North Naples & Bonita Springs</p>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Your Paradise Awaits
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Luxury vacation rentals and unforgettable water adventures in beautiful North Naples and Bonita Springs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollToSection('rentals')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              View Vacation Rentals
            </button>
            <button
              onClick={() => scrollToSection('activities')}
              className="bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-400 transition-colors shadow-lg"
            >
              Explore Activities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
