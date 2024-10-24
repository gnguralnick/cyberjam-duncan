import React, { useEffect, useState } from 'react';
import { QRCodeScanner } from './components/QRCodeScanner.tsx';
import { ARDisplay } from './components/ARDisplay.tsx';

const App: React.FC = () => {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  //const backendUrl = 'http://' + window.location.origin.slice(0, window.location.origin.lastIndexOf(':')).split('://')[1] + ':8000';
  const backendUrl = 'http://localhost:8000';

  const handleQRCodeScanned = async (fileId: string): Promise<void> => {
    setScannedCode(fileId);
    try {
      console.log('fetching', `${backendUrl}/model/${fileId}`);
      const response = await fetch(`${backendUrl}/model/${fileId}`);
      if (!response.ok) throw new Error('Model not found');
      
      const modelBlob = await response.blob();
      const modelUrl = URL.createObjectURL(modelBlob);
      setModelUrl(modelUrl);
    } catch (error) {
      console.error('Error fetching model:', error instanceof Error ? error.message : 'Unknown error');
      alert('Failed to load 3D model');
    }
  };

  useEffect(() => {
    return () => {
      if (modelUrl) {
        URL.revokeObjectURL(modelUrl);
      }
    };
  }, [modelUrl]);

  return (
    <div className="h-screen w-screen">
      {!modelUrl ? (
        <QRCodeScanner onCodeScanned={handleQRCodeScanned} />
      ) : (
        scannedCode && <ARDisplay qrCode={scannedCode} modelUrl={modelUrl} />
      )}
    </div>
  );
};

export default App;