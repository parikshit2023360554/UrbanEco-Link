import React from 'react';
import { Trophy, TrendingUp, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const societies = [
  { rank: 'A++', name: 'Raghuma Hostel', city: 'Bangalore', diverted: 1340, accuracy: 99, color: 'text-emerald-600 bg-emerald-50', points: 1340 },
  { rank: 'A++', name: 'Green Valley Apts', city: 'Mumbai', diverted: 1120, accuracy: 97, color: 'text-emerald-600 bg-emerald-50', points: 1120 },
  { rank: 'A++', name: 'Sunrise RWA', city: 'Pune', diverted: 1050, accuracy: 96, color: 'text-emerald-600 bg-emerald-50', points: 1050 },
  { rank: 'A++', name: 'Oakwood Society', city: 'Delhi', diverted: 980, accuracy: 95, color: 'text-emerald-600 bg-emerald-50', points: 980 },
  { rank: 'A+', name: 'Maple Heights', city: 'Chennai', diverted: 860, accuracy: 92, color: 'text-green-600 bg-green-50', points: 860 },
];

const Leaderboard = () => {
  return (
    <section id="leaderboard" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full font-bold text-xs mb-6 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            Updated Daily
          </div>
          <h2 className="text-4xl font-bold text-neutral-dark mb-4">City Leaderboard</h2>
          <p className="text-neutral-gray max-w-xl mx-auto">
            Societies competing for the highest segregation accuracy and waste diversion impact.
          </p>
        </div>

        <div className="grid gap-4 max-w-4-xl mx-auto">
          {societies.map((society, index) => (
            <div 
              key={society.name}
              className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col md:flex-row md:items-center gap-6"
            >
              {/* Rank Badge */}
              <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl ${society.color}`}>
                {society.rank}
              </div>

              {/* Info */}
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-neutral-dark">{society.name}</h3>
                  {index === 0 && (
                    <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-[9px] font-black rounded-full shadow-sm flex items-center gap-1 uppercase tracking-tighter">
                      <Trophy className="w-2.5 h-2.5" />
                      City Champion
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-neutral-gray">
                  <MapPin className="w-4 h-4" />
                  {society.city}
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 md:text-right">
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-gray font-medium uppercase tracking-wider">Total Diverted</span>
                  <span className="text-lg font-bold text-neutral-dark">{society.diverted.toLocaleString()} kg</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-gray font-medium uppercase tracking-wider">Accuracy</span>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary">{society.accuracy}%</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full md:w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000"
                  style={{ width: `${society.accuracy}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/leaderboard" className="text-primary font-bold hover:underline inline-flex items-center gap-2">
            View Full Leaderboard
            <TrendingUp className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;
