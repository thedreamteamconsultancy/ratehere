import { Facebook, Instagram, Linkedin, Twitter, Youtube, Globe, MessageCircle, Send, Camera, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { incrementLinkClick } from '@/lib/analytics';

interface SocialLink {
  platform: string;
  url: string;
}

interface SocialLinksProps {
  links: SocialLink[];
  caption?: string;
  profileId?: string;
}

const getPlatformIcon = (platform: string) => {
  const icons: Record<string, any> = {
    facebook: Facebook,
    instagram: Instagram,
    linkedin: Linkedin,
    twitter: Twitter,
    x: Twitter,
    youtube: Youtube,
    whatsapp: MessageCircle,
    telegram: Send,
    snapchat: Camera,
    playstore: ShoppingBag,
    website: Globe,
  };
  return icons[platform.toLowerCase()] || Globe;
};

export default function SocialLinks({ links, caption, profileId }: SocialLinksProps) {
  if (links.length === 0) return null;

  const handleLinkClick = async (link: SocialLink) => {
    // Track click analytics if profileId is provided
    if (profileId) {
      await incrementLinkClick(profileId, link.platform);
    }
    
    // Open link in new tab
    window.open(link.url, '_blank');
  };

  return (
    <div className="space-y-4">
      {caption && (
        <p className="text-sm text-muted-foreground text-center">{caption}</p>
      )}
      <div className="flex flex-wrap gap-3 justify-center">
        {links.map((link, index) => {
          const Icon = getPlatformIcon(link.platform);
          return (
            <Button
              key={index}
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-smooth"
              onClick={() => handleLinkClick(link)}
            >
              <Icon className="w-5 h-5" />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
