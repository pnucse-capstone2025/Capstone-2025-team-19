// pages/index.tsx
import Head from 'next/head';
import Header from '@/components/HomeHeader';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Demo from '@/components/Demo';
import FAQ from '@/components/FAQ';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

export default function Home() {// components/Footer.tsx

  return (
    <>
      <Head>
        <title>SPEAK NOTE - 말에 집중하세요, 기록은 AI가!</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
        <link rel="icon" href="/speaknoteLogo.png" />
      </Head>

      <main className="bg-gray-50 text-slate-800">
        <Header />
        <Hero />
        <Features />
        <HowItWorks />
        <Demo />
        <FAQ />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}