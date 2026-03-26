import React from 'react';
import { Leaf, Recycle, Trash2, Clock, TrendingUp } from 'lucide-react';

const staticFeed = [
  { id: 1, society: 'Raghuma Hostel', type: 'Plastic', amount: '40kg', destination: 'GreenRoad Constructions', icon: <Recycle className="w-5 h-5 text-blue-500" />, time: 'Today, 2:30 PM' },
  { id: 2, society: 'Lotus Gardenia', type: 'Organic', amount: '120kg', destination: 'City Compost Unit', icon: <Leaf className="w-5 h-5 text-green-500" />, time: 'Today, 1:15 PM' },
  { id: 3, society: 'Skyline Heights', type: 'Metal', amount: '15kg', destination: 'Steel-Recycle Corp', icon: <Trash2 className="w-5 h-5 text-gray-500" />, time: 'Today, 11:45 AM' },
  { id: 4, society: 'Greenwood Residency', type: 'Plastic', amount: '85kg', destination: 'Eco-Brick Factory', icon: <Recycle className="w-5 h-5 text-blue-500" />, time: 'Yesterday, 5:20 PM' },
  { id: 5, society: 'Orchid Enclave', type: 'Organic', amount: '60kg', destination: 'Bio-Gas Plant', icon: <Leaf className="w-5 h-5 text-green-500" />, time: 'Yesterday, 4:10 PM' },
];

const JourneyFeed = () => {
  return (
    <section id="feed" className="py-24 bg-primary-light/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full font-bold text-xs mb-6 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            Updated Daily
          </div>
          <h2 className="text-4xl font-bold text-neutral-dark mb-4 text-center">Impact Contribution Feed</h2>
          <p className="text-neutral-gray max-w-xl mx-auto mb-4">
            Recent record of waste being diverted from landfills to circular economy partners.
          </p>
          <div className="text-xs text-neutral-gray font-medium">
            Refreshes every 24 hours • <span className="text-primary/70">Last update: Today at 6:00 AM</span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto relative h-[450px] overflow-hidden">
          {/* Fading Gradients */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-primary-light/20 to-transparent z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-primary-light/20 to-transparent z-10" />

          <div className="flex flex-col gap-4 py-8">
            {staticFeed.map((item) => (
              <div 
                key={item.id}
                className="bg-white p-6 rounded-2xl border-l-4 border-primary shadow-sm hover:shadow-md transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-dark">{item.society}</h4>
                    <p className="text-sm text-neutral-gray">
                      {item.amount} {item.type} → <span className="text-primary font-medium">{item.destination}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-gray font-medium">
                  <Clock className="w-3 h-3 text-primary/60" />
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JourneyFeed;
