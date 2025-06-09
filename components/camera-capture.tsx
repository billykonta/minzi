import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Image, RotateCw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  onImageCaptured: (file: File) => void;
  onClose: () => void;
}

export function CameraCapture({ onImageCaptured, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);

  // Initialize camera
  useEffect(() => {
    startCamera();
    return () => {
      // Clean up on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
      
      setError(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions and try again.');
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to image data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageDataUrl);
    
    // Stop the camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const saveImage = () => {
    if (!capturedImage) return;
    
    // Convert data URL to File object
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onImageCaptured(file);
        onClose();
      })
      .catch(err => {
        console.error('Error saving image:', err);
        setError('Failed to save image. Please try again.');
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg border bg-card p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Take a Photo</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-4">
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          
          <div className="relative overflow-hidden rounded-md bg-muted">
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className={cn(
                    "h-[300px] w-full object-cover",
                    !isCameraReady && "opacity-0"
                  )}
                />
                {!isCameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
              </>
            ) : (
              <img
                src={capturedImage}
                alt="Captured"
                className="h-[300px] w-full object-cover"
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          <div className="mt-4 flex justify-center gap-4">
            {!capturedImage ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={switchCamera}
                  disabled={!isCameraReady}
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  Switch Camera
                </Button>
                <Button
                  type="button"
                  onClick={captureImage}
                  disabled={!isCameraReady}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Capture
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={retakePhoto}>
                  <RotateCw className="mr-2 h-4 w-4" />
                  Retake
                </Button>
                <Button type="button" onClick={saveImage}>
                  <Check className="mr-2 h-4 w-4" />
                  Use Photo
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
