import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FileText, ExternalLink, Download, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TaxFilingWidget = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [taxYear, setTaxYear] = useState(new Date().getFullYear().toString());
  const [preparing, setPreparing] = useState(false);
  const [taxData, setTaxData] = useState<any>(null);
  const [userRegion, setUserRegion] = useState<string>('US');

  // Fetch user's region from profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('region')
        .eq('id', user.id)
        .single();
      
      if (profile?.region) {
        setUserRegion(profile.region);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  const prepareTaxFiling = async () => {
    if (!user) return;

    try {
      setPreparing(true);
      toast({
        title: "Preparing tax filing",
        description: "Analyzing your financial data...",
      });

      console.log('Preparing tax filing for region:', userRegion);

      const { data, error } = await supabase.functions.invoke('prepare-tax-filing', {
        body: { 
          taxYear: parseInt(taxYear),
          region: userRegion 
        },
      });

      if (error) throw error;

      if (data?.success) {
        setTaxData(data.taxData);
        toast({
          title: "Tax filing prepared!",
          description: data.taxData.message,
        });
      }
    } catch (error) {
      console.error('Tax filing error:', error);
      toast({
        title: "Preparation failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setPreparing(false);
    }
  };

  const getFilingInstructions = (region: string) => {
    switch (region) {
      case 'US':
        return {
          title: 'US Tax Filing (IRS)',
          instructions: [
            'Download your tax data package',
            'Visit TurboTax or H&R Block',
            'Import your financial data',
            'Review and e-file your return',
          ],
          links: [
            { label: 'TurboTax', url: 'https://turbotax.intuit.com' },
            { label: 'H&R Block', url: 'https://www.hrblock.com' },
          ],
        };
      case 'UK':
        return {
          title: 'UK Tax Filing (HMRC)',
          instructions: [
            'Use the HMRC Integration tab',
            'Authorize with HMRC MTD',
            'Review auto-filled data',
            'Submit your Self Assessment',
          ],
          links: [
            { label: 'HMRC Integration', url: '/hmrc-integration' },
          ],
        };
      case 'India':
        return {
          title: 'India Income Tax e-Filing',
          instructions: [
            'Visit the Income Tax e-filing portal',
            'Login with your PAN',
            'Select appropriate ITR form',
            'Import financial data from our export',
          ],
          links: [
            { label: 'e-Filing Portal', url: 'https://www.incometax.gov.in/iec/foportal' },
          ],
        };
      case 'Nigeria':
        return {
          title: 'Nigeria Tax Filing (FIRS)',
          instructions: [
            'Generate FIRS payment reference',
            'Visit JTB Self-Service portal',
            'Submit your tax return',
            'Make payment via Remita',
          ],
          links: [
            { label: 'JTB Portal', url: 'https://www.jtb.gov.ng' },
          ],
        };
      default:
        return null;
    }
  };

  const instructions = taxData ? getFilingInstructions(taxData.region) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Tax Filing Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Year Selection */}
        <div className="space-y-2">
          <Label htmlFor="tax-year">Tax Year</Label>
          <Select value={taxYear} onValueChange={setTaxYear}>
            <SelectTrigger id="tax-year">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prepare Button */}
        <Button
          className="w-full"
          onClick={prepareTaxFiling}
          disabled={preparing}
        >
          {preparing ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Preparing...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Prepare Tax Filing
            </>
          )}
        </Button>

        {/* Tax Summary */}
        {taxData && (
          <div className="space-y-4 pt-4 border-t">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {taxData.message}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Gross Income</p>
                <p className="text-lg font-semibold">${taxData.grossIncome?.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Deductions</p>
                <p className="text-lg font-semibold">${taxData.deductions?.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Taxable Income</p>
                <p className="text-lg font-semibold">${taxData.taxableIncome?.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Estimated Tax</p>
                <p className="text-lg font-semibold text-destructive">
                  ${taxData.estimatedTax?.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Filing Instructions */}
            {instructions && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-semibold">{instructions.title}</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  {instructions.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
                <div className="flex flex-wrap gap-2 pt-2">
                  {instructions.links.map((link, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.label}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (!taxData) return;
                      
                      const dataStr = JSON.stringify(taxData, null, 2);
                      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                      const exportFileDefaultName = `tax-filing-${taxYear}-${userRegion}.json`;
                      
                      const linkElement = document.createElement('a');
                      linkElement.setAttribute('href', dataUri);
                      linkElement.setAttribute('download', exportFileDefaultName);
                      linkElement.click();
                      
                      toast({
                        title: "Export complete",
                        description: "Tax data downloaded successfully",
                      });
                    }}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export Data
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaxFilingWidget;
