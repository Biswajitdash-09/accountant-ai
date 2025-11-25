import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Share2, Twitter, Linkedin, Facebook, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface WaitlistSuccessProps {
  position: number;
  totalCount: number;
  email: string;
  onClose: () => void;
}

export const WaitlistSuccess = ({ position, totalCount, email, onClose }: WaitlistSuccessProps) => {
  const { toast } = useToast();

  const shareText = `I just joined the waitlist for Accountant AI! 🚀 I'm #${position} in line. Join me: ${window.location.origin}`;

  const handleShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const url = encodeURIComponent(window.location.origin);

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodedText}`,
    };

    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    toast({
      title: "Link copied!",
      description: "Share with friends to help them join too",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="glass rounded-2xl p-8 space-y-6 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center mb-6"
          >
            <Check className="h-10 w-10 text-white" />
          </motion.div>

          <h3 className="text-3xl font-bold mb-2">You're on the list!</h3>
          <p className="text-muted-foreground mb-6">
            Confirmation email sent to <strong>{email}</strong>
          </p>

          {/* Position badge */}
          <div className="inline-block bg-gradient-to-r from-primary to-purple-500 text-white px-8 py-4 rounded-xl mb-6">
            <div className="text-5xl font-bold">#{position}</div>
            <div className="text-sm opacity-90">Your position in line</div>
          </div>

          <p className="text-lg text-muted-foreground mb-8">
            Out of <strong>{totalCount}</strong> total signups
          </p>

          {/* Benefits */}
          <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left space-y-3">
            <h4 className="font-semibold text-center mb-4">Your Early Access Benefits:</h4>
            {[
              "30% off your first 3 months",
              "100 bonus AI credits (worth $50)",
              "Priority support for 90 days",
              "Free personal onboarding call"
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2"
              >
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>{benefit}</span>
              </motion.div>
            ))}
          </div>

          {/* Share buttons */}
          <div className="space-y-4">
            <p className="font-medium flex items-center justify-center gap-2">
              <Share2 className="h-5 w-5" />
              Share with friends and move up in line!
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('twitter')}
                className="gap-2"
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('linkedin')}
                className="gap-2"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('facebook')}
                className="gap-2"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copyLink}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={onClose}
            className="mt-6"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </div>
    </motion.div>
  );
};