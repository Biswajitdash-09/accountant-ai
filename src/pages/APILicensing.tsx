import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Eye, EyeOff, Plus, Trash2, Key } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { APIUsageDashboard } from "@/components/api/APIUsageDashboard";

export default function APILicensing() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPrefix, setNewKeyPrefix] = useState("live");

  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('api_keys').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const createKeyMutation = useMutation({
    mutationFn: async (keyName: string) => {
      if (!user) throw new Error("Not authenticated");
      const randomBytes = crypto.getRandomValues(new Uint8Array(32));
      const apiKey = `ak_${newKeyPrefix}_${Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(apiKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const { data: newKey, error } = await supabase.from('api_keys').insert([{
        user_id: user.id, key_name: keyName, key_hash: keyHash, key_prefix: apiKey.substring(0, 12),
        rate_limit_per_minute: 60, is_active: true
      }]).select().single();
      if (error) throw error;
      return { ...newKey, full_key: apiKey };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast({ title: "API Key Created", description: "Save this key now!" });
      setShowKey({ [data.id]: true });
      setNewKeyName("");
    }
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase.from('api_keys').delete().eq('id', keyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast({ title: "Success", description: "API key deleted" });
    }
  });

  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Key className="h-8 w-8 text-primary" />API Gateway
        </h1>
        <p className="text-muted-foreground mt-2">Public API endpoints for Arnold integration</p>
      </div>
      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="keys">Keys</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>
        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>API Keys</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Key name" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} />
                <select value={newKeyPrefix} onChange={(e) => setNewKeyPrefix(e.target.value)} className="h-10 px-3 rounded-md border">
                  <option value="live">Live</option>
                  <option value="test">Test</option>
                </select>
                <Button onClick={() => newKeyName && createKeyMutation.mutate(newKeyName)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {isLoading ? <div>Loading...</div> : apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{key.key_name}</h3>
                      <Badge>{key.is_active ? "active" : "inactive"}</Badge>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-sm">
                      <code className="bg-muted px-2 py-1 rounded">
                        {showKey[key.id] && (key as any).full_key ? (key as any).full_key : `${key.key_prefix}••••`}
                      </code>
                      <Button variant="ghost" size="sm" onClick={() => setShowKey({ ...showKey, [key.id]: !showKey[key.id] })}>
                        {showKey[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText((key as any).full_key || key.key_prefix)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteKeyMutation.mutate(key.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="usage"><APIUsageDashboard /></TabsContent>
        <TabsContent value="webhooks"><Card><CardHeader><CardTitle>Webhooks (Phase 5)</CardTitle></CardHeader></Card></TabsContent>
      </Tabs>
    </div>
  );
}
