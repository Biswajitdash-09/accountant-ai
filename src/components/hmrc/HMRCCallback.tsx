import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useHMRCAuth } from "@/hooks/useHMRCAuth";
import { Loader2 } from "lucide-react";

const HMRCCallback = () => {
  const [searchParams] = useSearchParams();
  const { handleCallback, isProcessing } = useHMRCAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state) {
      handleCallback.mutate({ code, state });
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto" />
        <h2 className="text-2xl font-semibold">
          {isProcessing ? "Connecting to HMRC..." : "Processing..."}
        </h2>
        <p className="text-muted-foreground">
          Please wait while we complete the connection
        </p>
      </div>
    </div>
  );
};

export default HMRCCallback;
