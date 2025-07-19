import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  Home, 
  Navigation as NavigationIcon, 
  Package, 
  Plane, 
  AlertCircle, 
  Calendar, 
  Palette,
  ArrowRight,
  Star,
  Sparkles,
  Target,
  Shield,
  Brain,
  Compass,
  Wind,
  Cloud,
  TowerControl,
  Coffee,
  ShoppingCart,
  Server,
  Activity,
  BookOpen,
  Settings,
  ChevronDown,
  Quote,
  Check,
  X,
  Users,
  TrendingUp
} from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import NavAirLogo from '../assets/NavAir.jpg';
import Footer from '../components/Footer';

// --- MOCK COMPONENTS & UTILS ---

/**
 * Displays the authenticated user's name.
 * In a real application, this would use an authentication context.
 * @returns {React.ReactElement} The user's name or "Guest".
 */
const UsernameDisplay = () => {
    return <>Anonymous User</>;
};

/**
 * A hook to create a smooth, animated counter from 0 to a target value.
 * @param {number} value - The target value to count up to.
 * @returns {{ ref: React.RefObject, count: number }} - A ref to attach to the element and the animated count.
 */
const useAnimatedCounter = (value) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            const controls = {
                stop: () => {}
            };
            const animate = (start, end, duration) => {
                let startTimestamp = null;
                const step = (timestamp) => {
                    if (!startTimestamp) startTimestamp = timestamp;
                    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                    const current = progress * (end - start) + start;
                    setCount(parseFloat(current.toFixed(1)));
                    if (progress < 1) {
                        controls.stop = requestAnimationFrame(step);
            }
        };
                controls.stop = requestAnimationFrame(step);
            };
            animate(0, value, 1500);
            return () => cancelAnimationFrame(controls.stop);
        }
    }, [isInView, value]);

    return { ref, count };
};


// --- UI COMPONENTS ---

/**
 * The main header for the application dashboard.
 * @returns {React.ReactElement} The application header.
 */
const Header = () => (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-2">
                    <img src={NavAirLogo} alt="NavAir" className="w-12 h-12 object-cover" />
                    <span className="text-xl font-bold text-gray-800">NavAir</span>
                </div>
                <div className="flex items-center space-x-2">
                    <a href="/register" className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
                        Register
                    </a>
                    <a href="/login" className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        Sign In
                    </a>
                </div>
            </div>
        </div>
    </header>
);

/**
 * The primary hero dashboard component.
 * @param {{ currentTime: Date; flightProgress: number; }} props
 * @returns {React.ReactElement} The hero dashboard.
 */
