import React from 'react';
import { Home, Factory, Building2, ChevronRight } from 'lucide-react';

const Card = ({ icon, title, description, badge }) => (
  <div className="group relative bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-primary/20 transition-all duration-500 flex flex-col items-center text-center">
    <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500">
      {React.cloneElement(icon, { className: 'w-10 h-10' })}
    </div>
    
    <div className="inline-flex px-3 py-1 rounded-full bg-primary-light/40 text-primary-dark text-xs font-bold mb-4 uppercase tracking-[0.2em]">
      {badge}
    </div>

    <h3 className="text-2xl font-bold text-neutral-dark mb-4">{title}</h3>
    <p className="text-neutral-gray leading-relaxed mb-8">
      {description}
    </p>

    <button className="flex items-center gap-2 text-primary font-bold group-hover:gap-4 transition-all duration-300">
      Learn More <ChevronRight className="w-5 h-5" />
    </button>
  </div>
);

const WhoIsItFor = () => {
  const audiences = [
    {
      badge: "Societies",
      title: "Residential Societies",
      description: "Track your waste, climb the leaderboard, and earn green credits for your community.",
      icon: <Home />,
    },
    {
      badge: "Industrial",
      title: "Factories & NGOs",
      description: "Subscribe to guaranteed, verified waste streams for your circular production needs.",
      icon: <Factory />,
    },
    {
      badge: "Governance",
      title: "City Administrators",
      description: "Monitor city-wide segregation accuracy and logistics efficiency in real-time.",
      icon: <Building2 />,
    },
  ];

  return (
    <section id="who-is-it-for" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-neutral-dark mb-4">Empowering the Ecosystem</h2>
          <p className="text-neutral-gray max-w-xl mx-auto text-lg leading-relaxed">
            UrbanEco-Link brings all stakeholders together on a single, transparent, and rewarding platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {audiences.map((audience, idx) => (
            <Card key={idx} {...audience} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoIsItFor;
