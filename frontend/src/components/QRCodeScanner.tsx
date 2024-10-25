import { useEffect, useRef } from 'react';
import jsQR, { QRCode } from 'jsqr';
import { ScannerProps } from '../types';

export const QRCodeScanner: React.FC<ScannerProps> = ({ onCodeScanned }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const startCamera = async (): Promise<void> => {
      try {
        if (!videoRef.current) return;
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        videoRef.current.srcObject = stream;
      } catch (error) {
        console.error('Error accessing camera:', error instanceof Error ? error.message : 'Unknown error');
      }
    };
    startCamera();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    let animationFrame: number;

    const scanQRCode = (): void => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code: QRCode | null = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
            console.log(code.data);
          onCodeScanned(code.data);
          return;
        }
      }
      animationFrame = requestAnimationFrame(scanQRCode);
    };

    scanQRCode();
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [onCodeScanned]);

  return (
    <div className="relative h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full object-cover"
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 hidden"
      />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-64 h-64 border-2 border-white"></div>
      </div>
    </div>
  );
};