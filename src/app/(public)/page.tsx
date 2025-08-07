// src/app/(public)/page.tsx

import Footer from '../../components/Footer'
import Navbar from '@/components/Navbar'

export default function HomePage() {
  return (
    <>

      {/* Hero Section */}
      <section className="w-full px-6 py-20 text-center bg-gray-50">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Build Your AI-Powered Startup with Ease
        </h1>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          StartupHQ AI helps founders turn ideas into reality with tools like Lean Canvas, Pitch Deck, and Validation — all in one place.
        </p>
        <a
          href="/dashboard"
          className="inline-block bg-primary text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-primary/80 transition"
        >
          Get Started for Free
        </a>
      </section>

      {/* Features Section */}
      <section className="w-full px-6 py-16 bg-white text-center">
        <h2 className="text-3xl font-semibold mb-10">What You Can Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div>
            <h3 className="text-xl font-bold mb-2">🧠 Idea Generator</h3>
            <p className="text-gray-600">Turn a prompt into a solid startup idea with AI-powered generation.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">📋 Lean Canvas</h3>
            <p className="text-gray-600">Visualize your business model with a simple, editable canvas layout.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">📊 Pitch Deck</h3>
            <p className="text-gray-600">Create professional pitch decks that investors love — instantly.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full px-6 py-16 bg-gray-50 text-center">
        <h2 className="text-3xl font-semibold mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div>
            <h4 className="text-lg font-bold mb-1">Step 1</h4>
            <p className="text-gray-600">Describe your idea or just enter a category. We'll do the rest.</p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-1">Step 2</h4>
            <p className="text-gray-600">Use Lean Canvas or Pitch Deck tools to plan and refine your vision.</p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-1">Step 3</h4>
            <p className="text-gray-600">Validate your idea with real data and export investor-ready decks.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full px-6 py-16 bg-primary text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Build Your Startup?</h2>
        <p className="mb-6 text-lg">Start using StartupHQ AI for free — no credit card required.</p>
        <a
          href="/dashboard"
          className="inline-block bg-white text-primary font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition"
        >
          Go to Dashboard
        </a>
      </section>

    </>
  )
}
