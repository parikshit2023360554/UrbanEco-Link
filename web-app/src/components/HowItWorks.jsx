import React from 'react';
import { Factory, Scan, Zap, QrCode, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: "Factory Subscribes",
    desc: "Factories set monthly waste quotas they need for production.",
    icon: <Factory className="w-6 h-6" />,
  },
  {
    id: 2,
    title: "Residents Scan",
    desc: "Wait is AI-verified at the bin using our mobile app.",
    icon: <Scan className="w-6 h-6" />,
  },
  {
    id: 3,
    title: "Smart Matching",
    desc: "Our AI auto-matches society supply to factory demand.",
    icon: <Zap className="w-6 h-6" />,
  },
  {
    id: 4,
    title: "Verified Pickup",
    desc: "A batch QR code is generated for seamless logistics.",
    icon: <QrCode className="w-6 h-6" />,
  },
  {
    id: 5,
    title: "Rank Updated",
    desc: "Society leaderboard rank rises after factory confirmation.",
    icon: <CheckCircle2 className="w-6 h-6" />,
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-primary-light/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-neutral-dark mb-4">The Subscription Loop</h2>
          <p className="text-neutral-gray max-w-xl mx-auto">
            A seamless, automated bridge between residential waste and industrial needs.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-primary/20 -z-10" />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 lg:gap-8">
            {steps.map((step, idx) => (
              <div key={step.id} className="relative flex flex-col items-center group">
                {/* Step Number/Icon */}
                <div className="w-24 h-24 rounded-full bg-white border-2 border-primary/20 shadow-sm flex items-center justify-center mb-6 group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 relative">
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center border-4 border-white">
                    {step.id}
                  </span>
                  {React.cloneElement(step.icon, { className: 'w-10 h-10' })}
                </div>

                <h3 className="text-lg font-bold text-neutral-dark mb-2 text-center group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-gray text-center leading-relaxed">
                  {step.desc}
                </p>

                {/* Mobile/Tablet Arrow (not on last) */}
                {idx !== steps.length - 1 && (
                  <div className="lg:hidden absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-20">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
