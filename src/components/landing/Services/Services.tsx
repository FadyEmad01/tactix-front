"use client";

import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { cn } from "@/lib/utils";
import Container from "@/components/layout/Container";

// Register GSAP plugins
if (typeof window !== "undefined") {
    gsap.registerPlugin(CustomEase);
    CustomEase.create("customEase", "0.6, 0.01, 0.05, 1");
}

const services = [
    {
        id: "01",
        title: "Product Design",
        category: "PRODUCT DESIGN",
        description:
            "We begin by understanding your business goals, target audience, and current challenges. This phase involves research, analysis, and strategic planning to identify opportunities.",
        image:
            "/images/hero.jpeg",
    },
    {
        id: "02",
        title: "Brand Design",
        category: "BRAND STRATEGY",
        description:
            "Our brand design process focuses on creating a cohesive visual identity that resonates with your audience. From logo creation to brand guidelines, we ensure consistency across all touchpoints.",
        image:
            "/images/p1.jpeg",
    },
    {
        id: "03",
        title: "UI/UX Design",
        category: "USER EXPERIENCE",
        description:
            "We craft intuitive user interfaces and seamless user experiences. Our design philosophy centers on empathy for the user, ensuring every interaction is meaningful and efficient.",
        image:
            "/images/p2.jpeg",
    },
    {
        id: "04",
        title: "Branding",
        category: "IDENTITY SYSTEMS",
        description:
            "Building a brand is more than just visuals. We help define your brand's voice, tone, and positioning to carve out a unique space in the market that drives loyalty.",
        image:
            "/images/soccer.jpg",
    },
];

/**
 * Robust GSAP Image Switcher
 * Renders all images absolute positioned and uses z-index/clip-path to reveal.
 */
const ImageSwitcher = ({ activeIndex }: { activeIndex: number }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
    const prevIndexRef = useRef(activeIndex);

    useEffect(() => {
        // Don't animate on first render (just show the first image)
        // Check if the index actually changed to prevent redundant animations
        if (prevIndexRef.current === activeIndex && imagesRef.current[activeIndex]?.style.clipPath === "") {
            // Ensure initial state is visible
            gsap.set(imagesRef.current[activeIndex], { zIndex: 10, clipPath: "inset(0% 0 0 0)" });
            return;
        }

        const currentImg = imagesRef.current[activeIndex];
        const prevImg = imagesRef.current[prevIndexRef.current];

        if (!currentImg || !prevImg) return;

        // 1. RESET: Kill any running animations on the incoming image to prevent conflicts
        gsap.killTweensOf(currentImg);

        // 2. LAYERING:
        // Move all images to back
        imagesRef.current.forEach((img) => {
            if (img) img.style.zIndex = "1";
        });

        // Keep the previous image visible just behind the new one so we don't see white background
        gsap.set(prevImg, { zIndex: 5 });

        // Place new image on top
        gsap.set(currentImg, { zIndex: 10 });

        // 3. ANIMATION
        // Start new image completely hidden (from bottom)
        gsap.fromTo(
            currentImg,
            { clipPath: "inset(100% 0 0 0)" },
            {
                clipPath: "inset(0% 0 0 0)",
                duration: 1.2,
                ease: "customEase",
                onComplete: () => {
                    // Cleanup: Reset clipPath of previous image once covered (optional optimization)
                    // But we leave it for stability in case of rapid reversals
                }
            }
        );

        // Update ref for next time
        prevIndexRef.current = activeIndex;
    }, [activeIndex]);

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden rounded-sm bg-gray-100">
            {services.map((service, i) => (
                <img
                    key={service.id}
                    ref={(el) => { imagesRef.current[i] = el; }}
                    src={service.image}
                    alt={service.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    // Initialize: First image visible, others hidden
                    style={{
                        clipPath: i === 0 ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)",
                        zIndex: i === 0 ? 10 : 1
                    }}
                />
            ))}
        </div>
    );
};

export default function Services() {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <section className="w-full py-20 bg-white text-slate-900 relative z-50">
            <Container className="!px-[18px]">
                <div className="grid grid-cols-1 md:grid-cols-12 sm:grid-cols-12 gap-12 lg:gap-20 items-start relative">
                    {/* LEFT COLUMN: Image & Static Text */}
                    <div className="lg:col-span-4 md:col-span-5 sm:col-span-6 sm:sticky sm:top-20 flex flex-col gap-6 justify-start self-start">

                        {/* Image Container */}
                        <div className="sm:aspect-square aspect-video w-full overflow-hidden rounded-sm shadow-sm">
                            <ImageSwitcher activeIndex={activeIndex} />
                        </div>

                        {/* Text Content (No Animation) */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold tracking-widest text-gray-400 uppercase">
                                {services[activeIndex].category}
                            </h4>
                            <p className="text-base md:text-lg leading-relaxed text-gray-600">
                                {services[activeIndex].description}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Interactive List */}
                    <div className="lg:col-span-8 md:col-span-7 sm:col-span-6 flex flex-col justify-center py-10 pt-0 lg:py-0">
                        {services.map((service, index) => (
                            <div
                                key={service.id}
                                className="group relative cursor-pointer border-b border-gray-200"
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => setActiveIndex(index)}
                            >
                                <div
                                    className={cn(
                                        "flex items-baseline justify-between py-6 md:py-10 transition-all duration-500 ease-in-out",
                                        activeIndex === index
                                            ? "opacity-100 translate-x-4"
                                            : "opacity-30 hover:opacity-60"
                                    )}
                                >
                                    <h2
                                        className={cn(
                                            "text-4xl md:text-6xl font-bold tracking-tight transition-colors duration-500",
                                            activeIndex === index ? "text-black" : "text-gray-400"
                                        )}
                                    >
                                        {service.title}
                                    </h2>

                                    <span
                                        className={cn(
                                            "text-2xl md:text-3xl font-medium font-mono transition-colors duration-300",
                                            activeIndex === index ? "text-phosphor" : "text-phosphor/80"
                                        )}
                                    >
                                        {"{" + service.id + "}"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}