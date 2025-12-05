"use client"
import React, { useEffect, useState } from 'react'
import { Header } from '../header';
import { cn } from '@/lib/utils';
import BlockRevealText from '../components/BlockRevealText';
import Container from '@/components/layout/Container';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function Hero() {
    const [transition, setTransition] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setTransition(true), 6000);
        const timer2 = setTimeout(() => setIsLoaded(true), 2500);
        return () => {
            clearTimeout(timer);
            clearTimeout(timer2);
        };
    }, []);
    return (
        <>
            <main
                className={cn(
                    "relative min-h-dvh z-[99999]",
                    !isLoaded && "overflow-y-hidden"
                )}
            >
                <Header transition={transition} />

                <>
                    {transition && (
                        <>
                            <div className="absolute -z-50 w-full h-screen overflow-hidden">
                                <Image
                                    fill
                                    className="w-full h-full absolute -z-10 object-cover object-center brightness-50"
                                    // src="/images/hero.jpeg"
                                    src="/images/soccer.jpg"
                                    alt=""
                                    priority
                                />
                            </div>

                            <Container className='!px-[18px] relative w-full h-screen'>
                                <section className="relative flex w-full h-full items-end">
                                    <div className="z-10 grid items-end gap-4 md:grid-cols-2 md:gap-12 text-white mb-8">
                                        <BlockRevealText>
                                            <h1 className="text-4xl font-semibold">
                                                The Lyra ecosystem brings together our models
                                            </h1>
                                        </BlockRevealText>

                                        <div className='max-w-sm sm:ml-auto'>
                                            <Card className='hidden sm:block bg-black/20 backdrop-blur-md border-none pt-0 mb-8 mt-4 max-w-sm font-sans overflow-hidden'>
                                                <CardHeader className='bg-white rounded-t-xl text-black gap-0 py-2'>
                                                    <div className="flex items-center justify-between">
                                                        <span className='capitalize text-xs font-bold tracking-wide'>Subscription Tier</span>
                                                        {/* <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> */}
                                                        <span className='rounded-full bg-phosphor text-[10px] font-bold px-1.5 py-0.5 animate-pulse'>Free</span>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className='text-white mt-3'>

                                                    <div className='flex items-end justify-between gap-x-4'>
                                                        {/* <h5 className='uppercase font-bold text-xl'>Free</h5> */}
                                                        <div>
                                                            <h5 className="text-4xl font-bold tracking-tighter">FREE</h5>
                                                            <p className="text-white/60 text-sm mt-1">$0.00 / month</p>
                                                        </div>
                                                        <ul className=" list-disc [&>li]:mt-1 max-w-[200px] font-mono">
                                                            <li>Accses to all Featur</li>
                                                            <li>unlimited number of projects</li>
                                                            <li>open source project</li>
                                                        </ul>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            <BlockRevealText className='max-w-sm sm:ml-auto'>
                                                <p className="">
                                                    Empower your team with workflows that adapt to your needs, whether
                                                    you prefer git synchronization or a AI Agents interface.
                                                </p>
                                            </BlockRevealText>
                                        </div>
                                    </div>
                                </section>
                            </Container>

                        </>
                    )}
                </>




            </main >
        </>
    )
}
