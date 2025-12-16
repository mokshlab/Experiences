import Link from "next/link"
import { FiPenTool, FiTrendingUp, FiLock, FiCheck, FiHeart, FiLink2, FiSmile, FiShield, FiZap, FiUsers, FiAward } from 'react-icons/fi'

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Premium Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-zinc-950/80 border-b border-gray-200 dark:border-zinc-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:scale-105 transition-transform">
            Experiences🧩
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/explore"
              className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Explore
            </Link>
            <Link 
              href="/auth/signin"
              className="px-6 py-2 rounded-full text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signup"
              className="px-6 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Premium Design */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-zinc-900 dark:via-purple-950/30 dark:to-zinc-900">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        
        <div className="relative container mx-auto px-6 py-20 md:py-28">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            {/* Hero Headline - Apple-style minimalism */}
            <h1 className="text-6xl md:text-8xl font-bold leading-[1.1] mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Life's moments.
              </span>
              <br />
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Beautifully
              </span>
              {" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent italic">
                remembered.
              </span>
            </h1>
            
            <p className="max-w-2xl text-2xl font-light text-gray-600 dark:text-gray-400 mb-12 leading-relaxed">
              The most elegant way to capture, connect, and reflect on what matters most.
            </p>

            {/* CTA Buttons - Premium styling */}
            <div className="flex flex-col sm:flex-row gap-5 mb-10">
              <Link 
                href="/auth/signup"
                className="group relative flex h-16 items-center justify-center rounded-full bg-black dark:bg-white px-12 text-base font-medium text-white dark:text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Start for free</span>
              </Link>
              <Link 
                href="/explore"
                className="flex h-16 items-center justify-center rounded-full border border-gray-300 dark:border-zinc-700 bg-transparent px-12 text-base font-medium text-gray-900 dark:text-white transition-all hover:bg-gray-50 dark:hover:bg-zinc-900 active:scale-[0.98]"
              >
                <span>Explore experiences</span>
              </Link>
            </div>

            {/* Minimal trust line */}
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
              Always free. Fully private. No credit card required.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section - Bento Grid Style */}
      <div className="container mx-auto px-6 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-5 tracking-tight">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Designed for depth.
              </span>
            </h2>
            <p className="text-xl font-light text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Every feature serves meaningful reflection and personal growth.
            </p>
          </div>
          
          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <FeatureCard 
              icon={<FiPenTool />}
              title="Expressive capture"
              description="Choose from 16 life categories and 23 emotional states. Add location, tags, and reflections that matter."
              features={["16 life categories", "23 emotional states", "Tags, location, and context"]}
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard 
              icon={<FiTrendingUp />}
              title="Visual storytelling"
              description="Interactive timeline river brings your memories to life. Discover patterns and insights as your journey unfolds."
              features={["Interactive charts and timelines", "Category and mood patterns", "Streak and activity tracking"]}
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard 
              icon={<FiLock />}
              title="Privacy by design"
              description="Default private. Share selectively. Delete permanently. Your memories belong only to you."
              features={["Private by default", "Public/private per experience", "Full account deletion"]}
              gradient="from-green-500 to-emerald-500"
            />
          </div>

          {/* Mini Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <MiniFeature 
              icon={<FiLink2 />} 
              label="Interconnected" 
              description="Link memories to reveal hidden relationships"
              gradient="from-blue-500 to-cyan-500"
            />
            <MiniFeature 
              icon={<FiSmile />} 
              label="Emotionally aware" 
              description="23 moods capture your full spectrum"
              gradient="from-rose-500 to-pink-500"
            />
            <MiniFeature 
              icon={<FiZap />} 
              label="Forever free" 
              description="No tiers. No limits. No catches."
              gradient="from-amber-500 to-yellow-500"
            />
            <MiniFeature 
              icon={<FiShield />} 
              label="Uncompromising" 
              description="Your data stays yours, always"
              gradient="from-green-500 to-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* How It Works - Modern Timeline */}
      <div className="bg-gradient-to-br from-gray-50 to-purple-50 dark:from-zinc-900 dark:to-purple-950/20 py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-center mb-5 tracking-tight">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Simple to start.
              </span>
            </h2>
            <p className="text-xl font-light text-gray-600 dark:text-gray-400 text-center mb-20">
              Your first memory in under 60 seconds.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connection Line */}
              <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600"></div>
              
              <StepCard 
                number="1"
                title="Sign up"
                description="Email only. 30 seconds. Zero friction."
                icon={<FiUsers />}
              />
              <StepCard 
                number="2"
                title="Capture"
                description="Write what happened. Choose how you felt. Add meaningful context."
                icon={<FiPenTool />}
              />
              <StepCard 
                number="3"
                title="Reflect"
                description="Watch patterns emerge. Connect the dots. Understand your story."
                icon={<FiTrendingUp />}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial/Social Proof */}
      <div className="container mx-auto px-6 py-32">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-16 md:p-20 shadow-2xl text-center text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32"></div>
            
            <div className="relative">
              <blockquote className="text-3xl md:text-4xl font-light mb-8 leading-relaxed italic">
                "Your experiences deserve more than a scroll-past. Capture them with intention."
              </blockquote>
              <p className="text-lg text-purple-100 font-light">
                Built for people who believe their stories matter.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="container mx-auto px-6 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Begin your story.
            </span>
          </h2>
          <p className="text-2xl font-light text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            The memories you capture today become the insights you treasure tomorrow.
          </p>
          <Link 
            href="/auth/signup"
            className="inline-flex h-16 items-center justify-center rounded-full bg-black dark:bg-white px-12 text-base font-medium text-white dark:text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Get started</span>
          </Link>
          <p className="mt-6 text-sm font-light text-gray-500 dark:text-gray-400">
            Free to use. Private by default.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="inline-block text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                Experiences🧩
              </Link>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-sm">
                Your visual memory book. Capture, connect, and reflect on life's most meaningful moments.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/explore" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Explore</Link></li>
                <li><Link href="/auth/signup" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Get Started</Link></li>
                <li><Link href="/auth/signin" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Sign In</Link></li>
              </ul>
            </div>
            
            {/* About */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">About</h3>
              <ul className="space-y-2 text-sm">
                <li><span className="text-gray-600 dark:text-gray-400">Open-source project</span></li>
                <li><span className="text-gray-600 dark:text-gray-400">Built with Next.js & Express</span></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
            <p>© {new Date().getFullYear()} Experiences. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <FiHeart className="w-4 h-4 text-red-500" />
                Made with care
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, features, gradient }) {
  return (
    <div className="group relative rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Gradient accent on hover */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
      
      <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${gradient} text-white text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
        {description}
      </p>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradient}`}></div>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MiniFeature({ icon, label, description, gradient }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
      {/* Gradient background on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
      
      <div className="relative">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xl shadow-md group-hover:scale-110 transition-transform mb-4`}>
          {icon}
        </div>
        <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">{label}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  )
}

function StepCard({ number, title, description, icon }) {
  return (
    <div className="relative text-center">
      <div className="relative mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl mb-6 z-10">
        {number}
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-lg transition-all">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}
