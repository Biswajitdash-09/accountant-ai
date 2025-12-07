import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Settings, RotateCcw } from 'lucide-react';
import { useVoicePreferences } from '@/hooks/useVoicePreferences';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface VoiceSettingsProps {
  trigger?: React.ReactNode;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({ trigger }) => {
  const { preferences, savePreferences, resetPreferences, AVAILABLE_VOICES } = useVoicePreferences();

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Voice Settings</SheetTitle>
          <SheetDescription>
            Customize Arnold's voice and behavior
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Voice Selection */}
          <div className="space-y-2">
            <Label>Voice</Label>
            <Select
              value={preferences.voice}
              onValueChange={(value) => savePreferences({ voice: value })}
            >
              <SelectTrigger className="min-h-[44px]">
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                {AVAILABLE_VOICES.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id} className="min-h-[44px]">
                    <div className="flex flex-col">
                      <span className="font-medium">{voice.name}</span>
                      <span className="text-xs text-muted-foreground">{voice.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Input Mode */}
          <div className="space-y-2">
            <Label>Input Mode</Label>
            <Select
              value={preferences.inputMode}
              onValueChange={(value: 'push-to-talk' | 'continuous') => 
                savePreferences({ inputMode: value })
              }
            >
              <SelectTrigger className="min-h-[44px]">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem value="continuous" className="min-h-[44px]">
                  <div className="flex flex-col">
                    <span className="font-medium">Continuous Listening</span>
                    <span className="text-xs text-muted-foreground">Arnold listens continuously when active</span>
                  </div>
                </SelectItem>
                <SelectItem value="push-to-talk" className="min-h-[44px]">
                  <div className="flex flex-col">
                    <span className="font-medium">Push to Talk</span>
                    <span className="text-xs text-muted-foreground">Hold button to speak</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Speech Rate */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Speech Rate</Label>
              <span className="text-sm text-muted-foreground">
                {preferences.speechRate.toFixed(1)}x
              </span>
            </div>
            <Slider
              value={[preferences.speechRate]}
              onValueChange={([value]) => savePreferences({ speechRate: value })}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Transcript</Label>
                <p className="text-xs text-muted-foreground">
                  Display text transcription
                </p>
              </div>
              <Switch
                checked={preferences.showTranscript}
                onCheckedChange={(checked) => savePreferences({ showTranscript: checked })}
                className="scale-110"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-connect</Label>
                <p className="text-xs text-muted-foreground">
                  Connect when opening voice agent
                </p>
              </div>
              <Switch
                checked={preferences.autoConnect}
                onCheckedChange={(checked) => savePreferences({ autoConnect: checked })}
                className="scale-110"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Sound alerts for responses
                </p>
              </div>
              <Switch
                checked={preferences.enableNotifications}
                onCheckedChange={(checked) => savePreferences({ enableNotifications: checked })}
                className="scale-110"
              />
            </div>
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            className="w-full min-h-[44px]"
            onClick={resetPreferences}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
