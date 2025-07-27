
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mic, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useVoiceEntries, VoiceEntry } from '@/hooks/useVoiceEntries';
import { formatDistanceToNow } from 'date-fns';

const StatusBadge = ({ status }: { status: VoiceEntry['status'] }) => {
  const statusConfig = {
    uploaded: { icon: Clock, variant: 'secondary' as const, label: 'Uploaded' },
    processing: { icon: Clock, variant: 'default' as const, label: 'Processing' },
    done: { icon: CheckCircle, variant: 'default' as const, label: 'Completed' },
    failed: { icon: XCircle, variant: 'destructive' as const, label: 'Failed' }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export const VoiceEntriesList = () => {
  const { voiceEntries, isLoading, deleteVoiceEntry } = useVoiceEntries();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading voice entries...</div>
        </CardContent>
      </Card>
    );
  }

  if (voiceEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No voice recordings yet</p>
            <p className="text-sm">Start by recording your first expense</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Voice Entries ({voiceEntries.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {voiceEntries.map((entry) => (
          <div key={entry.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <StatusBadge status={entry.status} />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteVoiceEntry.mutate(entry.id)}
                  disabled={deleteVoiceEntry.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {entry.transcript && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Transcript:</div>
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                  {entry.transcript}
                </div>
              </div>
            )}

            {entry.parsed && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Extracted Transaction:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {entry.parsed.amount && (
                    <div>
                      <span className="font-medium">Amount:</span> {entry.parsed.currency || 'INR'} {entry.parsed.amount}
                    </div>
                  )}
                  {entry.parsed.category && (
                    <div>
                      <span className="font-medium">Category:</span> {entry.parsed.category}
                    </div>
                  )}
                  {entry.parsed.description && (
                    <div className="col-span-2">
                      <span className="font-medium">Description:</span> {entry.parsed.description}
                    </div>
                  )}
                </div>
              </div>
            )}

            {entry.error_message && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                <span className="font-medium">Error:</span> {entry.error_message}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
