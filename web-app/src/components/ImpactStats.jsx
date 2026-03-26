import React, { useState, useEffect, useRef } from 'react';
import { Sprout, Recycle, Trees } from 'lucide-react';

const StatCard = ({ icon, label, targetValue, suffix, delay }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const end = targetValue;
    const duration = 2000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, targetValue]);

  return (
    <div 
      ref={cardRef}
      className="flex flex-col items-center justify-center p-8 bg-primary-light/30 rounded-3xl border border-primary/10 transition-all hover:scale-105 duration-300"
    >
      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
        {icon}
      </div>
      <h3 className="text-4xl md:text-5xl font-extrabold text-primary-dark mb-2">
        {count.toLocaleString()}{suffix}
      </h3>
      <p className="text-neutral-gray font-medium text-center uppercase tracking-wider text-sm">
        {label}
      </p>
    </div>
  );
};

const ImpactStats = () => {
  const stats = [
    {
      icon: <Trees className="w-8 h-8 text-primary" />,
      label: "Total CO2 Offset",
      targetValue: 18240,
      suffix: " kg",
    },
    {
      icon: <Recycle className="w-8 h-8 text-primary" />,
      label: "Plastic Roads Built",
      targetValue: 3.2,
      suffix: " km",
    },
    {
      icon: <Sprout className="w-8 h-8 text-primary" />,
      label: "Fertilizer Produced",
      targetValue: 9800,
      suffix: " kg",
    },
  ];

  return (
    <section id="impact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-dark mb-4">Our Collective Impact</h2>
          <p className="text-neutral-gray max-w-xl mx-auto mb-4">
            Small steps at the bin lead to massive strides for the city. 
            Here's what we've achieved together so far.
          </p>
          <div className="text-xs text-neutral-gray font-medium flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
            Last update: Today at 6:00 AM • Refreshes every 24 hours
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;
