import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHMRCData } from "@/hooks/useHMRCData";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Calendar } from "lucide-react";
import { format } from "date-fns";

export const HMRCDataDisplay = () => {
  const { taxData, isLoading } = useHMRCData();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!taxData || taxData.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>No HMRC data available</p>
            <p className="text-sm">Click "Sync Now" to fetch your tax data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {taxData.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg capitalize">
                {item.data_type.replace('_', ' ')}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>
              Tax Year: {item.tax_year}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {item.data && Object.keys(item.data).length > 0 ? (
                <>
                  {Object.entries(item.data).slice(0, 5).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="font-medium">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
              <div className="text-xs text-muted-foreground pt-2">
                Updated: {format(new Date(item.updated_at), 'PP')}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
