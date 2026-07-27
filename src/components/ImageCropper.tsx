import React, { useState, useRef, useCallback, useEffect } from "react";
import { X, ZoomIn, ZoomOut, Check, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../lib/LanguageContext";

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  onCrop: (blob: Blob) => void;
  imageSrc: string;
}

const CROP_SIZE = 400;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

export const ImageCropper: React.FC<ImageCropperProps> = ({
  isOpen,
  onClose,
  onCrop,
  imageSrc,
}) => {
  const { isAr } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  const t = {
    title: isAr ? "قص الصورة" : "CROP IMAGE",
    subtitle: isAr ? "اسحب الصورة لاختيار الجزء المطلوب" : "Drag to choose the part you want",
    zoom: isAr ? "التكبير" : "ZOOM",
    confirm: isAr ? "تأكيد" : "CONFIRM",
    cancel: isAr ? "إلغاء" : "CANCEL",
    reset: isAr ? "إعادة ضبط" : "RESET",
  };

  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [isOpen, imageSrc]);

  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setContainerSize({ w: rect.width, h: rect.height });
  }, [isOpen]);

  const getScaledDimensions = useCallback(() => {
    if (!imgNatural.w || !imgNatural.h) return { w: 0, h: 0 };
    const baseScale = Math.min(CROP_SIZE / imgNatural.w, CROP_SIZE / imgNatural.h);
    return {
      w: imgNatural.w * baseScale * zoom,
      h: imgNatural.h * baseScale * zoom,
    };
  }, [imgNatural, zoom]);

  const clampOffset = useCallback(
    (dx: number, dy: number) => {
      const dim = getScaledDimensions();
      const minX = Math.max(0, (dim.w - CROP_SIZE) / 2);
      const minY = Math.max(0, (dim.h - CROP_SIZE) / 2);
      return {
        x: Math.max(-minX, Math.min(minX, dx)),
        y: Math.max(-minY, Math.min(minY, dy)),
      };
    },
    [getScaledDimensions],
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset((prev) => clampOffset(prev.x + dx, prev.y + dy));
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handleZoomSlider = (val: number) => {
    setZoom(val);
    setOffset((prev) => clampOffset(prev.x, prev.y));
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    canvas.width = CROP_SIZE * 2;
    canvas.height = CROP_SIZE * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const dim = getScaledDimensions();
    const sx = (img.naturalWidth / dim.w) * (dim.w / 2 - CROP_SIZE + offset.x);
    const sy = (img.naturalHeight / dim.h) * (dim.h / 2 - CROP_SIZE + offset.y);
    const sw = (img.naturalWidth / dim.w) * CROP_SIZE;
    const sh = (img.naturalHeight / dim.h) * CROP_SIZE;

    ctx.beginPath();
    ctx.arc(CROP_SIZE, CROP_SIZE, CROP_SIZE, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, CROP_SIZE * 2, CROP_SIZE * 2);

    canvas.toBlob(
      (blob) => {
        if (blob) onCrop(blob);
      },
      "image/jpeg",
      0.92,
    );
  };

  const dim = getScaledDimensions();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-background/90 backdrop-blur-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md"
          >
            <div className="bg-card border border-border rounded-3xl p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-black uppercase tracking-widest text-sm">{t.title}</h2>
                  <p className="text-muted-foreground text-[10px] mt-0.5">{t.subtitle}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Crop Area */}
              <div className="flex justify-center mb-5">
                <div
                  ref={containerRef}
                  className="relative rounded-full overflow-hidden border-4 border-primary/30 shadow-2xl select-none touch-none"
                  style={{ width: CROP_SIZE / 2, height: CROP_SIZE / 2 }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  <div
                    className="absolute"
                    style={{
                      width: dim.w / 2,
                      height: dim.h / 2,
                      left: `calc(50% + ${offset.x / 2}px - ${dim.w / 4}px)`,
                      top: `calc(50% + ${offset.y / 2}px - ${dim.h / 4}px)`,
                    }}
                  >
                    {imgNatural.w > 0 && (
                      <img
                        src={imageSrc}
                        alt="Crop"
                        className="w-full h-full pointer-events-none"
                        draggable={false}
                      />
                    )}
                  </div>

                  {/* Crosshair guide */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
                  </div>
                </div>
              </div>

              {/* Zoom Slider */}
              <div className="flex items-center gap-3 mb-5 px-2">
                <ZoomOut className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  type="range"
                  min={MIN_ZOOM * 100}
                  max={MAX_ZOOM * 100}
                  value={zoom * 100}
                  onChange={(e) => handleZoomSlider(Number(e.target.value) / 100)}
                  className="flex-1 accent-primary h-1.5"
                />
                <ZoomIn className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-muted border border-border text-xs font-black uppercase tracking-widest hover:bg-muted/80 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t.reset}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-2xl bg-muted border border-border text-xs font-black uppercase tracking-widest hover:bg-muted/80 transition-all"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  {t.confirm}
                </button>
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
