import { Button } from "@/components/ui/button";
import { useHMRCConnection } from "@/hooks/useHMRCConnection";
import { Loader2 } from "lucide-react";

export const HMRCAuthButton = () => {
  const { initiateConnection } = useHMRCConnection();

  return (
    <Button
      onClick={() => initiateConnection.mutate()}
      disabled={initiateConnection.isPending}
      size="lg"
      className="w-full sm:w-auto"
    >
      {initiateConnection.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        'Connect to HMRC'
      )}
    </Button>
  );
};
