import React, { useRef } from 'react';
import { motion } from 'motion/react';

export default function BackgroundShapes({ shapes = [], settings = { size: 1, speed: 20, fillOpacity: 0.1 } }) {
    const containerRef = useRef(null);

    // Using a large generic size for the internal SVG
    const size = 600;

    const commonSvgProps = {
        width: size,
        height: size,
        viewBox: "0 0 100 100",
        style: {
            width: '80vmin',
            height: '80vmin',
            maxWidth: '600px',
            maxHeight: '600px',
            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))',
            pointerEvents: 'none'
        }
    };

    const strokeProps = (color) => {
        // Parse color to apply opacity for fill
        // Assuming simple rgba or valid CSS color. For simplicity, we just set fillOpacity separate.
        return {
            fill: color || 'white',
            fillOpacity: settings.fillOpacity,
            stroke: color || 'rgba(255, 255, 255, 0.8)',
            strokeWidth: "0.5",
            vectorEffect: "non-scaling-stroke"
        };
    };

    return (
        <div ref={containerRef} className="background-shapes-container" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 1 // Reverted to standard Z-Index, user can adjust if needed
        }}>
            {shapes.map(shape => (
                <motion.div
                    key={shape.id}
                    drag
                    dragConstraints={containerRef}
                    dragMomentum={false}
                    initial={{ x: shape.x || 0, y: shape.y || 0, scale: 0 }}
                    animate={{ scale: settings.size }}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: 'auto',
                        height: 'auto',
                        cursor: 'grab',
                        pointerEvents: 'auto',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    whileHover={{ scale: settings.size * 1.1, cursor: 'grab' }}
                    whileDrag={{ scale: settings.size * 1.1, cursor: 'grabbing' }}
                >
                    {/* Render the specific shape SVG */}
                    {shape.type === 'circle' && (
                        <motion.svg {...commonSvgProps} animate={{ rotate: 360 }} transition={{ duration: settings.speed, repeat: Infinity, ease: "linear" }}>
                            <circle cx="50" cy="50" r="45" {...strokeProps(shape.color)} />
                            <circle cx="50" cy="50" r="35" {...strokeProps(shape.color)} fillOpacity={settings.fillOpacity * 0.5} />
                            <circle cx="50" cy="50" r="25" {...strokeProps(shape.color)} fillOpacity={settings.fillOpacity * 0.3} />
                        </motion.svg>
                    )}

                    {shape.type === 'rectangle' && (
                        <motion.svg {...commonSvgProps} animate={{ rotate: -360 }} transition={{ duration: settings.speed * 1.2, repeat: Infinity, ease: "linear" }}>
                            <rect x="10" y="10" width="80" height="80" {...strokeProps(shape.color)} />
                            <rect x="20" y="20" width="60" height="60" {...strokeProps(shape.color)} fillOpacity={settings.fillOpacity * 0.5} />
                            <rect x="30" y="30" width="40" height="40" {...strokeProps(shape.color)} fillOpacity={settings.fillOpacity * 0.3} />
                        </motion.svg>
                    )}

                    {shape.type === 'triangle' && (
                        <motion.svg {...commonSvgProps} animate={{ rotate: 360 }} transition={{ duration: settings.speed * 1.5, repeat: Infinity, ease: "linear" }}>
                            <polygon points="50,5 95,90 5,90" {...strokeProps(shape.color)} />
                            <polygon points="50,25 80,80 20,80" {...strokeProps(shape.color)} fillOpacity={settings.fillOpacity * 0.5} />
                        </motion.svg>
                    )}

                    {shape.type === 'star' && (
                        <motion.svg {...commonSvgProps} animate={{ rotate: -360 }} transition={{ duration: settings.speed * 2, repeat: Infinity, ease: "linear" }}>
                            <polygon points="50,5 61,40 98,40 68,60 79,95 50,75 21,95 32,60 2,40 39,40" {...strokeProps(shape.color)} />
                            <polygon points="50,20 55,40 75,40 60,50 65,70 50,60 35,70 40,50 25,40 45,40" {...strokeProps(shape.color)} fillOpacity={settings.fillOpacity * 0.5} />
                        </motion.svg>
                    )}

                    {shape.type === 'spiral' && (
                        <motion.svg {...commonSvgProps} animate={{ rotate: 360 }} transition={{ duration: settings.speed * 0.8, repeat: Infinity, ease: "linear" }}>
                            <path d="M50,50 
                                      m 0,0 
                                      a 1,1 0 0,1 2,0 
                                      a 2,2 0 0,1 -4,0 
                                      a 3,3 0 0,1 6,0 
                                      a 4,4 0 0,1 -8,0 
                                      a 5,5 0 0,1 10,0
                                      a 6,6 0 0,1 -12,0
                                      a 7,7 0 0,1 14,0
                                      a 8,8 0 0,1 -16,0
                                      a 9,9 0 0,1 18,0
                                      a 10,10 0 0,1 -20,0
                                      a 20,20 0 0,1 40,0
                                      a 20,20 0 0,1 -40,0"
                                {...strokeProps(shape.color)} fill="none" transform="scale(1.5) translate(-16, -16)" />
                        </motion.svg>
                    )}
                </motion.div>
            ))}
        </div>
    );
}
