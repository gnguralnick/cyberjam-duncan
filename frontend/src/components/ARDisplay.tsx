import { ARDisplayProps } from '../types';
//import { ARCanvas, ARMarker } from '@artcom/react-three-arjs'; // ts-ignore
// import { useGLTF } from '@react-three/drei';

// const Model = ({url}: {url: string}) => {
//     const { scene } = useGLTF(url);

//     return <primitive object={scene} />;
// }

export const ARDisplay: React.FC<ARDisplayProps> = ({ qrCode, modelUrl, markerUrl }) => {

    console.log(qrCode, markerUrl, modelUrl);

    // return <ARCanvas sourceType="webcam" debugUIEnabled={false} detectionMode="mono_and_matrix" matrixCodeType="3x3">
    //     <ARMarker type="pattern" patternUrl={markerUrl} debug={true} onMarkerFound={() => console.log('Marker found')} onMarkerLost={() => console.log('Marker lost')}>
    //         <Model url={modelUrl} />
    //     </ARMarker>
    // </ARCanvas>
    return null;
};