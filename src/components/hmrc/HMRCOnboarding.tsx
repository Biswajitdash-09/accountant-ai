import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck, RefreshCw, FileText, ArrowRight } from "lucide-react";
import { HMRCAuthButton } from "./HMRCAuthButton";

export const HMRCOnboarding = () => {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl">Connect Your HMRC Account</CardTitle>
          <CardDescription className="text-base">
            Automatically import your UK tax data for seamless accounting
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-6">
          <HMRCAuthButton />
        </CardContent>
      </Card>

      {/* Benefits */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Why Connect HMRC?</CardTitle>
            <CardDescription>
              Save time and improve accuracy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Automatic Data Import</div>
                <div className="text-sm text-muted-foreground">
                  Self-assessment, VAT returns, and payment history
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Real-Time Sync</div>
                <div className="text-sm text-muted-foreground">
                  Always have the latest tax information
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Reduced Errors</div>
                <div className="text-sm text-muted-foreground">
                  Eliminate manual data entry mistakes
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Better Compliance</div>
                <div className="text-sm text-muted-foreground">
                  Official HMRC data ensures accuracy
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What You'll Need</CardTitle>
            <CardDescription>
              Requirements for HMRC connection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <div>
                <div className="font-medium">UK HMRC Government Gateway Account</div>
                <div className="text-sm text-muted-foreground">
                  Your existing HMRC online account credentials
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <div>
                <div className="font-medium">Self-Assessment or Business Registration</div>
                <div className="text-sm text-muted-foreground">
                  Active UTR (Unique Taxpayer Reference) number
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <div>
                <div className="font-medium">Active Tax Obligations</div>
                <div className="text-sm text-muted-foreground">
                  Current or recent tax filings with HMRC
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
          <CardDescription>
            Simple 3-step connection process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium">1. Secure Authorization</h4>
              <p className="text-sm text-muted-foreground">
                Log in to your HMRC account and authorize our app
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium">2. Automatic Sync</h4>
              <p className="text-sm text-muted-foreground">
                We securely fetch your tax data from HMRC
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium">3. View & Manage</h4>
              <p className="text-sm text-muted-foreground">
                Access all your tax data in one place
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-muted">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium mb-1">Your Security Matters</h4>
              <p className="text-sm text-muted-foreground">
                We use OAuth 2.0 authentication - the same secure method used by major banks and financial institutions. 
                Your HMRC credentials are never stored in our system. All data is encrypted and securely transmitted.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="flex justify-center">
        <HMRCAuthButton />
      </div>
    </div>
  );
};
