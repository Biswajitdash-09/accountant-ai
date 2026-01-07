import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  Gift, 
  Users, 
  Copy, 
  Share2, 
  Check, 
  Mail, 
  Trophy,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ReferralStats {
  totalReferred: number;
  successfulReferrals: number;
  creditsEarned: number;
  pendingReferrals: number;
}

export const ReferralDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Generate referral code from user ID
  const referralCode = user?.id?.slice(0, 8).toUpperCase() || 'GUEST';
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;

  // Mock stats - replace with real data from your database
  const stats: ReferralStats = {
    totalReferred: 3,
    successfulReferrals: 2,
    creditsEarned: 100,
    pendingReferrals: 1,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: 'Link Copied!',
        description: 'Your referral link has been copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Copy Failed',
        description: 'Please manually copy the link.',
        variant: 'destructive',
      });
    }
  };

  const shareViaEmail = async () => {
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter an email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      // TODO: Call edge function to send referral email
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast({
        title: 'Invitation Sent!',
        description: `Referral invitation sent to ${email}`,
      });
      setEmail('');
    } catch (error) {
      toast({
        title: 'Send Failed',
        description: 'Could not send invitation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Accountant AI',
          text: 'Try the AI-powered accounting app that makes finance easy!',
          url: referralLink,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Invite Friends, Earn Credits</CardTitle>
              <CardDescription className="text-base">
                Get 50 AI credits for each friend who signs up!
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center p-4 rounded-lg bg-background/50 backdrop-blur"
            >
              <Users className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{stats.totalReferred}</p>
              <p className="text-xs text-muted-foreground">Total Invited</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-4 rounded-lg bg-background/50 backdrop-blur"
            >
              <Check className="h-6 w-6 mx-auto text-success mb-2" />
              <p className="text-2xl font-bold">{stats.successfulReferrals}</p>
              <p className="text-xs text-muted-foreground">Signed Up</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center p-4 rounded-lg bg-background/50 backdrop-blur"
            >
              <Sparkles className="h-6 w-6 mx-auto text-warning mb-2" />
              <p className="text-2xl font-bold">{stats.creditsEarned}</p>
              <p className="text-xs text-muted-foreground">Credits Earned</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center p-4 rounded-lg bg-background/50 backdrop-blur"
            >
              <Trophy className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">#{stats.totalReferred > 0 ? Math.max(1, 100 - stats.totalReferred * 10) : 100}</p>
              <p className="text-xs text-muted-foreground">Your Rank</p>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Share Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Referral Link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Your Referral Link
            </CardTitle>
            <CardDescription>
              Share this link with friends to earn credits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                value={referralLink} 
                readOnly 
                className="font-mono text-sm"
              />
              <Button 
                onClick={copyToClipboard}
                variant="outline"
                className="shrink-0 min-w-[80px]"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                Your Code: {referralCode}
              </Badge>
            </div>

            <Button 
              onClick={shareNative}
              className="w-full gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share with Friends
            </Button>
          </CardContent>
        </Card>

        {/* Email Invite */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Invite via Email
            </CardTitle>
            <CardDescription>
              Send a personal invitation to a friend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button 
                onClick={shareViaEmail}
                disabled={isSending || !email}
                className="shrink-0"
              >
                {isSending ? 'Sending...' : 'Send'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              We'll send them a personalized invitation with your referral code.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">1</span>
              </div>
              <h4 className="font-medium">Share Your Link</h4>
              <p className="text-sm text-muted-foreground">
                Send your unique referral link to friends and colleagues
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">2</span>
              </div>
              <h4 className="font-medium">They Sign Up</h4>
              <p className="text-sm text-muted-foreground">
                Your friend creates an account using your link
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">3</span>
              </div>
              <h4 className="font-medium">You Both Earn</h4>
              <p className="text-sm text-muted-foreground">
                Get 50 credits each! No limits on referrals
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
