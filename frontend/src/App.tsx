import React, { useEffect, useState } from 'react';
import { QRCodeScanner } from './components/QRCodeScanner.tsx';
import { ARDisplay } from './components/ARDisplay.tsx';
import { api } from './api.ts';

const App: React.FC = () => {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  const handleQRCodeScanned = async (fileId: string): Promise<void> => {
    setScannedCode(fileId);
    try {
      const modelBlob = await api.get<Blob>(`/model/${fileId}`, {responseType: 'blob'});
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