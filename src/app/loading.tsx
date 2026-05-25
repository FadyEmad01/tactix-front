import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
    return (
        <div className="min-h-dvh bg-background flex items-center justify-center">
            <Spinner />
        </div>
    )
}