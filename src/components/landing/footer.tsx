import Image from 'next/image'
import React from 'react'

export default function Footer() {
    return (
        <>
            <div className="sticky -z-0 bottom-0 left-0 w-full h-80 bg-black flex justify-center items-center">
                <div className="relative overflow-hidden w-full h-full flex justify-end px-8 text-right items-start py-12 text-white">
                    <div className="flex flex-row space-x-12 sm:pace-x-16 md:space-x-24 text-sm sm:text-lg md:text-xl">
                        <ul>
                            <li className="hover:underline cursor-pointer">Home</li>
                            <li className="hover:underline cursor-pointer">Docs</li>
                            <li className="hover:underline cursor-pointer">Comps</li>
                        </ul>
                        <ul>
                            <li className="hover:underline cursor-pointer">Github</li>
                            <li className="hover:underline cursor-pointer">Instagram</li>
                            <li className="hover:underline cursor-pointer">X (Twitter)</li>
                        </ul>
                    </div>
                    {/* <h6 className="absolute uppercase bottom-0 left-0  translate-y-[28%] sm:text-[162px] font-bold  text-[80px] text-black">
                        Tactix
                    </h6> */}
                    {/* <img className='absolute bottom-0 left-0 md:left-8  translate-y-[1%] w-full md:w-1/2' src="/og-images/full-logo.svg" alt="" /> */}
                    <Image width={0} height={0} className='absolute bottom-0 left-0 md:left-8  translate-y-[1%] w-full md:w-1/2' src="/og-images/full-logo.svg" alt="Tactix logo" />
                </div>
            </div>
        </>
    )
}
