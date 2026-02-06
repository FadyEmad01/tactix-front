import React from "react";

const UIShowcase: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Button مع neon yellow و glow */}
      <button
        type="button"
        className="bg-neon-yellow text-black glow-yellow-strong px-6 py-2 rounded-lg font-semibold"
      >
        Get Started
      </button>

      {/* Success card مع electric green */}
      <div className="bg-electric-green/10 border border-electric-green rounded-xl p-4 font-medium">
        Team Won! ✅
      </div>

      {/* Stats card مع gradient و hover */}
      <div className="bg-gradient-blue hover-lift rounded-xl p-5 text-white">
        Live Match Stats
      </div>

      {/* Premium feature */}
      <span className="text-purple-accent glow-purple font-semibold">
        ⭐ Premium
      </span>
    </div>
  );
};

export default UIShowcase;
