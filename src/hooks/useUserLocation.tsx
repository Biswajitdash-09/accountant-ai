
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface UserLocation {
  countryCode: string;
  countryName: string;
  currency: string;
  isIndian: boolean;
}

export const useUserLocation = () => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const detectUserLocation = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // First check if we have stored location data
        const { data: storedLocation } = await supabase
          .from('user_locations')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (storedLocation) {
          setLocation({
            countryCode: storedLocation.country_code || 'US',
            countryName: storedLocation.country_name || 'United States',
            currency: storedLocation.currency || 'usd',
            isIndian: storedLocation.country_code === 'IN'
          });
          setLoading(false);
          return;
        }

        // If no stored location, detect via IP (using a free service)
        try {
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();
          
          const detectedLocation = {
            countryCode: data.country_code || 'US',
            countryName: data.country_name || 'United States',
            currency: data.country_code === 'IN' ? 'inr' : 'usd',
            isIndian: data.country_code === 'IN'
          };

          // Store the detected location
          await supabase.from('user_locations').insert({
            user_id: user.id,
            country_code: detectedLocation.countryCode,
            country_name: detectedLocation.countryName,
            currency: detectedLocation.currency,
            detected_from_ip: true
          });

          setLocation(detectedLocation);
        } catch (ipError) {
          console.error('IP detection failed:', ipError);
          // Fallback to US
          const fallbackLocation = {
            countryCode: 'US',
            countryName: 'United States',
            currency: 'usd',
            isIndian: false
          };
          setLocation(fallbackLocation);
        }
      } catch (error) {
        console.error('Error detecting user location:', error);
        setLocation({
          countryCode: 'US',
          countryName: 'United States',
          currency: 'usd',
          isIndian: false
        });
      } finally {
        setLoading(false);
      }
    };

    detectUserLocation();
  }, [user]);

  return { location, loading };
};
