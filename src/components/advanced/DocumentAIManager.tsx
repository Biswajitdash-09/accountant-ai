
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, FileText, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { useDocumentAI } from '@/hooks/useDocumentAI';
import { useDocuments } from '@/hooks/useDocuments';

export const DocumentAIManager = () => {
  const { analyses, isLoading, createAnalysis } = useDocumentAI();
  const { documents } = useDocuments();
  const [processingDoc, setProcessingDoc] = useState<string | null>(null);

  const runAIAnalysis = async (documentId: string) => {
    setProcessingDoc(documentId);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await createAnalysis.mutateAsync({
      document_id: documentId,
      analysis_type: 'text_extraction',
      confidence_score: Math.random() * 40 + 60, // 60-100%
      extracted_data: {
        text: 'Sample extracted text from document...',
        entities: ['Amount: $1,250', 'Date: 2024-01-15', 'Vendor: ABC Company'],
        keywords: ['invoice', 'payment', 'business']
      },
      suggested_categorization: {
        category: 'Business Expense',
        subcategory: 'Office Supplies',
        confidence: 0.85
      }
    });
    
    setProcessingDoc(null);
  };

  const unanalyzedDocs = documents.filter(doc => 
    !analyses.some(analysis => analysis.document_id === doc.id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyses.length > 0 
                ? Math.round(analyses.reduce((sum, a) => sum + a.confidence_score, 0) / analyses.length)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Docs</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unanalyzedDocs.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Document Analysis
          </CardTitle>
          <CardDescription>
            Automatically extract data and categorize your documents using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {unanalyzedDocs.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Documents Ready for Analysis</h4>
                <div className="grid grid-cols-1 gap-2">
                  {unanalyzedDocs.slice(0, 5).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{doc.file_name}</span>
                        <Badge variant="secondary">{doc.file_type}</Badge>
                      </div>
                      {processingDoc === doc.id ? (
                        <div className="flex items-center gap-2">
                          <Progress value={66} className="w-20" />
                          <span className="text-sm text-muted-foreground">Processing...</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => runAIAnalysis(doc.id)}
                          disabled={createAnalysis.isPending}
                        >
                          Analyze
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-3">Recent Analyses</h4>
              <div className="space-y-2">
                {analyses.slice(0, 5).map((analysis) => {
                  const doc = documents.find(d => d.id === analysis.document_id);
                  return (
                    <div key={analysis.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Brain className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">{doc?.file_name || 'Unknown Document'}</span>
                        <Badge variant="outline">
                          {Math.round(analysis.confidence_score)}% confidence
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
