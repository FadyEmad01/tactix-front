'use client';

import { cn } from '@/lib/utils';
import { motion, type SVGMotionProps } from 'motion/react';

const pathVariants = {
    hidden: {
        pathLength: 0,
        fillOpacity: 0,
        opacity: 0,
    },
    visible: {
        pathLength: 1,
        fillOpacity: 1,
        opacity: 1,
        transition: {
            delay: 4,
            duration: 1.2,
            ease: 'easeInOut',
            pathLength: {
                delay: 4,
                duration: 1.2,
                ease: 'easeInOut',
            },
            fillOpacity: {
                delay: 4.5,
                duration: 0.5,
            },
            opacity: {
                delay: 4,
                duration: 0.1,
            },
        },
    },
} as const;

// const rectVariants = {
//     hidden: {
//         opacity: 0,
//         scale: 0.8,
//         originX: 0.5,
//         originY: 0.5,
//     },
//     visible: {
//         opacity: 1,
//         scale: 1,
//         transition: {
//             duration: 0.8,
//             ease: 'easeOut',
//         },
//     },
// };

const sizes = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24',
    '2xl': 'h-32',
};

export const LogoAnimation = ({
    draw = false,
    size = 'md',
    className,
    containerClassName,
    ...props
}: {
    containerClassName?: string;
    draw?: boolean;
    size?: keyof typeof sizes;
} & SVGMotionProps<SVGSVGElement>) => {
    return (
        <div className={cn('relative', containerClassName)}>
            <motion.svg
                width="140"
                height="138"
                viewBox="0 0 140 138"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={cn(sizes[size], 'w-auto', className)}
                initial={draw ? 'hidden' : 'visible'}
                animate={draw ? 'visible' : 'visible'}
                // style={draw ? { willChange: 'opacity, pathLength, fillOpacity' } : undefined}
                {...props}
            >
                <motion.path
                    variants={pathVariants}
                    stroke="currentColor"
                    strokeWidth={draw ? 0.5 : 0} // Only show stroke during draw animation
                    d="M79.0074 135.229C87.0384 92.1326 120.133 80.6892 137.804 80.1914C138.953 80.159 139.838 81.1503 139.697 82.2911C138.942 88.4246 137.166 93.7663 136.02 96.5041C135.762 97.1191 135.183 97.5348 134.525 97.6461C108.877 101.989 98.6715 122.476 96.4895 133.307C96.3506 133.996 95.8899 134.584 95.2278 134.82C90.3445 136.564 84.6273 137.272 80.9477 137.487C79.7183 137.559 78.7818 136.44 79.0074 135.229Z"
                    className="fill-white"
                />
                <motion.path
                    variants={pathVariants}
                    stroke="currentColor"
                    strokeWidth={draw ? 0.5 : 0}
                    d="M79.0074 2.33487C87.0384 45.4312 120.133 56.8745 137.804 57.3724C138.953 57.4048 139.838 56.4135 139.697 55.2727C138.942 49.1391 137.166 43.7975 136.02 41.0597C135.762 40.4447 135.183 40.029 134.525 39.9177C108.877 35.5743 98.6715 15.0873 96.4895 4.25677C96.3506 3.56754 95.8899 2.98001 95.2278 2.74361C90.3445 1.00008 84.6273 0.291286 80.9477 0.0767093C79.7183 0.00501593 78.7818 1.12423 79.0074 2.33487Z"
                    className="fill-white"
                />
                <motion.path
                    variants={pathVariants}
                    stroke="currentColor"
                    strokeWidth={draw ? 0.5 : 0}
                    d="M60.9043 135.229C52.8734 92.1326 19.7784 80.6892 2.10796 80.1914C0.958977 80.159 0.0740046 81.1503 0.214435 82.2911C0.969445 88.4246 2.74569 93.7663 3.89223 96.5041C4.14979 97.1191 4.72903 97.5348 5.38646 97.6461C31.035 101.989 41.2403 122.476 43.4223 133.307C43.5611 133.996 44.0218 134.584 44.684 134.82C49.5672 136.564 55.2845 137.272 58.964 137.487C60.1934 137.559 61.1299 136.44 60.9043 135.229Z"
                    className="fill-white"
                />
                <motion.path
                    variants={pathVariants}
                    stroke="currentColor"
                    strokeWidth={draw ? 0.5 : 0}
                    d="M60.9043 2.33487C52.8734 45.4312 19.7784 56.8745 2.10796 57.3724C0.958977 57.4048 0.0740046 56.4135 0.214435 55.2727C0.969445 49.1391 2.74569 43.7975 3.89223 41.0597C4.14979 40.4447 4.72903 40.029 5.38646 39.9177C31.035 35.5743 41.2403 15.0873 43.4223 4.25677C43.5611 3.56754 44.0218 2.98001 44.684 2.74361C49.5672 1.00008 55.2845 0.291286 58.964 0.0767093C60.1934 0.00501593 61.1299 1.12423 60.9043 2.33487Z"
                    className="fill-white"
                />

                {/* 4. Text "Fady UI" */}
                <motion.path
                    variants={pathVariants}
                    stroke="currentColor"
                    strokeWidth={draw ? 0.2 : 0}
                    d="M70.349 44.8032C84.0233 44.8032 95.1088 55.8886 95.1088 69.563C95.1087 81.7625 86.2854 91.9006 74.6722 93.9458V61.8061C74.6722 60.6639 73.7461 59.7379 72.6039 59.7378H56.4496C54.7927 59.7378 53.4496 61.0809 53.4496 62.7378V64.5991C53.4496 66.2559 54.7927 67.5981 56.4496 67.5981H65.2396V93.7934C54.0168 91.4387 45.5893 81.4856 45.5892 69.563C45.5892 55.8886 56.6746 44.8032 70.349 44.8032ZM80.8158 59.7378C79.1591 59.7379 77.8158 61.081 77.8158 62.7378V64.5981C77.816 66.2547 79.1592 67.5979 80.8158 67.5981H83.4623C85.119 67.5981 86.4621 66.2548 86.4623 64.5981V62.7378C86.4623 61.0809 85.1191 59.7378 83.4623 59.7378H80.8158Z"
                    className="fill-white"
                />
            </motion.svg>

            <span className="sr-only">Tactix Logo</span>
        </div>
    );
};