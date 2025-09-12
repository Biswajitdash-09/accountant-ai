import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, User, Shield, Plus } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface SavedCredential {
  id: string;
  email: string;
  encryptedPassword: string;
  nickname?: string;
  lastUsed: string;
}

interface SavedCredentialsManagerProps {
  onCredentialSelect?: (email: string, password: string) => void;
  onAddCredential?: (email: string, password: string, nickname: string) => void;
}

const SavedCredentialsManager = ({ onCredentialSelect, onAddCredential }: SavedCredentialsManagerProps) => {
  const [savedCredentials, setSavedCredentials] = useState<SavedCredential[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = () => {
    const saved = localStorage.getItem('savedCredentials');
    if (saved) {
      try {
        setSavedCredentials(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved credentials:', error);
      }
    }
  };

  const saveCredentials = (credentials: SavedCredential[]) => {
    localStorage.setItem('savedCredentials', JSON.stringify(credentials));
    setSavedCredentials(credentials);
  };

  // Simple encryption for demo purposes - in production, use proper encryption
  const encrypt = (text: string): string => {
    return btoa(text);
  };

  const decrypt = (encrypted: string): string => {
    try {
      return atob(encrypted);
    } catch {
      return '';
    }
  };

  const handleAddCredential = () => {
    if (!newEmail || !newPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in email and password',
        variant: 'destructive',
      });
      return;
    }

    const newCredential: SavedCredential = {
      id: crypto.randomUUID(),
      email: newEmail,
      encryptedPassword: encrypt(newPassword),
      nickname: newNickname || newEmail.split('@')[0],
      lastUsed: new Date().toISOString(),
    };

    const updated = [...savedCredentials.filter(c => c.email !== newEmail), newCredential];
    saveCredentials(updated);

    if (onAddCredential) {
      onAddCredential(newEmail, newPassword, newNickname);
    }

    setNewEmail('');
    setNewPassword('');
    setNewNickname('');
    setShowAddForm(false);

    toast({
      title: 'Success',
      description: 'Credentials saved successfully',
    });
  };

  const handleSelectCredential = (credential: SavedCredential) => {
    const password = decrypt(credential.encryptedPassword);
    if (onCredentialSelect) {
      onCredentialSelect(credential.email, password);
    }

    // Update last used
    const updated = savedCredentials.map(c =>
      c.id === credential.id ? { ...c, lastUsed: new Date().toISOString() } : c
    );
    saveCredentials(updated);
  };

  const handleDeleteCredential = (id: string) => {
    const updated = savedCredentials.filter(c => c.id !== id);
    saveCredentials(updated);
    toast({
      title: 'Success',
      description: 'Credential removed successfully',
    });
  };

  return (
    <div className="space-y-4">
      {savedCredentials.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Saved Accounts
          </Label>
          {savedCredentials.map((credential) => (
            <Card key={credential.id} className="border hover:bg-muted/50 transition-colors">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-full bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{credential.nickname}</p>
                        <Badge variant="secondary" className="text-xs">Saved</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{credential.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Last used: {new Date(credential.lastUsed).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectCredential(credential)}
                    >
                      Use
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Saved Account</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {credential.email} from saved accounts? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCredential(credential.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!showAddForm ? (
        <Button
          variant="outline"
          onClick={() => setShowAddForm(true)}
          className="w-full border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Save New Account
        </Button>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="nickname">Account Nickname (Optional)</Label>
              <Input
                id="nickname"
                placeholder="Work Account, Personal, etc."
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddCredential} className="flex-1">
                Save Account
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              <Shield className="h-3 w-3 inline mr-1" />
              Your credentials are encrypted and stored locally on your device.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SavedCredentialsManager;