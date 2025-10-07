import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Share2, QrCode, Copy, MessageCircle, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonsProps {
  profileUrl: string;
  profileName: string;
  profileDescription?: string;
}

export default function ShareButtons({ 
  profileUrl, 
  profileName, 
  profileDescription 
}: ShareButtonsProps) {
  const [qrOpen, setQrOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const shareText = `Check out ${profileName} on RateHere!${profileDescription ? ' ' + profileDescription : ''}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `${profileName}-QRCode.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      toast.success('QR Code downloaded!');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: profileName,
          text: shareText,
          url: profileUrl,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      setShareOpen(true);
    }
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + profileUrl)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out ${profileName} on RateHere`);
    const body = encodeURIComponent(`${shareText}\n\n${profileUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {/* Native Share Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleNativeShare}
        className="gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share
      </Button>

      {/* QR Code Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <QrCode className="w-4 h-4" />
            QR Code
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to view the profile
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <QRCodeSVG
                id="qr-code-svg"
                value={profileUrl}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCopyLink}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={handleDownloadQR}
              >
                <QrCode className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Options Popover */}
      <Popover open={shareOpen} onOpenChange={setShareOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            More
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Share via</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={shareToWhatsApp}
                >
                  <MessageCircle className="w-4 h-4 text-green-500" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={shareToFacebook}
                >
                  <Facebook className="w-4 h-4 text-blue-600" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={shareToTwitter}
                >
                  <Twitter className="w-4 h-4 text-sky-500" />
                  X (Twitter)
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={shareToLinkedIn}
                >
                  <Linkedin className="w-4 h-4 text-blue-700" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 col-span-2"
                  onClick={shareViaEmail}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Profile Link</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={profileUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
                />
                <Button size="sm" onClick={handleCopyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
