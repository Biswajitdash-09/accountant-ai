import { useState, useRef } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

interface CameraReceiptScannerProps {
  onImageCapture: (imageData: string) => void;
}

export const CameraReceiptScanner = ({ onImageCapture }: CameraReceiptScannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { trigger } = useHapticFeedback();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to scan receipts",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(imageData);
        trigger("success");
        stopCamera();
      }
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onImageCapture(capturedImage);
      handleClose();
      toast({
        title: "Receipt Captured",
        description: "Processing your receipt...",
      });
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
    startCamera();
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleOpen}
        className="min-h-[44px] min-w-[44px]"
        aria-label="Scan receipt with camera"
      >
        <Camera className="h-5 w-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Receipt</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!capturedImage ? (
              <>
                <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Capture guide overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-4 border-2 border-primary/50 rounded-lg" />
                    <div className="absolute bottom-8 left-0 right-0 text-center">
                      <p className="text-sm text-white bg-black/50 px-4 py-2 rounded-full inline-block">
                        Align receipt within frame
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={capturePhoto}
                  className="w-full h-12"
                  disabled={!stream}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Capture Receipt
                </Button>
              </>
            ) : (
              <>
                <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                  <img
                    src={capturedImage}
                    alt="Captured receipt"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleRetake}
                    variant="outline"
                    className="flex-1 h-12"
                  >
                    <X className="mr-2 h-5 w-5" />
                    Retake
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    className="flex-1 h-12"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Use Photo
                  </Button>
                </div>
              </>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>
    </>
  );
};
