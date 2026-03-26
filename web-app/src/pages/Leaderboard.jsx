import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, MapPin, ChevronLeft, ChevronRight, Filter, Search, ArrowLeft, Building2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const societies = [
  { rank: 1, grade: 'A++', name: 'Raghuma Hostel', city: 'Bangalore', diverted: 1340, accuracy: 99, points: 1340, color: 'text-emerald-600 bg-emerald-50', isChampion: true },
  { rank: 2, grade: 'A++', name: 'Green Valley Apts', city: 'Mumbai', diverted: 1120, accuracy: 97, points: 1120, color: 'text-emerald-600 bg-emerald-50' },
  { rank: 3, grade: 'A++', name: 'Sunrise RWA', city: 'Pune', diverted: 1050, accuracy: 96, points: 1050, color: 'text-emerald-600 bg-emerald-50' },
  { rank: 4, grade: 'A++', name: 'Oakwood Society', city: 'Delhi', diverted: 980, accuracy: 95, points: 980, color: 'text-emerald-600 bg-emerald-50' },
  { rank: 5, grade: 'A+', name: 'Maple Heights', city: 'Chennai', diverted: 860, accuracy: 92, points: 860, color: 'text-green-600 bg-green-50' },
  { rank: 6, grade: 'A+', name: 'River View Complex', city: 'Hyderabad', diverted: 820, accuracy: 90, points: 820, color: 'text-green-600 bg-green-50' },
  { rank: 7, grade: 'A+', name: 'Tech Park Residency', city: 'Bangalore', diverted: 780, accuracy: 88, points: 780, color: 'text-green-600 bg-green-50' },
  { rank: 8, grade: 'A', name: 'Blue Ridge Apts', city: 'Mumbai', diverted: 640, accuracy: 85, points: 640, color: 'text-lime-600 bg-lime-50' },
  { rank: 9, grade: 'A', name: 'Harmony Enclave', city: 'Pune', diverted: 580, accuracy: 82, points: 580, color: 'text-lime-600 bg-lime-50' },
  { rank: 10, grade: 'B+', name: 'Urban Nest Society', city: 'Delhi', diverted: 420, accuracy: 78, points: 420, color: 'text-yellow-600 bg-yellow-50' },
];

