import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import Leaderboard from '../components/Leaderboard';
import JourneyFeed from '../components/JourneyFeed';
import ImpactStats from '../components/ImpactStats';
import HowItWorks from '../components/HowItWorks';
import WhoIsItFor from '../components/WhoIsItFor';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <section id="home">
          <Hero />
        </section>
        <section id="leaderboard">
          <Leaderboard />
        </section>
        <section id="feed">
          <JourneyFeed />
        </section>
        <section id="impact">
          <ImpactStats />
        </section>
        <HowItWorks />
        <WhoIsItFor />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
