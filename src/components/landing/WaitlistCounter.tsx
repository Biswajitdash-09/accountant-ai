import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Users } from "lucide-react";

export const WaitlistCounter = () => {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCount();

    // Subscribe to real-time updates for insert events only
    const channel = supabase
      .channel('waitlist-count')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'waitlist',
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCount = async () => {
    try {
      // Use the secure function to get total count
      const { data, error } = await supabase.rpc('get_waitlist_position', {
        check_email: ''
      });

      if (!error && data && data.length > 0) {
        setCount(data[0].total_count || 0);
      }
    } catch (error) {
      console.error('Error fetching waitlist count:', error);
      // Fallback to 0 on error
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Users className="h-5 w-5 animate-pulse" />
        <span className="text-base sm:text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 text-foreground">
      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
      <span className="text-base sm:text-xl font-medium">
        Join{" "}
        <AnimatedCounter 
          value={count} 
          className="font-bold text-primary text-lg sm:text-2xl"
        />
        {" "}others on the waitlist
      </span>
    </div>
  );
};