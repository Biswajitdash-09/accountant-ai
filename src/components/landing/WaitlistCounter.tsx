import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Users } from "lucide-react";

export const WaitlistCounter = () => {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCount();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('waitlist-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
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
      const { count: totalCount, error } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });

      if (!error && totalCount !== null) {
        setCount(totalCount);
      }
    } catch (error) {
      console.error('Error fetching waitlist count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Users className="h-5 w-5 animate-pulse" />
        <span className="text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 text-foreground">
      <Users className="h-6 w-6 text-primary" />
      <span className="text-xl font-medium">
        Join{" "}
        <AnimatedCounter 
          value={count} 
          className="font-bold text-primary text-2xl"
        />
        {" "}others on the waitlist
      </span>
    </div>
  );
};