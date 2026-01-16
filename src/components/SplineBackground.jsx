import Spline from '@splinetool/react-spline';

export default function SplineBackground({ sceneUrl }) {
    // Default to a cool abstract scene if none provided, or the Mini Room
    const url = sceneUrl || "https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode";

    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
            {/* 
         Spline component canvas. 
         We wrap it to ensure it takes full size.
      */}
            <Spline scene={url} />
        </div>
    );
}
