'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(CustomEase, Flip);
}

const IntroAnimation: React.FC = () => {
    const mainTlRef = useRef<gsap.core.Timeline | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const finalWrapperRef = useRef<HTMLDivElement>(null);
    const finalImageRef = useRef<HTMLImageElement>(null);
    const myRef = useRef<HTMLDivElement>(null);

    const [isClient, setIsClient] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(0);

    const INITIAL_ZOOM = 1;
    const TOTAL_IMAGES = 5;

    // Track image loading with Next.js Image component
    const handleImageLoad = () => {
        setImagesLoaded(prev => prev + 1);
    };

    // Function to lock scroll
    const lockScroll = () => {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
    };

    // Function to unlock scroll
    const unlockScroll = () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    };

    // Function to reset to initial state
    const resetToInitialState = () => {
        if (!containerRef.current) return;

        gsap.set(containerRef.current, {
            width: '300px',
            height: '300px',
            position: 'relative',
            overflow: 'hidden'
        });

        const wrappers = containerRef.current.querySelectorAll('.image-wrapper');
        const images = containerRef.current.querySelectorAll('.image-wrapper img');

        gsap.set(wrappers, {
            visibility: 'visible',
            clipPath: 'inset(100% 0 0 0)',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            xPercent: 0,
            yPercent: 0,
            clearProps: 'transform,transformOrigin',
        });

        gsap.set(images, {
            scale: INITIAL_ZOOM,
            transformOrigin: 'center center',
            clearProps: 'width,height'
        });
    };

    // Initialize animation
    const initAnimation = () => {
        if (mainTlRef.current) mainTlRef.current.kill();
        if (!containerRef.current) return;

        resetToInitialState();

        const wrappers = containerRef.current.querySelectorAll('.image-wrapper');

        const mainTl = gsap.timeline({
            onComplete: () => {
                // Small delay before removing loader and unlocking scroll
                setTimeout(() => {
                    unlockScroll();
                    // Mark loader as shown in session
                    // sessionStorage.setItem('loaderShown', 'true');
                }, 3000);
            }
        });
        mainTlRef.current = mainTl;

        // Create custom eases
        CustomEase.create('customEase', '0.6, 0.01, 0.05, 1');
        CustomEase.create('smoothBlur', '0.25, 0.1, 0.25, 1');

        // PHASE 1: Image loading sequence
        wrappers.forEach((wrapper, index) => {
            if (index > 0) {
                mainTl.add('image' + index, '<0.15');
            }

            mainTl.to(
                wrapper,
                {
                    clipPath: 'inset(0% 0 0 0)',
                    duration: 0.65,
                    ease: 'smoothBlur',
                    delay: 0.4
                },
                index > 0 ? 'image' + index : 0
            );
        });

        mainTl.add('pauseBeforeZoom', '>0.2');
        mainTl.add('finalAnimation', 'pauseBeforeZoom');

        // PHASE 2: Final image expansion to fullscreen
        mainTl.add(() => {
            if (!finalWrapperRef.current || !finalImageRef.current || !containerRef.current) return;

            const state = Flip.getState(finalWrapperRef.current);

            gsap.set(containerRef.current, { overflow: 'visible' });

            gsap.set(finalWrapperRef.current, {
                position: 'fixed',
                top: '50%',
                left: '50%',
                xPercent: -50,
                yPercent: -50,
                width: '100%',
                height: '100vh',
                zIndex: 9999
            });

            Flip.from(state, {
                // 
                delay: 1.2,
                // 
                duration: 1.2,
                ease: 'customEase',
                absolute: true
            });

            gsap.to(finalImageRef.current, {
                // 
                delay: 1.2,
                // 
                scale: 1.0,
                duration: 1.2,
                ease: 'customEase'
            });

            gsap.to(myRef.current, {
                opacity: 0,
                duration: 0.5,
                // delay: 1.2,

                // 
                delay: 2.4,
                // 
                onComplete: () => {
                    if (myRef.current) {
                        myRef.current.style.display = 'none';
                    }
                }
            });
        }, 'finalAnimation');
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        // Check if loader has already been shown this session
        // const loaderShown = sessionStorage.getItem('loaderShown');

        // if (loaderShown) {
        //     // Skip loader, just hide it and unlock scroll
        //     if (myRef.current) {
        //         myRef.current.style.display = 'none';
        //     }
        //     unlockScroll();
        //     return;
        // }

        // Lock scroll immediately
        lockScroll();

        return () => {
            if (mainTlRef.current) mainTlRef.current.kill();
            // setTimeout(()=>{unlockScroll();}, 5000)
            // unlockScroll();
        };
    }, [isClient]);

    useEffect(() => {
        if (!isClient || imagesLoaded < TOTAL_IMAGES) return;

        gsap.config({ force3D: true });

        const timer = setTimeout(() => {
            initAnimation();
        }, 100);

        return () => {
            clearTimeout(timer);
        };
    }, [isClient, imagesLoaded]);

    if (!isClient) return null;

    // Don't render if loader was already shown
    // if (typeof window !== 'undefined' && sessionStorage.getItem('loaderShown')) {
    //     return null;
    // }

    return (
        <div
            ref={myRef}
            className='preloader-container-parent overflow-hidden'
        >
            <div ref={containerRef} className="preloader-container">
                <div className="image-wrapper">
                    <Image
                        src="/images/p1.jpeg"
                        alt="Image 1"
                        fill
                        priority
                        quality={100}
                        sizes="300px"
                        onLoad={handleImageLoad}
                        style={{ objectFit: 'cover' }}
                    />
                </div>
                <div className="image-wrapper">
                    <Image
                        src="/images/p2.jpeg"
                        alt="Image 2"
                        fill
                        priority
                        quality={100}
                        sizes="300px"
                        onLoad={handleImageLoad}
                        style={{ objectFit: 'cover' }}
                    />
                </div>
                <div className="image-wrapper">
                    <Image
                        src="/images/p1.jpeg"
                        alt="Image 3"
                        fill
                        priority
                        quality={100}
                        sizes="300px"
                        onLoad={handleImageLoad}
                        style={{ objectFit: 'cover' }}
                    />
                </div>
                <div className="image-wrapper">
                    <Image
                        src="/images/p2.jpeg"
                        alt="Image 4"
                        fill
                        priority
                        quality={100}
                        sizes="300px"
                        onLoad={handleImageLoad}
                        style={{ objectFit: 'cover' }}
                    />
                </div>
                <div ref={finalWrapperRef} className="image-wrapper" id="final-image">
                    <Image
                        ref={finalImageRef}
                        // src="/images/hero.jpeg"
                        src="/images/soccer.jpg"
                        alt="Image 5"
                        fill
                        priority
                        quality={100}
                        sizes="100vw"
                        onLoad={handleImageLoad}
                        style={{ objectFit: 'cover' }}
                        className='brightness-50'
                    />
                </div>
            </div>
        </div>
    );
};

export default IntroAnimation;