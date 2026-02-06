import { redirect } from "next/navigation";
import { fetchUserProfile } from "@/lib/fetchUserProfile";

import IntroAnimation from "@/components/landing/IntroAnimation";
import Hero from "@/components/landing/Hero/Hero";
import Services from "@/components/landing/Services/Services";
import Footer from "@/components/landing/footer";
import Lenis from "@/components/landing/provider/Lenis";

export default async function Home() {
  const user = await fetchUserProfile();

  if (user) {
    redirect("/projects");
  }

  return (
    <Lenis>
      <div className="relative">
        <div className="bg-white">
          <div className="w-full overflow-hidden">
            <IntroAnimation />
            <Hero />
          </div>

          <div className="relative z-50">
            <Services />
            <Footer />
          </div>
        </div>
      </div>
    </Lenis>
  );
}
