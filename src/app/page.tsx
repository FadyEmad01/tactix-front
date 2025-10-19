import { ModeToggle } from "@/components/theme/ModeToggle";
export default function Home() {
  return (
    <div className="relative w-full h-screen">
      <div className="absolute bottom-4 right-4">
        <ModeToggle />
      </div>
    </div>
  );
}
