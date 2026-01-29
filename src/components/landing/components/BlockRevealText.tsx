import React, { useRef } from "react";
import { motion, useInView, useAnimation, Variant } from "motion/react";
import { cn } from "@/lib/utils";


interface BlockRevealProps {
  children: React.ReactNode;
  /** The color of the revealing block */
  blockColor?: string;
  /** Duration of the animation in seconds */
  duration?: number;
  /** Delay before starting animation */
  delay?: number;
  /** Custom Tailwind classes for the container (e.g. text styling) */
  className?: string;
}

export const BlockRevealText = ({
  children,
  blockColor = "#D2FF00",
  duration = 0.5,
  delay = 0.25,
  className,
}: BlockRevealProps) => {
  const ref = useRef(null);
  // "once: true" ensures the animation only happens the first time it enters viewport
  // const isInView = useInView(ref, { once: true, margin: "-100px" }); 
  const isInView = useInView(ref, { once: true, margin: "10px" }); 
  
  const mainControls = useAnimation();
  const slideControls = useAnimation();

  React.useEffect(() => {
    if (isInView) {
      // Fire the text reveal
      mainControls.start("visible");
      // Fire the block slide
      slideControls.start("visible");
    }
  }, [isInView, mainControls, slideControls]);

  return (
    <span
      ref={ref}
      className={cn("relative w-fit overflow-hidden py-1", className)}
    >
      {/* The Text Content */}
      <motion.span
        variants={{
          hidden: { opacity: 0},
          visible: { opacity: 1},
        }}
        initial="hidden"
        animate={mainControls}
        transition={{
          duration: duration,
          delay: delay + 0.1, // Text appears slightly after block starts
          ease: "easeOut",
        }}
      >
        {children}
      </motion.span>

      {/* The Revealing Block */}
      <motion.span
        variants={{
          hidden: { left: 0, right: "100%" },
          visible: {
            left: ["0%", "0%", "100%"],
            right: ["100%", "0%", "0%"],
            transition: {
              duration: duration,
              ease: "easeInOut",
              times: [0, 0.5, 1], // 0->50% (grow), 50%->100% (shrink)
              delay: delay,
            },
          },
        }}
        initial="hidden"
        animate={slideControls}
        style={{ backgroundColor: blockColor }} // Pass custom color here
        className="absolute bottom-1 left-0 right-0 top-1 z-20"
      />
    </span>
  );
};

export default BlockRevealText;