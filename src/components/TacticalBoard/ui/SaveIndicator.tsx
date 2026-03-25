// src/components/TacticalBoard/SaveIndicator.tsx
'use client';

interface SaveIndicatorProps {
    isSyncing: boolean;
    lastSyncedAt: number | null;
    hasServerId: boolean;
}

export default function SaveIndicator({ 
    isSyncing, 
    lastSyncedAt, 
    hasServerId 
}: SaveIndicatorProps) {
    const getStatusColor = () => {
        if (isSyncing) return 'bg-yellow-500 animate-pulse';
        if (!hasServerId) return 'bg-gray-500';
        if (lastSyncedAt) return 'bg-green-500';
        return 'bg-gray-500';
    };

    const getStatusText = () => {
        if (isSyncing) return 'Saving...';
        if (!hasServerId) return 'Not saved';
        if (lastSyncedAt) {
            const seconds = Math.floor((Date.now() - lastSyncedAt) / 1000);
            if (seconds < 60) return 'Saved just now';
            if (seconds < 3600) return `Saved ${Math.floor(seconds / 60)}m ago`;
            return `Saved ${Math.floor(seconds / 3600)}h ago`;
        }
        return 'Not synced';
    };

    return (
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <span>{getStatusText()}</span>
        </div>
    );
}