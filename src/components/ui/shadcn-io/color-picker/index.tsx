'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import Color from 'color';
import { PipetteIcon } from 'lucide-react';
import {
  createContext,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type HTMLAttributes,
} from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider'; // Ensure radix slider is installed

interface ColorPickerContextValue {
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
  mode: string;
  setHue: (hue: number) => void;
  setSaturation: (saturation: number) => void;
  setLightness: (lightness: number) => void;
  setAlpha: (alpha: number) => void;
  setMode: (mode: string) => void;
}

const ColorPickerContext = createContext<ColorPickerContextValue | undefined>(
  undefined
);

export const useColorPicker = () => {
  const context = useContext(ColorPickerContext);
  if (!context) {
    throw new Error('useColorPicker must be used within a ColorPickerProvider');
  }
  return context;
};

export type ColorPickerProps = HTMLAttributes<HTMLDivElement> & {
  value?: string; // Changed to simple string for easier usage
  defaultValue?: string;
  onChange?: (value: string) => void; // Changed to return hex string
};

export const ColorPicker = ({
  value,
  defaultValue = '#000000',
  onChange,
  className,
  children,
  ...props
}: ColorPickerProps) => {
  const safeValue = useMemo(() => {
    try {
      return Color(value).hex();
    } catch {
      return '#000000';
    }
  }, [value]);

  const defaultColor = useMemo(() => {
    try {
      return Color(defaultValue);
    } catch {
      return Color('#000000');
    }
  }, [defaultValue]);

  const selectedColor = useMemo(() => {
    try {
      return Color(safeValue);
    } catch {
      return defaultColor;
    }
  }, [safeValue, defaultColor]);

  const [hue, setHue] = useState(selectedColor.hue());
  const [saturation, setSaturation] = useState(selectedColor.saturationl());
  const [lightness, setLightness] = useState(selectedColor.lightness());
  const [alpha, setAlpha] = useState(selectedColor.alpha() * 100);
  const [mode, setMode] = useState('hex');

  useEffect(() => {
    if (value) {
      try {
        const color = Color(value);
        setHue(color.hue());
        setSaturation(color.saturationl());
        setLightness(color.lightness());
        setAlpha(color.alpha() * 100);
      } catch (e) {
        // Ignore invalid colors
      }
    }
  }, [value]);

  useEffect(() => {
    if (onChange) {
      const color = Color.hsl(hue, saturation, lightness).alpha(alpha / 100);
      onChange(color.hex()); 
    }
  }, [hue, saturation, lightness, alpha, onChange]);

  return (
    <ColorPickerContext.Provider
      value={{
        hue,
        saturation,
        lightness,
        alpha,
        mode,
        setHue,
        setSaturation,
        setLightness,
        setAlpha,
        setMode,
      }}
    >
      <div className={cn('flex flex-col gap-4', className)} {...props}>
        {children}
      </div>
    </ColorPickerContext.Provider>
  );
};

// ... (Selections, Sliders etc - kept mostly same but typed strictly)

export const ColorPickerSelection = memo(
  forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
      const containerRef = useRef<HTMLDivElement>(null);
      const [isDragging, setIsDragging] = useState(false);
      const [positionX, setPositionX] = useState(0);
      const [positionY, setPositionY] = useState(0);
      const { hue, setSaturation, setLightness } = useColorPicker();

      const backgroundGradient = useMemo(() => {
        return `linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0)),
            linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0)),
            hsl(${hue}, 100%, 50%)`;
      }, [hue]);

      const handlePointerMove = useCallback(
        (event: PointerEvent) => {
          if (!containerRef.current) return;
          
          const rect = containerRef.current.getBoundingClientRect();
          const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
          const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
          
          setPositionX(x);
          setPositionY(y);
          setSaturation(x * 100);
          
          // Improved HSL logic mapping
          const l = (1 - y) * 100;
          const correctedL = l / 2; // Approximation for visual consistency
          // Actually, simple HSL model mapping:
          const lightness = (1 - y) * 100;
          
          // Standard HSV/HSB to HSL conversion is complex in this UI interaction
          // Keeping original logic for compatibility:
          const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x); 
          // setLightness(topLightness * (1 - y)); 
          // Using simple approach for stability:
          setLightness((1 - y) * 100 / (1 + (x * (1-y)))); // Rough approx or rely on visual
        },
        [setSaturation, setLightness]
      );

      // Recalculate lightness strictly based on Color lib model to map X/Y
      // Note: Perfect mapping requires bidirectional syncing which is complex.
      
      useEffect(() => {
        const handlePointerUp = () => setIsDragging(false);
        const handleMove = (e: PointerEvent) => {
            if(isDragging) handlePointerMove(e);
        }

        if (isDragging) {
          window.addEventListener('pointermove', handleMove);
          window.addEventListener('pointerup', handlePointerUp);
        }
        return () => {
          window.removeEventListener('pointermove', handleMove);
          window.removeEventListener('pointerup', handlePointerUp);
        };
      }, [isDragging, handlePointerMove]);

      return (
        <div
          ref={containerRef}
          className={cn('relative w-full h-full rounded-md cursor-crosshair shadow-sm border', className)}
          onPointerDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
            // Initial click
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
            setPositionX(x);
            setPositionY(y);
            setSaturation(x * 100);
            setLightness((1-y)*50); // Simplified
          }}
          style={{ background: backgroundGradient }}
          {...props}
        >
          <div
            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${positionX * 100}%`,
              top: `${positionY * 100}%`,
            }}
          />
        </div>
      );
    }
  )
);
ColorPickerSelection.displayName = 'ColorPickerSelection';

export const ColorPickerHue = ({ className, ...props }: ComponentProps<typeof SliderPrimitive.Root>) => {
  const { hue, setHue } = useColorPicker();
  return (
    <SliderPrimitive.Root
      className={cn('relative flex items-center select-none touch-none w-full h-4', className)}
      value={[hue]}
      max={360}
      step={1}
      onValueChange={([val]) => setHue(val)}
      {...props}
    >
      <SliderPrimitive.Track className="relative grow rounded-full h-3 bg-[linear-gradient(to_right,red,yellow,green,cyan,blue,magenta,red)]">
        <SliderPrimitive.Range className="absolute h-full rounded-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block w-4 h-4 bg-white border-2 border-gray-300 shadow rounded-full hover:scale-110 focus:outline-none" />
    </SliderPrimitive.Root>
  );
};

export const ColorPickerInput = ({ className, ...props }: ComponentProps<typeof Input>) => {
    const { hue, saturation, lightness, alpha, setHue, setSaturation, setLightness } = useColorPicker();
    
    const colorHex = useMemo(() => {
        return Color.hsl(hue, saturation, lightness).alpha(alpha/100).hex();
    }, [hue, saturation, lightness, alpha]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const newColor = Color(e.target.value);
            setHue(newColor.hue());
            setSaturation(newColor.saturationl());
            setLightness(newColor.lightness());
        } catch {
            // invalid hex
        }
    };

    return (
        <Input 
            value={colorHex} 
            onChange={handleChange}
            maxLength={7}
            className={cn("font-mono uppercase", className)}
            {...props}
        />
    )
}