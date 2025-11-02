"use client"

import VideoEditor from '@/components/video-editor/VideoEditor';
import dynamic from 'next/dynamic';

// const VideoEditor = dynamic(() => import('../../../components/video-editor/VideoEditor').then((m) => m.default), { ssr: false });

export default function EditorPage() {
    return (
        <>
            <div className="flex-1 h-[calc(100vh-4rem)]">
                <VideoEditor />
            </div>
        </>
    );
}