import React, { useEffect, useState } from 'react';
import { ARDisplayProps, ARSceneElements } from '../types';
import { BASE_URL } from '../api';

export const ARDisplay: React.FC<ARDisplayProps> = ({ qrCode, modelUrl }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const createARElements = (): ARSceneElements => {
    const scene = document.createElement('a-scene');
    scene.setAttribute('embedded', '');
    scene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;');

    const marker = document.createElement('a-marker');
    marker.setAttribute('type', 'pattern');
    marker.setAttribute('url', `${BASE_URL}/marker/${qrCode}`);
    marker.setAttribute('emitevents', 'true');

    const model = document.createElement('a-entity');
    model.setAttribute('gltf-model', modelUrl);
    model.setAttribute('scale', '0.5 0.5 0.5');
    model.setAttribute('position', '0 0 0');
    model.setAttribute('rotation', '-90 0 0');

    const camera = document.createElement('a-entity');
    camera.setAttribute('camera', '');

    return { scene, marker, model, camera };
  };

  useEffect(() => {
    // Create and setup AR scene
    const { scene, marker, model, camera } = createARElements();

    const handleMarkerFound = (): void => {
        console.log('Marker detected');
    };
    
    const handleMarkerLost = (): void => {
        console.log('Marker lost');
    };

    const setupAR = async (): Promise<void> => {
      try {
        setIsLoading(true);
        
        // Fetch the marker pattern file
        const markerResponse = await fetch(`${BASE_URL}/marker/${qrCode}`);
        if (!markerResponse.ok) throw new Error('Failed to load AR marker pattern');
        
        
        
        // Add event listeners
        marker.addEventListener('markerFound', handleMarkerFound);
        marker.addEventListener('markerLost', handleMarkerLost);
        
        // Assemble scene
        marker.appendChild(model);
        scene.appendChild(marker);
        scene.appendChild(camera);
        document.body.appendChild(scene);
        
        setIsLoading(false);
        
      } catch (error) {
        console.error('AR setup error:', error instanceof Error ? error.message : 'Unknown error');
        setError(error instanceof Error ? error.message : 'Unknown error setting up AR');
        setIsLoading(false);
      }
    };

    setupAR();

    return () => {
        marker.removeEventListener('markerFound', handleMarkerFound);
        marker.removeEventListener('markerLost', handleMarkerLost);
        scene.remove();
      };
  }, [qrCode, modelUrl]);

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white">
        <div className="text-center">
          <p className="text-xl mb-4">Error setting up AR view</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white">
        <div className="text-center">
          <p className="text-xl mb-4">Setting up AR view...</p>
          <p>Please allow camera access when prompted</p>
        </div>
      </div>
    );
  }

  return null;
};