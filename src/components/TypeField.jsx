import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * TypeField — Click anywhere on the canvas to place a free-floating, draggable text box.
 * Each box has its own per-box styles (font, size, color, bold, italic, alignment).
 * 
 * The selected box's settings and a setter are exposed on window.typeFieldBridge
 * so Controls.jsx can read and update them in real time.
 */

let nextId = 1;

function makeBox(x, y, defaults = {}) {
    return {
        id: nextId++,
        x,
        y,
        text: '',
        fontFamily: defaults.fontFamily || 'Bebas Neue',
        fontSize: defaults.fontSize || 48,
        color: defaults.color || '#ffffff',
        bold: defaults.bold || false,
        italic: defaults.italic || false,
        align: defaults.align || 'left',
    };
}

export default function TypeField({ defaultSettings = {} }) {
    const [boxes, setBoxes] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const containerRef = useRef(null);

    // Drag state (refs, not state, to avoid re-renders during drag)
    const dragging = useRef(null); // { id, startX, startY, origX, origY }

    // ── Bridge: expose selected box state to Controls ──────────────────────────
    useEffect(() => {
        const selectedBox = boxes.find(b => b.id === selectedId) || null;

        window.typeFieldBridge = {
            selectedBox,
            updateSelected: (patch) => {
                if (!selectedId) return;
                setBoxes(prev => prev.map(b =>
                    b.id === selectedId ? { ...b, ...patch } : b
                ));
            },
            clearAll: () => {
                setBoxes([]);
                setSelectedId(null);
            },
            getAll: () => boxes,
        };
    }, [boxes, selectedId]);

    // ── Click on canvas: spawn a new box ───────────────────────────────────────
    const handleCanvasClick = useCallback((e) => {
        // Ignore if clicking on an existing box
        if (e.target !== containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newBox = makeBox(x, y, defaultSettings);
        setBoxes(prev => [...prev, newBox]);
        setSelectedId(newBox.id);
    }, [defaultSettings]);

    // ── Drag: mousedown on the drag handle ────────────────────────────────────
    const handleDragStart = useCallback((e, box) => {
        e.preventDefault();
        e.stopPropagation();
        dragging.current = {
            id: box.id,
            startX: e.clientX,
            startY: e.clientY,
            origX: box.x,
            origY: box.y,
        };
        setSelectedId(box.id);
    }, []);

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!dragging.current) return;
            const dx = e.clientX - dragging.current.startX;
            const dy = e.clientY - dragging.current.startY;
            const { id, origX, origY } = dragging.current;
            setBoxes(prev => prev.map(b =>
                b.id === id ? { ...b, x: origX + dx, y: origY + dy } : b
            ));
        };
        const onMouseUp = () => { dragging.current = null; };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    // ── Delete a box ──────────────────────────────────────────────────────────
    const deleteBox = useCallback((id, e) => {
        e.stopPropagation();
        setBoxes(prev => prev.filter(b => b.id !== id));
        setSelectedId(prev => prev === id ? null : prev);
    }, []);

    // ── Text change ───────────────────────────────────────────────────────────
    const handleTextChange = useCallback((id, value) => {
        setBoxes(prev => prev.map(b =>
            b.id === id ? { ...b, text: value } : b
        ));
    }, []);

    return (
        <div
            ref={containerRef}
            onClick={handleCanvasClick}
            style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%', height: '100%',
                zIndex: 20,
                cursor: 'crosshair',
                // Only block pointer events on the canvas bg itself, not child boxes
                pointerEvents: 'all',
            }}
        >
            {boxes.map(box => (
                <TypeBox
                    key={box.id}
                    box={box}
                    isSelected={box.id === selectedId}
                    onSelect={() => setSelectedId(box.id)}
                    onDragStart={(e) => handleDragStart(e, box)}
                    onDelete={(e) => deleteBox(box.id, e)}
                    onTextChange={(val) => handleTextChange(box.id, val)}
                />
            ))}

            {boxes.length === 0 && (
                <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'rgba(255,255,255,0.2)',
                    fontSize: '1rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    fontFamily: 'monospace',
                }}>
                    Click anywhere to place text
                </div>
            )}
        </div>
    );
}

// ── Individual draggable text box ─────────────────────────────────────────────
function TypeBox({ box, isSelected, onSelect, onDragStart, onDelete, onTextChange }) {
    const textareaRef = useRef(null);

    // Auto-focus when first created (box has no text yet)
    useEffect(() => {
        if (isSelected && textareaRef.current && box.text === '') {
            textareaRef.current.focus();
        }
    }, [isSelected]);

    const fontWeight = box.bold ? 'bold' : 'normal';
    const fontStyle = box.italic ? 'italic' : 'normal';

    return (
        <div
            onMouseDown={(e) => { e.stopPropagation(); onSelect(); }}
            style={{
                position: 'absolute',
                left: box.x,
                top: box.y,
                transform: 'translate(-4px, -4px)',
                outline: isSelected
                    ? '1.5px solid rgba(229,176,32,0.7)'
                    : '1px dashed rgba(255,255,255,0.0)',
                borderRadius: '3px',
                padding: '4px',
                cursor: 'default',
                transition: 'outline 0.15s ease',
                minWidth: '60px',
                zIndex: isSelected ? 21 : 20,
            }}
        >
            {/* Drag handle bar */}
            <div
                onMouseDown={onDragStart}
                style={{
                    height: '10px',
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '2px',
                    opacity: isSelected ? 1 : 0,
                    transition: 'opacity 0.15s ease',
                }}
            >
                <span style={{
                    fontSize: '9px',
                    color: 'rgba(229,176,32,0.8)',
                    letterSpacing: '0.05em',
                    userSelect: 'none',
                    fontFamily: 'monospace',
                }}>
                    ⠿ drag
                </span>
                <button
                    onMouseDown={onDelete}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255,100,100,0.7)',
                        cursor: 'pointer',
                        fontSize: '11px',
                        padding: '0 2px',
                        lineHeight: 1,
                    }}
                    title="Delete"
                >
                    ✕
                </button>
            </div>

            {/* The actual textarea */}
            <textarea
                ref={textareaRef}
                value={box.text}
                onChange={(e) => onTextChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder="Type here…"
                rows={1}
                style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    overflow: 'hidden',
                    fontFamily: box.fontFamily,
                    fontSize: `${box.fontSize}px`,
                    color: box.color,
                    fontWeight,
                    fontStyle,
                    textAlign: box.align,
                    caretColor: box.color,
                    minWidth: '60px',
                    width: 'auto',
                    whiteSpace: 'pre',
                    cursor: 'text',
                    // Placeholder colour
                    lineHeight: 1.1,
                }}
                onInput={(e) => {
                    // Auto-resize width & height to content
                    const el = e.target;
                    el.style.width = 'auto';
                    el.style.height = 'auto';
                    el.style.width = el.scrollWidth + 'px';
                    el.style.height = el.scrollHeight + 'px';
                }}
            />
        </div>
    );
}