const LeaderboardPage = () => {
  const [filterCity, setFilterCity] = useState('All Cities');
  const [filterType, setFilterType] = useState('All Waste');
  const [filterTime, setFilterTime] = useState('This Month');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSocieties = societies.filter(soc => {
    const matchCity = filterCity === 'All Cities' || soc.city === filterCity;
    const matchSearch = soc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCity && matchSearch;
  });

  const top3 = societies.slice(0, 3);

  const PodiumCard = ({ society, rank, height }) => (
    <div className={`relative flex flex-col items-center group animate-in slide-in-from-bottom-${rank * 4} duration-1000`}>
      <div className="relative mb-4">
         <div className={`w-20 h-20 rounded-full border-4 shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${
           society.isChampion ? 'border-yellow-400' : 'border-white'
         }`}>
            <Building2 className={`w-10 h-10 ${society.isChampion ? 'text-yellow-600' : 'text-primary/40'}`} />
         </div>
         <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-md ${
           rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : 'bg-orange-600'
         }`}>
           {rank}
         </div>
         {rank === 1 && <Trophy className="absolute -top-7 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-500 drop-shadow-md animate-bounce" />}
      </div>
      
      <div className={`w-full max-w-[170px] bg-white rounded-t-2xl shadow-xl border-x border-t border-gray-100 flex flex-col items-center p-4 transition-all hover:-translate-y-1 ${height}`}>
         {society.isChampion && (
           <div className="absolute -top-3 px-3 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded-full shadow-sm flex items-center gap-1 leading-none uppercase tracking-tighter">
             <Trophy className="w-2.5 h-2.5" />
             City Champion
           </div>
         )}
         <h3 className="font-bold text-neutral-dark text-center text-sm truncate w-full mt-2">{society.name}</h3>
         <span className="text-xs text-neutral-gray mb-3">{society.city}</span>
         
         <div className="mt-auto w-full">
            <div className={`text-center py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider ${society.color}`}>
              Rank {society.grade}
            </div>
            <div className="text-center mt-2">
              <span className="block text-primary font-bold text-lg leading-none">{society.points.toLocaleString()}</span>
              <span className="text-[10px] text-neutral-gray uppercase tracking-tighter">Eco Points</span>
            </div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-neutral-gray hover:text-primary transition-colors font-medium mb-12"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-16 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full font-bold text-xs mb-6 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            Updated Daily
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-dark mb-4 tracking-tight">
            City Leaderboard 🏆
          </h1>
          <p className="text-neutral-gray max-w-2xl mx-auto mb-4">
            Celebrating the most committed residential communities turning urban waste into valuable resources.
          </p>
          <div className="text-xs text-neutral-gray font-medium">
            Last updated: Today at 6:00 AM • <span className="text-primary/70">Refreshes every 24 hours</span>
          </div>
        </div>

        {/* Podium */}
        <div className="flex justify-center items-end gap-2 md:gap-6 mb-12 px-4">
          {/* 2nd Place */}
          <PodiumCard society={top3[1]} rank={2} height="h-48" />
          {/* 1st Place */}
          <PodiumCard society={top3[0]} rank={1} height="h-64" />
          {/* 3rd Place */}
          <PodiumCard society={top3[2]} rank={3} height="h-40" />
        </div>

        {/* Info Box Top */}
        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 mb-8 mx-auto xl:max-w-7xl">
           <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                 <Filter className="w-5 h-5 text-primary" />
              </div>
              <div>
                 <h4 className="font-bold text-primary-dark mb-1">Rank Determination System</h4>
                 <p className="text-sm text-neutral-gray leading-relaxed">
                   Eco Points determine your rank — multiple societies can achieve A++. At the end of each year, the highest-scoring society receives the exclusive City Champion Certification. Rankings refresh every 24 hours.
                 </p>
              </div>
           </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative group flex-1 md:flex-none min-w-[140px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-gray" />
              <select value={filterCity} onChange={e => setFilterCity(e.target.value)} className="pl-9 pr-8 py-2.5 w-full bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer">
                {['All Cities', 'Bangalore', 'Mumbai', 'Pune', 'Delhi', 'Chennai', 'Hyderabad'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            
            <div className="relative group flex-1 md:flex-none min-w-[140px]">
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-4 pr-8 py-2.5 w-full bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer">
                {['All Waste', 'Plastic Only', 'Organic Waste', 'Dry Mixed'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div className="relative group flex-1 md:flex-none min-w-[140px]">
              <select value={filterTime} onChange={e => setFilterTime(e.target.value)} className="px-4 pr-8 py-2.5 w-full bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer">
                {['This Week', 'This Month', 'All Time'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-gray" />
             <input 
               type="text" 
               placeholder="Search society..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="pl-9 pr-4 py-2.5 w-full bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
             />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-gray uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-gray uppercase tracking-wider">Society Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-gray uppercase tracking-wider">City</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-gray uppercase tracking-wider">Diverted (kg)</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-gray uppercase tracking-wider">Accuracy</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-gray uppercase tracking-wider text-center">Grade</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-gray uppercase tracking-wider text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredSocieties.length > 0 ? filteredSocieties.map((society, idx) => (
                  <tr key={society.rank} className={`hover:bg-primary/5 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-primary/5/30'}`}>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold ${
                        society.rank <= 3 ? 'text-primary' : 'text-neutral-gray'
                      }`}>
                        #{society.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-neutral-dark">{society.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-gray">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {society.city}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-neutral-dark">{society.diverted.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                           <div className="h-full bg-primary" style={{ width: `${society.accuracy}%` }} />
                        </div>
                        <span className="text-sm font-bold text-primary">{society.accuracy}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${society.color}`}>
                        {society.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-bold text-primary">
                        {society.points.toLocaleString()}
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-neutral-gray bg-white">
                      No societies found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* City Champion Section */}
        <div className="mt-12 mb-16 px-4">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-neutral-dark tracking-tight">City Champion 2026</h2>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl border border-yellow-100 p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Trophy className="w-48 h-48 text-yellow-600" />
            </div>
            
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-yellow-400/20 flex items-center justify-center border-4 border-yellow-400 shadow-md">
                <Building2 className="w-12 h-12 text-yellow-600" />
              </div>
              <div className="absolute -bottom-2 translate-x-1/2 right-1/2 whitespace-nowrap px-4 py-1 bg-yellow-500 text-white text-[10px] font-black rounded-full shadow-sm uppercase tracking-widest border-2 border-white">
                City No. 1
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h3 className="text-2xl font-black text-neutral-dark">Raghuma Hostel</h3>
                <span className="px-3 py-1 bg-yellow-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-sm">
                  Certified City Champion · 2026
                </span>
              </div>
              <p className="text-neutral-gray text-sm mb-4 font-medium">Bangalore • 1,340 Eco Points</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                 <div className="flex items-center gap-2 text-xs font-bold text-yellow-700 bg-yellow-100/50 px-3 py-1.5 rounded-lg border border-yellow-200">
                   <div className="w-2 h-2 rounded-full bg-yellow-500" />
                   Certificate issued on 31st December 2026
                 </div>
              </div>
            </div>
            
            <button className="px-8 py-3 bg-white border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all shadow-sm flex items-center gap-2 group">
              View Certificate
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between bg-white px-4 py-8 border-t border-gray-100 rounded-b-2xl">
          <button className="flex items-center gap-1 text-sm font-bold text-neutral-gray hover:text-primary transition-colors disabled:opacity-30" disabled>
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <div className="flex items-center gap-2">
             <button className="w-8 h-8 rounded-lg bg-primary text-white font-bold text-sm">1</button>
             <button className="w-8 h-8 rounded-lg hover:bg-gray-100 text-neutral-gray font-bold text-sm transition-colors">2</button>
             <button className="w-8 h-8 rounded-lg hover:bg-gray-100 text-neutral-gray font-bold text-sm transition-colors">3</button>
             <span className="px-2 text-neutral-gray">...</span>
             <button className="w-8 h-8 rounded-lg hover:bg-gray-100 text-neutral-gray font-bold text-sm transition-colors">12</button>
          </div>

          <button className="flex items-center gap-1 text-sm font-bold text-neutral-gray hover:text-primary transition-colors">
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LeaderboardPage;
