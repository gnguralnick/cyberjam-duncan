import { useState } from 'react';
import { QRCodeScanner } from './components/QRCodeScanner.tsx';
import { ARDisplay } from './components/ARDisplay.tsx';
import { api, BASE_URL } from './api.ts';

const App: React.FC = () => {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [markerUrl, setMarkerUrl] = useState<string | null>(null);

  const handleQRCodeScanned = async (fileId: string): Promise<void> => {
    setScannedCode(fileId);
    try {

      const fileInfo = await api.get<{ model_path: string, marker_path: string}>(`/files/${fileId}`);
      setModelUrl(BASE_URL + fileInfo.model_path);
      setMarkerUrl(BASE_URL + fileInfo.marker_path);
    } catch (error) {
      console.error('Error fetching model:', error instanceof Error ? error.message : 'Unknown error');
      alert('Failed to load 3D model');
    }
  };

  return (
    <div className="h-screen w-screen">
      {!(modelUrl && markerUrl) ? (
        <QRCodeScanner onCodeScanned={handleQRCodeScanned} />
      ) : (
        scannedCode && <ARDisplay qrCode={scannedCode} modelUrl={modelUrl} markerUrl={markerUrl} />
      )}
    </div>
  );
};

export default App;