import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Shield, FileText, DollarSign, Clock, Gavel, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '@/hooks/useAI';
import CreditBalance from '@/components/CreditBalance';
import { useToast } from '@/components/ui/use-toast';
import TaxCountrySelector, { type TaxCountry } from '@/components/tax/TaxCountrySelector';
import { Textarea } from '@/components/ui/textarea';

interface ForensicAlert {
  type: 'illegal_charge' | 'excessive_interest' | 'loan_violation' | 'suspicious_transaction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  amount?: number;
  legalLimit?: number;
  recommendation: string;
  reference: string;
}

interface ForensicAnalysis {
  alerts: ForensicAlert[];
  summary: string;
  complianceScore: number;
  totalIssuesValue: number;
  legalReferences: string[];
}

const ForensicAnalyzer = () => {
  const [selectedCountry, setSelectedCountry] = useState<TaxCountry>('USA');
  const [transactionData, setTransactionData] = useState('');
  const [analysis, setAnalysis] = useState<ForensicAnalysis | null>(null);
  const { generateResponse, isLoading, availableCredits } = useAI();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (!transactionData.trim()) {
      toast({
        title: "Input Required",
        description: "Please provide transaction data or account information to analyze.",
        variant: "destructive",
      });
      return;
    }

    try {
      const forensicPrompt = `
FORENSIC FINANCIAL ANALYSIS REQUEST

Country: ${selectedCountry}
Analysis Type: Comprehensive Forensic Review for Illegal Financial Activities

Transaction/Account Data:
${transactionData}

INSTRUCTIONS:
You are a forensic financial analyst trained in the banking and financial laws of ${selectedCountry}. 

For ${selectedCountry}, analyze the provided data for:

1. ILLEGAL BANK CHARGES:
   - Unauthorized fees
   - Excessive overdraft penalties
   - Hidden charges not disclosed
   - Charges exceeding legal limits

2. INTEREST RATE VIOLATIONS:
   - Usury violations (excessive interest rates)
   - Variable rate changes without proper notice
   - Predatory lending practices
   - APR calculation errors

3. LOAN COMPLIANCE ISSUES:
   - Statutory repayment period violations
   - Improper loan terms
   - Missing required disclosures
   - Unfair collection practices

4. SUSPICIOUS TRANSACTIONS:
   - Unexplained charges
   - Duplicate transactions
   - Timing irregularities
   - Pattern anomalies

PROVIDE ANALYSIS IN THIS EXACT JSON FORMAT:
{
  "alerts": [
    {
      "type": "illegal_charge|excessive_interest|loan_violation|suspicious_transaction",
      "severity": "low|medium|high|critical",
      "description": "Detailed description of the issue",
      "amount": numeric_value_if_applicable,
      "legalLimit": legal_limit_if_applicable,
      "recommendation": "Action to take",
      "reference": "Specific law or regulation"
    }
  ],
  "summary": "Overall analysis summary",
  "complianceScore": numeric_score_0_to_100,
  "totalIssuesValue": total_financial_impact,
  "legalReferences": ["List of applicable laws and regulations"]
}

Base your analysis on actual ${selectedCountry} financial regulations and banking laws.
`;

      const response = await generateResponse(forensicPrompt);
      
      try {
        // Try to extract JSON from the response
        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysisData = JSON.parse(jsonMatch[0]);
          setAnalysis(analysisData);
        } else {
          // Fallback if no JSON found
          setAnalysis({
            alerts: [{
              type: 'suspicious_transaction',
              severity: 'medium',
              description: 'Analysis completed - see detailed response below',
              recommendation: 'Review the detailed analysis provided',
              reference: `${selectedCountry} Banking Regulations`
            }],
            summary: response.text,
            complianceScore: 75,
            totalIssuesValue: 0,
            legalReferences: [`${selectedCountry} Banking Laws`]
          });
        }
      } catch (parseError) {
        // Fallback for parsing errors
        setAnalysis({
          alerts: [{
            type: 'suspicious_transaction',
            severity: 'medium',
            description: 'Forensic analysis completed - detailed review required',
            recommendation: 'Review the complete analysis report',
            reference: `${selectedCountry} Financial Regulations`
          }],
          summary: response.text,
          complianceScore: 70,
          totalIssuesValue: 0,
          legalReferences: [`${selectedCountry} Banking Compliance Laws`]
        });
      }

      toast({
        title: "Forensic Analysis Complete",
        description: `Analysis completed for ${selectedCountry} regulations.`,
      });

    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to complete forensic analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200';
      case 'high': return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-200';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200';
      case 'low': return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'illegal_charge': return <DollarSign className="h-4 w-4" />;
      case 'excessive_interest': return <AlertTriangle className="h-4 w-4" />;
      case 'loan_violation': return <FileText className="h-4 w-4" />;
      case 'suspicious_transaction': return <Shield className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const exportAnalysis = () => {
    if (!analysis) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      country: selectedCountry,
      analysis: analysis,
      transactionData: transactionData
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forensic-analysis-${selectedCountry}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Analysis Exported",
      description: "Forensic analysis has been downloaded successfully.",
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                <Gavel className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="font-heading">AI Forensic Analyzer</CardTitle>
                <p className="text-sm text-muted-foreground">Detect illegal financial activities and compliance violations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                Legal Compliance
              </Badge>
              <CreditBalance showBuyButton={false} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Country Selection and Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Analysis Configuration</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select your country for jurisdiction-specific legal analysis
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Jurisdiction</label>
            <TaxCountrySelector value={selectedCountry} onChange={setSelectedCountry} />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Transaction Data / Account Information
            </label>
            <Textarea
              value={transactionData}
              onChange={(e) => setTransactionData(e.target.value)}
              placeholder={`Paste your transaction data, bank statements, or account information here...

Example data to include:
- Transaction amounts and dates
- Fee descriptions and amounts
- Interest rates and APR
- Loan terms and conditions
- Account charges and penalties
- Any suspicious activities

The AI will analyze this data against ${selectedCountry} banking laws and regulations.`}
              className="min-h-[200px] resize-y"
            />
          </div>

          <Button 
            onClick={handleAnalyze}
            disabled={isLoading || !transactionData.trim() || availableCredits <= 0}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Shield className="h-4 w-4 mr-2 animate-spin" />
                Analyzing for Legal Violations...
              </>
            ) : (
              <>
                <Gavel className="h-4 w-4 mr-2" />
                Run Forensic Analysis
              </>
            )}
          </Button>

          {availableCredits <= 0 && (
            <p className="text-xs text-muted-foreground text-center">
              You've used all your credits. They reset daily or you can purchase more.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Forensic Analysis Results</CardTitle>
                  <Button variant="outline" size="sm" onClick={exportAnalysis}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{analysis.complianceScore}/100</div>
                    <div className="text-sm text-muted-foreground">Compliance Score</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-destructive">{analysis.alerts.length}</div>
                    <div className="text-sm text-muted-foreground">Issues Found</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      ${analysis.totalIssuesValue.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Potential Recovery</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Executive Summary</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysis.summary}</p>
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            {analysis.alerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Legal Violations & Issues ({analysis.alerts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-[500px]">
                    <div className="space-y-4">
                      {analysis.alerts.map((alert, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 border rounded-lg ${getSeverityColor(alert.severity)}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getTypeIcon(alert.type)}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {alert.severity.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {alert.type.replace('_', ' ').toUpperCase()}
                                </Badge>
                              </div>
                              
                              <h4 className="font-semibold">{alert.description}</h4>
                              
                              {(alert.amount || alert.legalLimit) && (
                                <div className="text-sm">
                                  {alert.amount && <span>Amount: ${alert.amount.toLocaleString()}</span>}
                                  {alert.legalLimit && (
                                    <span className="ml-4">Legal Limit: ${alert.legalLimit.toLocaleString()}</span>
                                  )}
                                </div>
                              )}
                              
                              <div className="text-sm">
                                <strong>Recommendation:</strong> {alert.recommendation}
                              </div>
                              
                              <div className="text-xs text-muted-foreground">
                                <strong>Legal Reference:</strong> {alert.reference}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Legal References */}
            {analysis.legalReferences.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Applicable Laws & Regulations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.legalReferences.map((ref, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        {ref}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default ForensicAnalyzer;