const HeroDashboard = ({ currentTime, flightProgress }) => {
    const { user, isAuthenticated } = useAuth();
    const journeySteps = [
      { icon: Shield, title: "Security", time: "Est. 8 min", status: "completed" },
      { icon: Coffee, title: "Get Coffee", time: "Near Gate A5", status: "current" },
      { icon: ShoppingCart, title: "Duty-Free", time: "Find gifts", status: "upcoming" },
      { icon: Plane, title: "Boarding", time: "Starts 14:00", status: "upcoming" },
    ];

    return (
        <div
            className="relative overflow-hidden rounded-3xl p-4 sm:p-6 text-white shadow-2xl"
            style={{ background: "linear-gradient(135deg, #232946 0%, #121420 100%)" }}
        >
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg"><Sparkles className="w-8 h-8 text-cyan-300" /></div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold">Hello, <span className="text-cyan-300">{isAuthenticated && user ? (user.name || user.username || user.email) : 'Anonymous User'}</span></h2>
                            <p className="text-blue-200 text-sm">Your AI travel assistant is ready.</p>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0 text-center sm:text-right bg-white/5 p-2 rounded-lg">
                        <div className="text-2xl font-bold tracking-wider">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-xs text-blue-300">{currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                    </div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl mb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <div className="flex items-center space-x-4"><Plane className="w-8 h-8 text-white" />
                            <div>
                                <p className="text-sm text-blue-200">Flight UA123 to SFO</p>
                                <p className="text-lg font-bold">On Time</p>
                            </div>
                        </div>
                        <div className="w-full sm:w-1/2 mt-4 sm:mt-0">
                            <div className="flex justify-between items-center text-xs text-blue-200 mb-1"><span>Gate B12</span><span>Boarding at 14:00</span></div>
                            <div className="w-full bg-white/10 rounded-full h-2"><motion.div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500" initial={{ width: 0 }} animate={{ width: `${flightProgress}%` }} transition={{ duration: 0.5, ease: "linear" }}></motion.div></div>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-semibold mb-2 text-blue-200">Your Journey at a Glance</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {journeySteps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div key={index} className={`p-3 rounded-lg text-center transition-all duration-300 ${step.status === 'completed' ? 'bg-green-500/20' : step.status === 'current' ? 'bg-cyan-400/30 animate-pulse-bright' : 'bg-white/5'}`}>
                                    <Icon className={`w-6 h-6 mx-auto mb-1 ${step.status === 'completed' ? 'text-green-300' : step.status === 'current' ? 'text-cyan-300' : 'text-blue-300'}`} />
                                    <p className="text-xs font-semibold">{step.title}</p>
                                    <p className="text-[10px] text-blue-300">{step.time}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Displays key operational metrics with animated counters and progress bars.
 * @returns {React.ReactElement} The key metrics dashboard.
 */
const KeyMetrics = () => {
    const keyMetrics = [
      { icon: Users, title: 'Passenger Flow', value: 1280, unit: '/hr', trend: '+5%', positive: true, target: 1500 },
      { icon: Package, title: 'Baggage Efficiency', value: 99.2, unit: '%', trend: '+0.1%', positive: true, target: 99.5 },
      { icon: ShoppingCart, title: 'Retail Performance', value: 450, unit: 'k/hr', trend: '-2%', positive: false, target: 500 },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {keyMetrics.map((metric, index) => {
                const { ref, count } = useAnimatedCounter(metric.value);
                const Icon = metric.icon;
                const progress = (metric.value / metric.target) * 100;
                return (
                    <div key={index} ref={ref} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 transition-transform hover:scale-105">
                        <div className="flex items-center space-x-3 mb-2">
                            <Icon className="w-5 h-5 text-blue-500" />
                            <p className="text-sm font-semibold text-gray-600">{metric.title}</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{count}{metric.unit}</p>
                        <div className={`text-xs font-semibold flex items-center space-x-1 mb-2 ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                            <TrendingUp className={`w-4 h-4 ${!metric.positive && 'rotate-180'}`} />
                            <span>{metric.trend} vs target</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-blue-500" style={{width: `${progress}%`}}></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

/**
 * A grid of smart services offered by NavAir.
 * @returns {React.ReactElement} The services grid.
 */
const ServicesGrid = () => {
    const features = [
        { icon: NavigationIcon, title: 'Smart Navigation', link: '/navigation', gradient: 'from-emerald-400 to-cyan-600', badge: 'AI' },
        { icon: Package, title: 'Baggage Intelligence', link: '/baggage', gradient: 'from-orange-400 to-yellow-600', badge: 'LIVE' },
        { icon: Plane, title: 'Flight Insights', link: '/flights', gradient: 'from-purple-400 to-indigo-600', badge: 'PRO' },
        { icon: AlertCircle, title: 'Emergency Hub', link: '/emergency', gradient: 'from-red-400 to-pink-600', badge: 'SOS' },
        { icon: Calendar, title: 'Smart Booking', link: '/booking', gradient: 'from-blue-400 to-purple-600', badge: 'NEW' },
        { icon: Palette, title: 'Cultural Discovery', link: '/art', gradient: 'from-pink-400 to-purple-600', badge: 'AR' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((feature) => {
                const Icon = feature.icon;
                return (
                    <motion.a key={feature.link} href={feature.link} className="group relative block" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <div className="relative overflow-hidden bg-white rounded-2xl p-4 shadow-sm border border-gray-200 h-full">
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}><Icon className="w-6 h-6 text-white" /></div>
                                    <div className={`px-2 py-1 text-[10px] font-bold rounded-full ${feature.badge === 'AI' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{feature.badge}</div>
                                </div>
                                <h4 className="font-bold text-neutral-800 mb-1">{feature.title}</h4>
                            </div>
                        </div>
                    </motion.a>
                );
            })}
        </div>
    );
};

/**
 * A detailed timeline component explaining the benefits of NavAir.
 * @returns {React.ReactElement} The "How NavAir Helps" timeline.
 */
const HowNavAirHelps = () => {
    const stages = [
      { stage: "Pre-Arrival", description: "Plan your trip with predictive insights on traffic, parking availability, and security wait times.", icon: Calendar },
      { stage: "At The Airport", description: "Navigate seamlessly with AR-powered directions, get real-time gate changes, and track your baggage live.", icon: NavigationIcon },
      { stage: "Boarding & Flight", description: "Receive timely boarding reminders and stay updated with in-flight connection information.", icon: Plane },
      { stage: "Arrival & Beyond", description: "Get baggage carousel info instantly and plan your onward journey with ground transport integration.", icon: Package },
    ];

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            {stages.map((stage, index) => (
                <div key={index} className="flex space-x-4 relative">
                    <div className="flex flex-col items-center">
                        <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center z-10">
                            <stage.icon className="w-5 h-5" />
                        </div>
                        {index < stages.length - 1 && <div className="w-0.5 h-full bg-blue-200"></div>}
                    </div>
                    <div className="pb-8">
                        <p className="font-bold text-blue-600">{stage.stage}</p>
                        <p className="text-sm text-gray-600">{stage.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

/**
 * An interactive FAQ section.
 * @returns {React.ReactElement} The FAQ component.
 */
const FAQ = () => {
    const faqItems = [
      { q: "What is NavAir?", a: "NavAir is an AI-powered enterprise platform designed to streamline the airport experience for both passengers and staff. It integrates real-time data to provide intelligent navigation, predictive insights, and emergency assistance." },
      { q: "Is my data secure?", a: "Absolutely. We use end-to-end encryption and adhere to the highest industry standards for data privacy and security. Your information is used solely to enhance your airport experience." },
      { q: "How does the AI prediction work?", a: "Our AI models analyze historical and real-time data, including flight schedules, passenger flow, and weather patterns, to generate highly accurate predictions for wait times, delays, and optimal routes." },
    ];
    const [activeFaq, setActiveFaq] = useState < number | null > (0);

                            return (
        <div className="max-w-3xl mx-auto space-y-3">
            {faqItems.map((item, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <button onClick={() => setActiveFaq(activeFaq === index ? null : index)} className="w-full flex justify-between items-center p-4 text-left">
                        <span className="font-semibold text-neutral-800">{item.q}</span>
                        <motion.div animate={{ rotate: activeFaq === index ? 180 : 0 }}><ChevronDown className="w-5 h-5 text-gray-500" /></motion.div>
                    </button>
                    <AnimatePresence>
                    {activeFaq === index && (
                        <motion.div 
                            initial={{ opacity: 0, maxHeight: 0 }} 
                            animate={{ opacity: 1, maxHeight: 200 }} 
                            exit={{ opacity: 0, maxHeight: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="p-4 pt-0 text-neutral-600 text-sm overflow-hidden">{item.a}</div>
                </motion.div>
            )}
        </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

/**
 * The main homepage component that orchestrates all other components.
 * @returns {React.ReactElement} The complete homepage.
 */
export const HomePage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [flightProgress, setFlightProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setFlightProgress(prev => (prev >= 100 ? 0 : prev + 0.5));
    }, 100);
    return () => clearInterval(progressTimer);
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0.6, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-neutral-50 via-blue-50/30 to-purple-50/20 -z-10" />
      
      {/* Main content */}
      <main className="pt-[100px] sm:pt-[100px] px-2 sm:px-4 md:px-6 pb-8 flex-grow md:pb-[200px]">
        <div className="w-full max-w-5xl mx-auto space-y-12">

        <motion.section initial="hidden" animate="visible" variants={sectionVariants}>
            <HeroDashboard currentTime={currentTime} flightProgress={flightProgress} />
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-center text-neutral-800 mb-2">Airport Operations at a Glance</h2>
            <p className="text-center text-neutral-600 mb-8 max-w-2xl mx-auto">Real-time intelligence for unparalleled operational awareness.</p>
            <KeyMetrics />
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-center text-neutral-800 mb-8">How NavAir Helps You</h2>
            <HowNavAirHelps />
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={sectionVariants}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-neutral-800">Smart Services</h3>
                <a href="#" className="flex items-center space-x-1 text-sm text-blue-600 font-semibold"><span>View All</span><ArrowRight className="w-4 h-4" /></a>
            </div>
            <ServicesGrid />
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-center text-neutral-800 mb-8">Frequently Asked Questions</h2>
            <FAQ />
        </motion.section>

        {/* Additional Content Sections */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-center text-neutral-800 mb-8">Airport Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">2.5M+</div>
                    <div className="text-sm text-gray-600">Annual Passengers</div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">99.2%</div>
                    <div className="text-sm text-gray-600">On-Time Performance</div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">150+</div>
                    <div className="text-sm text-gray-600">Daily Flights</div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                    <div className="text-sm text-gray-600">Operations</div>
                </div>
            </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-center text-neutral-800 mb-8">Latest Updates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Plane className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">New Flight Routes</h3>
                            <p className="text-sm text-gray-600">Added 5 new international destinations</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">We've expanded our network to include new exciting destinations across Europe and Asia, providing more travel options for our passengers.</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Shield className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Enhanced Security</h3>
                            <p className="text-sm text-gray-600">New AI-powered screening</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">Our new AI-powered security screening system reduces wait times by 40% while maintaining the highest safety standards.</p>
                </div>
            </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-center text-neutral-800 mb-8">Testimonials</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center mb-4">
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">"NavAir made my airport experience incredibly smooth. The real-time updates and navigation were spot-on!"</p>
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                        <div>
                            <div className="font-semibold text-sm">Sarah Johnson</div>
                            <div className="text-xs text-gray-500">Business Traveler</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center mb-4">
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                            </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">"The baggage tracking feature saved me so much time. I knew exactly where my luggage was!"</p>
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                        <div>
                            <div className="font-semibold text-sm">Mike Chen</div>
                            <div className="text-xs text-gray-500">Frequent Flyer</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center mb-4">
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">"The emergency assistance feature gave me peace of mind during my travels."</p>
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                        <div>
                            <div className="font-semibold text-sm">Emily Davis</div>
                            <div className="text-xs text-gray-500">Family Traveler</div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;