export interface ScannerProps {
    onCodeScanned: (fileId: string) => void;
}
  
export interface ARDisplayProps {
    qrCode: string;
    modelUrl: string;
}

export interface ARSceneElements {
    scene: HTMLElement;
    marker: HTMLElement;
    model: HTMLElement;
    camera: HTMLElement;
}