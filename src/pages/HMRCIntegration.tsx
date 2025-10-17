import Layout from "@/components/Layout";
import { HMRCAuthButton } from "@/components/hmrc/HMRCAuthButton";
import { HMRCConnectionManager } from "@/components/hmrc/HMRCConnectionManager";
import { HMRCDataDisplay } from "@/components/hmrc/HMRCDataDisplay";
import { useHMRCConnection } from "@/hooks/useHMRCConnection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ShieldCheck, RefreshCw } from "lucide-react";

const HMRCIntegration = () => {
  const { isConnected, isLoading } = useHMRCConnection();

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">HMRC Integration</h1>
          <p className="text-muted-foreground mt-2">
            Connect your HMRC account to automatically import tax data
          </p>
        </div>

        {!isLoading && !isConnected ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>
                  Connect your HMRC account in just a few clicks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">Secure OAuth Connection</div>
                      <div className="text-sm text-muted-foreground">
                        Your credentials are never stored in our system
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <RefreshCw className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">Automatic Sync</div>
                      <div className="text-sm text-muted-foreground">
                        Keep your tax data up to date automatically
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">Complete Tax Data</div>
                      <div className="text-sm text-muted-foreground">
                        Import self-assessment, VAT, and more
                      </div>
                    </div>
                  </div>
                </div>
                <HMRCAuthButton />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What You'll Need</CardTitle>
                <CardDescription>
                  Requirements for HMRC connection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5">•</div>
                    <div>UK HMRC Government Gateway account</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5">•</div>
                    <div>Self-assessment or business tax registration</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5">•</div>
                    <div>Active tax obligations with HMRC</div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <HMRCConnectionManager />
            <div>
              <h2 className="text-2xl font-semibold mb-4">Your Tax Data</h2>
              <HMRCDataDisplay />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HMRCIntegration;
