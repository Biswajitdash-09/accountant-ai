import { Button } from "@/components/ui/button";
import { Mail, Youtube, Instagram, Twitter } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const SocialMediaLinks = () => {
  const socialLinks = [
    {
      icon: Mail,
      label: "Email",
      href: "mailto:hello.arnold.ai@outlook.com",
      tooltip: "hello.arnold.ai@outlook.com",
      ariaLabel: "Email us at hello.arnold.ai@outlook.com",
    },
    {
      icon: Youtube,
      label: "YouTube",
      href: "http://www.youtube.com/@hello.arnold",
      tooltip: "@hello.arnold",
      ariaLabel: "Follow us on YouTube",
    },
    {
      icon: Instagram,
      label: "Instagram",
      href: "https://www.instagram.com/hello.arnold.ai/",
      tooltip: "@hello.arnold.ai",
      ariaLabel: "Follow us on Instagram",
    },
    {
      icon: Twitter,
      label: "X (Twitter)",
      href: "https://x.com/MynameisArnold_",
      tooltip: "@MynameisArnold_",
      ariaLabel: "Follow us on X (Twitter)",
    },
  ];

  return (
    <div className="flex flex-col items-center gap-4 my-6">
      <p className="text-sm text-muted-foreground">Connect with us</p>
      <TooltipProvider>
        <div className="flex gap-3">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <Tooltip key={social.label}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 rounded-full hover:scale-110 transition-transform hover:bg-primary hover:text-primary-foreground"
                    asChild
                  >
                    <a
                      href={social.href}
                      target={social.href.startsWith("mailto") ? undefined : "_blank"}
                      rel={social.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                      aria-label={social.ariaLabel}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{social.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
};
