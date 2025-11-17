import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export const APIKeyManager = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createKeyMutation = useMutation({
    mutationFn: async (keyName: string) => {
      if (!user) throw new Error("Not authenticated");
      
      // Generate random API key
      const randomBytes = crypto.getRandomValues(new Uint8Array(32));
      const apiKey = `ak_live_${Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')}`;
      
      // Hash the key
      const encoder = new TextEncoder();
      const data = encoder.encode(apiKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const { data: newKey, error } = await supabase
        .from('api_keys')
        .insert([{
          user_id: user.id,
          key_name: keyName,
          key_hash: keyHash,
          key_prefix: apiKey.substring(0, 15),
          rate_limit_per_minute: 60,
          is_active: true,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { ...newKey, full_key: apiKey };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setCreatedKey(data.full_key);
      toast({
        title: "API Key Created",
        description: "Make sure to copy your key now. You won't be able to see it again!",
      });
      setNewKeyName("");
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  return (
    <div className="space-y-4">
      {/* Create New Key */}
      <Card>
        <CardHeader>
          <CardTitle>Create New API Key</CardTitle>
          <CardDescription>
            Generate a new API key to authenticate your requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Key Name</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Production App"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
              <Button
                onClick={() => createKeyMutation.mutate(newKeyName)}
                disabled={!newKeyName || createKeyMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>
          </div>

          {createdKey && (
            <div className="p-4 border rounded-lg bg-muted space-y-2">
              <div className="flex items-center justify-between">
                <Label>Your New API Key</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(createdKey)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <code className="block p-2 bg-background rounded text-sm break-all">
                {createdKey}
              </code>
              <p className="text-xs text-destructive">
                ⚠️ Save this key now! You won't be able to see it again.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Keys */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Manage your existing API keys
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No API keys yet. Create one above to get started.
            </div>
          ) : (
            apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{key.key_name}</span>
                    <Badge variant={key.is_active ? "default" : "secondary"}>
                      {key.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <code className="text-xs text-muted-foreground">
                    {key.key_prefix}...
                  </code>
                  <div className="text-xs text-muted-foreground">
                    Created {format(new Date(key.created_at!), 'PPp')}
                  </div>
                  {key.last_used_at && (
                    <div className="text-xs text-muted-foreground">
                      Last used {format(new Date(key.last_used_at), 'PPp')}
                    </div>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteKeyMutation.mutate(key.id)}
                  disabled={deleteKeyMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
