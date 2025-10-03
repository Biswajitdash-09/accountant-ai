import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Play, Video, BookOpen } from 'lucide-react';

interface VideoTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onShowStepByStep?: () => void;
}

const VideoTutorial: React.FC<VideoTutorialProps> = ({ isOpen, onClose, onShowStepByStep }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const videos = [
    {
      id: 'overview',
      title: 'Getting Started',
      description: 'Quick overview of Accountant AI',
      // Replace with your actual video URL
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '3:45',
    },
    {
      id: 'upload',
      title: 'Document Upload',
      description: 'Learn how to upload and manage documents',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '5:20',
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      description: 'Generate insights and reports',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '4:15',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            Video Tutorials
          </DialogTitle>
          <DialogDescription>
            Watch step-by-step video guides to master Accountant AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              {videos.map((video) => (
                <TabsTrigger key={video.id} value={video.id} className="text-xs sm:text-sm">
                  {video.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {videos.map((video) => (
              <TabsContent key={video.id} value={video.id} className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{video.title}</h3>
                  <p className="text-sm text-muted-foreground">{video.description}</p>
                  <span className="text-xs text-muted-foreground">Duration: {video.duration}</span>
                </div>

                <AspectRatio ratio={16 / 9}>
                  <iframe
                    src={video.embedUrl}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-lg border"
                  />
                </AspectRatio>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-sm">What you'll learn:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {video.id === 'overview' && (
                      <>
                        <li>Navigate the dashboard and main features</li>
                        <li>Set up your account preferences</li>
                        <li>Understand the AI-powered workflow</li>
                      </>
                    )}
                    {video.id === 'upload' && (
                      <>
                        <li>Upload receipts and invoices</li>
                        <li>Use the AI document scanner</li>
                        <li>Organize and categorize documents</li>
                      </>
                    )}
                    {video.id === 'reports' && (
                      <>
                        <li>Generate financial reports</li>
                        <li>Analyze spending patterns</li>
                        <li>Export data for tax filing</li>
                      </>
                    )}
                  </ul>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Alternative Learning Options */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Prefer another learning style?</h4>
            <div className="flex gap-3">
              {onShowStepByStep && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onShowStepByStep();
                  }}
                  className="flex-1"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Step-by-Step Guide
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="flex-1"
              >
                Skip & Explore
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoTutorial;
