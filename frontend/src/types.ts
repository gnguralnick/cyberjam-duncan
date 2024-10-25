export interface ScannerProps {
    onCodeScanned: (fileId: string) => void;
}
  
export interface ARDisplayProps {
    qrCode: string;
    modelUrl: string;
    markerUrl: string;
}

// export interface ARSceneElements {
//     scene: HTMLElement;
//     marker: HTMLElement;
//     model: HTMLElement;
//     camera: HTMLElement;
// }