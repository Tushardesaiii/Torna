import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, X, Sun, Moon, ArrowRight, BookOpen, PenTool, FileText, Clock, Users, Search, Target, LayoutGrid, Goal, Tag, BrainCircuit, Quote } from 'lucide-react'; // Using lucide-react for icons, added Quote



// Custom hook for scroll-based animations using Intersection Observer
const useScrollAnimation = (threshold = 0.1) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Memoized callback function for Intersection Observer
  const callback = useCallback((entries) => {
    entries.forEach((entry) => {
      // If the element is intersecting (visible), set isVisible to true
      // and stop observing to prevent re-triggering the animation.
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (ref.current) {
          observer.current.unobserve(ref.current);
        }
      }
    });
  }, []); // Empty dependency array ensures callback is stable

  const observer = useRef(null);

  useEffect(() => {
    // Initialize Intersection Observer when the component mounts and the ref is available
    if (ref.current) {
      observer.current = new IntersectionObserver(callback, { threshold });
      observer.current.observe(ref.current);
    }

    // Cleanup function: disconnect the observer when the component unmounts
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [ref, threshold, callback]); // Dependencies for useEffect

  return [ref, isVisible];
};

// Main App Component
const Landing = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Effect to apply dark mode class to the HTML element
  // This toggles the 'dark' class on the root <html> element, enabling Tailwind's dark mode.
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]); // Re-run effect when isDarkMode changes

  // Function to toggle dark mode state
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // Navbar Component
  

  // Hero Section Component
  const Hero = () => {
    // Use the custom scroll animation hook
    const [ref, isVisible] = useScrollAnimation(0.2); // Trigger when 20% of section is visible

    return (
      <section
        ref={ref} // Attach ref for observation
        className={`relative min-h-screen flex flex-col justify-center items-center text-center px-6 md:px-16 py-20 lg:py-24
          bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-950
          text-black dark:text-white transition-all duration-1000 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} // Apply animation classes
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-1/4 w-72 h-72 bg-gray-100 dark:bg-gray-900 rounded-full filter blur-3xl opacity-70 animate-blob-bounce-1"></div>
          <div className="absolute bottom-1/5 -right-1/4 w-64 h-64 bg-gray-100 dark:bg-gray-900 rounded-full filter blur-3xl opacity-50 animate-blob-bounce-2"></div>
          <div className="absolute top-1/2 left-1/3 w-56 h-56 bg-gray-200 dark:bg-gray-800 rounded-full filter blur-3xl opacity-60 animate-blob-bounce-3"></div>
        </div>

        <h1 className={`font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-tight tracking-tighter max-w-5xl mx-auto mb-8 font-outfit relative z-10
          transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: '0.1s' }} // Staggered animation delay
        >
          The writing space <br className="hidden sm:inline" /> you’ve been waiting for.
        </h1>
        <p className={`text-md sm:text-lg md:text-xl font-light max-w-3xl mx-auto mb-10 opacity-90 relative z-10
          transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: '0.3s' }} // Staggered animation delay
        >
          From first idea to final publication, Torna empowers every type of writer with the tools they need to create, organize, and publish their best work.
        </p>
        <a
          href="#"
          className={`px-8 py-4 bg-black dark:bg-white text-white dark:text-black text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl dark:hover:shadow-gray-700 transition-all duration-300 transform hover:scale-105 relative z-10
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: '0.5s' }} // Staggered animation delay
        >
          Start Writing for Free
          <ArrowRight className="inline-block ml-2 -mr-1" size={20} />
        </a>
        <div className="absolute inset-0 z-0 opacity-10 dark:opacity-5">
          {/* Subtle grid pattern for texture */}
          <div className="absolute inset-0 bg-[length:30px_30px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, var(--grid-color) 0, var(--grid-color) 1px, transparent 1px, transparent 30px), repeating-linear-gradient(90deg, var(--grid-color) 0, var(--grid-color) 1px, transparent 1px, transparent 30px)' }}
          ></div>
          {/* Inline style for CSS variables based on theme */}
          <style jsx>{`
            .bg-\\[length\\:30px_30px\\][style] {
              --grid-color: theme('colors.gray.200'); /* Default for light mode */
            }
            .dark .bg-\\[length\\:30px_30px\\][style] {
              --grid-color: theme('colors.gray.800'); /* For dark mode */
            }
          `}</style>
        </div>
      </section>
    );
  };

  // Demo Video Section Component
  const DemoVideo = () => {
    const [ref, isVisible] = useScrollAnimation(0.1); // Trigger when 10% of section is visible
    return (
      <section
        ref={ref}
        className={`py-24 px-6 md:px-16 bg-gray-50 dark:bg-gray-950 text-black dark:text-white transition-all duration-1000 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="max-w-6xl mx-auto text-center"> {/* Slightly reduced max-width */}
          <h2 className={`text-3xl md:text-5xl font-bold mb-16 font-outfit transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: '0.1s' }}>
            See Torna in Action
          </h2>
          <div className={`relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl dark:shadow-gray-800 border-2 border-gray-300 dark:border-gray-700
            transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            style={{ transitionDelay: '0.3s' }}
          >
            {/* Minimalist Browser Mockup */}
            <div className="absolute top-0 left-0 right-0 h-7 bg-gray-200 dark:bg-gray-800 rounded-t-2xl flex items-center px-3 space-x-1"> {/* Reduced height and spacing */}
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              <div className="flex-grow bg-gray-100 dark:bg-gray-700 rounded-full h-4 flex items-center px-2 text-xs text-gray-600 dark:text-gray-400 opacity-80">
                torna.com/demo
              </div>
            </div>
            {/* Video Player - placeholder using YouTube video */}
            <iframe
              className="absolute top-7 left-0 w-full h-[calc(100%-28px)] z-0"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3"
              title="Torna Demo Video"
              frameBorder="0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <p className={`mt-12 text-lg font-light max-w-2xl mx-auto opacity-90 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
             style={{ transitionDelay: '0.5s' }}>
            A glimpse into the intuitive interface designed to keep you focused on what matters: your words.
          </p>
        </div>
      </section>
    );
  };

  // Features Section Component
  const Features = () => {
    const [ref, isVisible] = useScrollAnimation(0.1); // Trigger when 10% of section is visible
    const featureItems = [
      { name: "Project-based workspace", description: "Organize all your writing projects in one place.", icon: <LayoutGrid size={36} strokeWidth={1.5} /> },
      { name: "Markdown / Rich-Text Editor", description: "Write with simple, powerful formatting or full rich-text.", icon: <FileText size={36} strokeWidth={1.5} /> },
      { name: "Character & Plot Tools", description: "Outline intricate plots and develop compelling characters.", icon: <Users size={36} strokeWidth={1.5} /> },
      { name: "Writing Goal Tracker", description: "Set and achieve your writing milestones.", icon: <Goal size={36} strokeWidth={1.5} /> },
      { name: "Notes and Tagging", description: "Organize your insights, ideas, and research with ease.", icon: <Tag size={36} strokeWidth={1.5} /> },
      { name: "AI Assistant (planned)", description: "Get creative suggestions and streamline your workflow.", icon: <BrainCircuit size={36} strokeWidth={1.5} /> },
    ];

    return (
      <section id="features" ref={ref} className="py-24 px-6 md:px-16 bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-3xl md:text-5xl font-bold text-center mb-16 font-outfit transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: '0.1s' }}>
            Powerful Features, Simplified
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> {/* Reduced gap */}
            {featureItems.map((feature, index) => (
              <div
                key={index}
                className={`group p-6 border border-gray-100 dark:border-gray-900 rounded-xl hover:shadow-lg dark:hover:shadow-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300 transform hover:-translate-y-1
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${0.3 + index * 0.1}s` }} // Staggered animation for each feature card
              >
                <div className="text-gray-900 dark:text-gray-100 mb-4 group-hover:scale-110 transition-transform duration-200"> {/* Reduced mb */}
                  {feature.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-2 font-manrope">{feature.name}</h3> {/* Reduced font sizes */}
                <p className="text-md md:text-lg text-gray-700 dark:text-gray-300">{feature.description}</p> {/* Reduced font sizes */}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Target Users Section Component
  const TargetUsers = () => {
    const [ref, isVisible] = useScrollAnimation(0.1); // Trigger when 10% of section is visible
    const userTypes = [
      { label: "For Novelists", description: "Craft intricate plots and compelling characters." },
      { label: "For Bloggers", description: "Publish engaging content with ease." },
      { label: "For Screenwriters", description: "Format scripts professionally." },
      { label: "For Academics & Researchers", description: "Organize citations and complex data." },
      { label: "For Journal Writers", description: "Capture thoughts and track daily progress." },
      { label: "For Journalists", description: "Draft articles quickly and efficiently." },
    ];

    return (
      <section id="users" ref={ref} className="py-24 px-6 md:px-16 bg-gray-50 dark:bg-gray-950 text-black dark:text-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className={`text-3xl md:text-5xl font-bold mb-16 font-outfit transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: '0.1s' }}>
            Torna is for Every Writer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"> {/* Reduced gaps */}
            {userTypes.map((type, index) => (
              <div
                key={index}
                className={`relative p-6 group cursor-default transition-all duration-300 hover:shadow-md dark:hover:shadow-gray-800 rounded-xl
                  ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                style={{ transitionDelay: `${0.3 + index * 0.1}s` }} // Staggered animation for each user type card
              >
                <h3 className="text-2xl md:text-3xl font-extrabold mb-3 font-outfit group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200">{type.label}</h3> {/* Reduced font size */}
                <p className="text-md md:text-lg text-gray-700 dark:text-gray-300 group-hover:text-black dark:hover:text-white transition-colors duration-200">{type.description}</p> {/* Reduced font size */}
                <span className="absolute inset-0 border-2 border-transparent rounded-xl group-hover:border-black dark:group-hover:border-white transition-all duration-300 pointer-events-none"></span> {/* Reduced border size */}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Testimonials Section Component (New)
  const Testimonials = () => {
    const [ref, isVisible] = useScrollAnimation(0.1);
    const testimonials = [
      {
        quote: "Torna has transformed my writing process. The clean interface and powerful tools keep me focused and productive.",
        author: "Alex P., Novelist",
      },
      {
        quote: "As a blogger, I need flexibility. Torna's Markdown editor and export options are exactly what I was looking for.",
        author: "Jamie L., Blogger",
      },
      {
        quote: "Finally, a platform that truly understands writers! From outlining to final draft, Torna is indispensable.",
        author: "Chris R., Screenwriter",
      },
    ];

    return (
      <section ref={ref} className="py-24 px-6 md:px-16 bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className={`text-3xl md:text-5xl font-bold mb-16 font-outfit transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: '0.1s' }}>
            What Writers Are Saying
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`p-8 border border-gray-100 dark:border-gray-900 rounded-xl shadow-sm dark:shadow-gray-800 flex flex-col items-center justify-center
                  ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                style={{ transitionDelay: `${0.3 + index * 0.15}s` }}
              >
                <Quote size={32} className="text-gray-400 dark:text-gray-600 mb-4" />
                <p className="text-lg italic mb-4 text-gray-800 dark:text-gray-200">"{testimonial.quote}"</p>
                <p className="text-md font-semibold text-gray-700 dark:text-gray-300">- {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };


  // Pricing Section Component
  const Pricing = () => {
    const [ref, isVisible] = useScrollAnimation(0.1); // Trigger when 10% of section is visible
    const tiers = [
      {
        name: "Free",
        price: "$0",
        period: "/month",
        description: "Perfect for casual writers and getting started.",
        features: [
          "Basic Markdown editor",
          "Limited storage (1 project, 5 documents)", // Updated based on provided info
          "Standard export options",
          "Community support",
        ],
        cta: "Get Started Free",
        isPrimary: false,
      },
      {
        name: "Pro",
        price: "$12", // Updated to $12 to reflect approx 399 INR / month
        period: "/month",
        description: "Unlock the full power of Torna for professional work.",
        features: [
          "Advanced Markdown editor",
          "Unlimited storage",
          "Premium export options (PDF, EPUB, DOCX)",
          "Plotting and outlining tools",
          "Version history & backups",
          "Priority support",
          "Collaborative features",
          "AI Assistant access", // Added AI Assistant
        ],
        cta: "Go Pro",
        isPrimary: true,
      },
    ];

    return (
      <section id="pricing" ref={ref} className="py-24 px-6 md:px-16 bg-gray-50 dark:bg-gray-950 text-black dark:text-white transition-colors duration-300">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className={`text-3xl md:text-5xl font-bold mb-16 font-outfit transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: '0.1s' }}>
            Simple Pricing, Powerful Tools
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> {/* Reduced gap */}
            {tiers.map((tier, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl border-2 transition-all duration-500 ease-out ${ // Reduced padding and border radius
                  tier.isPrimary
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-xl dark:shadow-gray-700 transform scale-100 lg:scale-105' // Retain scale-100 on small screens, scale-105 on large
                    : 'bg-white dark:bg-black text-black dark:text-white border-gray-100 dark:border-gray-900 hover:shadow-lg dark:hover:shadow-gray-800'
                } hover:transform hover:scale-[1.02] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${0.3 + index * 0.15}s` }} // Staggered animation for pricing cards
              >
                <h3 className="text-2xl md:text-3xl font-bold mb-4 font-outfit">{tier.name}</h3> {/* Reduced font size */}
                <p className="text-5xl font-extrabold mb-3 font-outfit"> {/* Reduced font size */}
                  {tier.price}<span className="text-2xl font-normal">{tier.period}</span>
                </p>
                <p className={`text-md mb-8 ${tier.isPrimary ? 'opacity-80' : 'text-gray-700 dark:text-gray-300'}`}> {/* Reduced font size */}
                  {tier.description}
                </p>
                <ul className="text-left mb-10 space-y-3"> {/* Reduced mb and space-y */}
                  {tier.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center text-md md:text-lg"> {/* Reduced font size */}
                      <span className="mr-3 text-lg">&#10003;</span> {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-4 rounded-full text-lg font-semibold shadow-md transition-all duration-300 ${ // Reduced padding and font size
                    tier.isPrimary
                      ? 'bg-white text-black dark:bg-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
                      : 'bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                  } hover:shadow-lg`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Call to Action Section (New)
  const CallToAction = () => {
    const [ref, isVisible] = useScrollAnimation(0.1);
    return (
      <section ref={ref} className="py-24 px-6 md:px-16 bg-gray-950 dark:bg-black text-white dark:text-white transition-colors duration-300">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-3xl md:text-5xl font-bold mb-8 font-outfit transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: '0.1s' }}>
            Ready to Write Your World?
          </h2>
          <p className={`text-lg md:text-xl font-light mb-12 opacity-90 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
             style={{ transitionDelay: '0.3s' }}>
            Join thousands of writers who are building their next masterpiece with Torna.
          </p>
          <a
            href="#"
            className={`inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 text-black dark:text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl dark:hover:shadow-gray-700 transition-all duration-300 transform hover:scale-105
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ transitionDelay: '0.5s' }}
          >
            Start Your Free Trial
            <ArrowRight className="inline-block ml-3 -mr-1" size={20} />
          </a>
        </div>
      </section>
    );
  };

  // Footer Section Component
  const Footer = () => {
    return (
      <footer className="py-12 px-6 md:px-16 bg-gray-50 dark:bg-gray-950 text-black dark:text-white transition-colors duration-300"> {/* Reduced padding */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm"> {/* Reduced font size */}
          <div className="mb-4 md:mb-0 text-center md:text-left"> {/* Reduced mb */}
            <p className="font-semibold text-lg mb-1 font-outfit">Torna</p> {/* Reduced font size */}
            <p className="text-gray-600 dark:text-gray-400">&copy; {new Date().getFullYear()} Torna Inc. All rights reserved.</p>
          </div>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6"> {/* Reduced space */}
            <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">Terms of Service</a>
            <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">Contact Us</a>
          </div>
        </div>
      </footer>
    );
  };

  return (
    <div className="font-sans antialiased">
      {/* Font Imports from Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Outfit:wght@100..900&family=Lexend:wght@300..700&display=swap" rel="stylesheet" />
      <style>
        {`
        /* Global font definitions */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .font-manrope { font-family: 'Manrope', sans-serif; }
        .font-outfit { font-family: 'Outfit', sans-serif; } /* Used for logo and main headings */
        .font-lexend { font-family: 'Lexend', sans-serif; } /* Optionally for specific elements */

        /* Dark mode background for the entire document */
        .dark body { background-color: #111827; } /* Use specific dark background from provided hex */
        html.dark { background-color: #111827; }

        /* Light mode background for the entire document */
        body { background-color: #F9FAFB; } /* Use specific light background from provided hex */
        html { background-color: #F9FAFB; }


        /* General smooth transitions for all elements for dark/light mode and hover effects */
        * {
          transition: background-color 0.3s ease, color 0.3s ease, transform 0.3s ease, opacity 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }

        /* Basic fade-in and slide-up animations for content */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); } /* Slightly reduced translation */
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.7s ease-out forwards; /* Slightly faster animation */
        }
        .animate-fade-in-up {
          animation: fadeIn 0.7s ease-out forwards;
        }
        .delay-200 { animation-delay: 0.2s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-600 { animation-delay: 0.6s; } /* Added more delay options */
        .delay-800 { animation-delay: 0.8s; }

        /* Styles for the subtle grid background pattern in Hero section */
        .bg-\\[length\\:30px_30px\\][style] {
          --grid-color: theme('colors.gray.200'); /* Default for light mode */
        }
        .dark .bg-\\[length\\:30px_30px\\][style] {
          --grid-color: theme('colors.gray.800'); /* For dark mode */
        }

        /* Keyframes for blob bounce animation */
        @keyframes blobBounce1 {
          0%, 100% { transform: translate(0, 0); }
          30% { transform: translate(20px, -30px) scale(1.05); }
          60% { transform: translate(-10px, 15px) scale(0.95); }
        }

        @keyframes blobBounce2 {
          0%, 100% { transform: translate(0, 0); }
          40% { transform: translate(-25px, 15px) scale(0.98); }
          70% { transform: translate(10px, -20px) scale(1.02); }
        }

        @keyframes blobBounce3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(15px, 25px) scale(1.03); }
          80% { transform: translate(-5px, -10px) scale(0.97); }
        }

        .animate-blob-bounce-1 { animation: blobBounce1 12s ease-in-out infinite; }
        .animate-blob-bounce-2 { animation: blobBounce2 10s ease-in-out infinite reverse; }
        .animate-blob-bounce-3 { animation: blobBounce3 14s ease-in-out infinite; }
        `}
      </style>

         <Hero />
      <DemoVideo />
      <Features />
      <TargetUsers />
      <Testimonials /> {/* New Testimonials Section */}
      <Pricing />
      <CallToAction /> {/* New Call to Action Section */}
      <Footer />
      
    </div>
  );
};

export default Landing;
