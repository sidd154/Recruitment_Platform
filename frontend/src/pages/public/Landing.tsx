import { useRef, useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Hexagon, ShieldCheck, ArrowRight, Terminal } from 'lucide-react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

// --- DOM SCENE COMPONENTS (Framer Motion) --- //

function FallingResume({ 
    scrollYProgress, 
    config
}: { 
    scrollYProgress: MotionValue<number>; 
    config: any;
}) {
    const y = useTransform(scrollYProgress, [0, 0.5], [config.yStart, config.yEnd * config.speed]);
    const rotate = useTransform(scrollYProgress, [0, 0.5], [config.rotationStart, config.rotationStart + 180 * config.speed]);
    
    return (
        <motion.img
            src={`/images/resume${config.textureIdx}.png`}
            alt="Resume"
            className="absolute rounded shadow-[0_30px_60px_rgba(0,0,0,0.8)] object-contain origin-center grayscale-[0.8] invert opacity-40 brightness-75"
            style={{ 
                top: '50%', 
                left: '50%',
                x: config.x,
                y,
                rotate,
                scale: config.scale,
                width: '18vw',
                minWidth: '200px',
                pointerEvents: 'none',
                filter: 'drop-shadow(0 0 20px rgba(232,168,48,0.05))'
            }}
        />
    );
}

function FinalVerifiedResume({ scrollYProgress, viewportHeight }: { scrollYProgress: MotionValue<number>, viewportHeight: number }) {
    const y = useTransform(scrollYProgress, [0.4, 0.65], [viewportHeight, 0]);
    const rotate = useTransform(scrollYProgress, [0.4, 0.65], [20, 0]);
    
    return (
        <motion.img
            src="/images/resume1.png"
            alt="Final Resume"
            className="absolute shadow-[0_0_80px_rgba(232,168,48,0.15)] rounded object-contain grayscale-[0.5] invert brightness-[0.85]"
            style={{
                top: '50%',
                left: '50%',
                x: '-50%',
                marginTop: '-30vh',
                y,
                rotate,
                width: '35vw',
                minWidth: '350px',
                pointerEvents: 'none',
                zIndex: 10
            }}
        />
    );
}

function VerifiedStamp({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
    const scale = useTransform(scrollYProgress, [0.75, 0.82], [10, 1.0]);
    const opacity = useTransform(scrollYProgress, [0.75, 0.78, 0.82], [0, 1, 1]);
    const rotate = useTransform(scrollYProgress, [0.75, 0.82], [-30, -12]);

    return (
        <motion.img
            src="/images/verified_flat.png"
            alt="Verified Ink Stamp"
            className="absolute"
            style={{
                top: '50%',
                left: '50%',
                x: '-50%',
                marginTop: '-22vh',
                rotate,
                scale,
                opacity,
                width: '16vw',
                minWidth: '180px',
                maxWidth: '260px',
                pointerEvents: 'none',
                zIndex: 20,
                mixBlendMode: 'screen',
                filter: 'invert(1) sepia(1) saturate(3) hue-rotate(5deg) brightness(1.2)',
                objectFit: 'contain',
            }}
        />
    );
}



// --- MAIN WRAPPER --- //

export default function Landing() {
    const { scrollYProgress } = useScroll();
    
    const [viewport, setViewport] = useState({ width: 1000, height: 800 });
    
    useEffect(() => {
        setViewport({ width: window.innerWidth, height: window.innerHeight });
        const onResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const resumesConfig = useMemo(() => {
        return Array.from({ length: 30 }).map(() => ({
            x: (Math.random() - 0.5) * viewport.width * 1.5 - 150,
            yStart: -viewport.height - Math.random() * viewport.height,
            yEnd: viewport.height + Math.random() * viewport.height,
            scale: Math.random() * 0.5 + 0.6,
            rotationStart: Math.random() * 360,
            textureIdx: Math.random() > 0.5 ? 1 : 2,
            speed: Math.random() * 1.5 + 0.5
        }));
    }, [viewport.width, viewport.height]);

    const opPage1 = useTransform(scrollYProgress, [0, 0.1, 0.2, 1], [1, 1, 0, 0]);
    const opPage2 = useTransform(scrollYProgress, [0, 0.2, 0.3, 0.45, 0.55, 1], [0, 0, 1, 1, 0, 0]);
    const opPage3 = useTransform(scrollYProgress, [0, 0.55, 0.65, 0.75, 0.85, 1], [0, 0, 1, 1, 0, 0]);
    const opPage4 = useTransform(scrollYProgress, [0, 0.85, 0.95, 1], [0, 0, 1, 1]);

    return (
        <div className="relative w-full h-[400vh] bg-fintech-base font-body text-fintech-cream">
            <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col justify-center items-center">
                
                {/* GLOBAL NAV */}
                <nav className="absolute top-0 w-full flex justify-between items-center px-10 py-6 z-50 bg-fintech-surface/80 backdrop-blur-xl border-b border-fintech-border shadow-xl">
                    <div className="flex items-center space-x-3 group">
                        <div className="text-fintech-amber p-1.5 border border-fintech-amber/20 rounded shadow-[0_0_10px_rgba(232,168,48,0.2)] bg-fintech-base transition-colors group-hover:bg-fintech-amber/10">
                            <Hexagon className="w-6 h-6" />
                        </div>
                        <span className="text-3xl font-editorial tracking-wide">
                            SkillBridge
                        </span>
                    </div>
                    <div className="flex space-x-6 items-center">
                        <Link to="/login" className="text-sm font-terminal uppercase tracking-[0.2em] text-fintech-ash hover:text-fintech-amber transition-colors flex items-center space-x-2">
                            <Terminal className="w-4 h-4" />
                            <span>Login</span>
                        </Link>
                        <div className="group relative">
                            <button className="px-6 py-3 bg-fintech-amber text-fintech-base font-editorial font-bold text-lg rounded hover:bg-fintech-amber-hover transition-colors shadow-[0_0_20px_rgba(232,168,48,0.2)] flex items-center space-x-2">
                                <span>Sign Up</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 mt-3 w-56 bg-fintech-surface rounded shadow-2xl border border-fintech-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <Link to="/register/candidate" className="block px-6 py-4 text-[11px] font-terminal uppercase tracking-widest text-fintech-cream hover:bg-[#1E212E] hover:text-fintech-amber border-b border-fintech-border transition">
                                    Candidate Sign Up
                                </Link>
                                <Link to="/register/recruiter" className="block px-6 py-4 text-[11px] font-terminal uppercase tracking-widest text-[#63A583] hover:bg-[#1E212E] hover:text-[#78C49F] transition">
                                    Recruiter Sign Up
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* 3D SCROLLYTELLING ELEMENTS */}
                <div className="absolute inset-0 z-0 pointer-events-none perspective-[1000px] bg-[radial-gradient(circle_at_center,rgba(232,168,48,0.03)_0%,transparent_50%)]">
                    {resumesConfig.map((config, i) => (
                        <FallingResume key={i} scrollYProgress={scrollYProgress} config={config} />
                    ))}
                    <FinalVerifiedResume scrollYProgress={scrollYProgress} viewportHeight={viewport.height} />
                    <VerifiedStamp scrollYProgress={scrollYProgress} />
                </div>

                {/* HTML TEXT OVERLAYS */}
                <motion.div 
                    style={{ opacity: opPage1 }} 
                    className="absolute w-full h-screen flex flex-col justify-center items-center text-center px-6 z-30 pointer-events-none"
                >
                    <div className="bg-[#181B26] p-12 border border-fintech-border shadow-[0_30px_100px_rgba(0,0,0,0.95)] rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-fintech-amber"></div>
                        <h1 className="text-5xl md:text-7xl font-editorial leading-tight tracking-wide text-fintech-cream mb-6 drop-shadow-lg">
                            Stop Relying on <br/>
                            <span className="text-fintech-amber font-medium italic">Unverified Paper.</span>
                        </h1>
                        <p className="text-lg text-fintech-ash font-terminal tracking-wider max-w-2xl mx-auto uppercase">
                            The legacy recruitment model is compromised.<br/> 
                            Scroll to initialize the SkillBridge Verification Ledger.
                        </p>
                    </div>
                </motion.div>

                <motion.div 
                    style={{ opacity: opPage2 }} 
                    className="absolute w-full h-screen flex flex-col justify-center items-start px-12 lg:px-32 text-left z-30 pointer-events-none"
                >
                    <div className="bg-[#181B26] p-10 rounded-xl border border-fintech-border shadow-[0_30px_100px_rgba(0,0,0,0.95)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-fintech-amber"></div>
                        <h2 className="text-2xl font-terminal uppercase tracking-[0.2em] text-fintech-amber mb-4">
                            System Active // Agentic Parsing
                        </h2>
                        <p className="text-xl font-editorial text-fintech-cream max-w-md leading-relaxed">
                            Our LangGraph nodes automatically ingest resumes, discarding fluff and constructing a strict, verified telemetry profile.
                        </p>
                    </div>
                </motion.div>

                <motion.div 
                    style={{ opacity: opPage3 }} 
                    className="absolute w-full h-screen flex flex-col justify-center items-end px-12 lg:px-32 text-right z-30 pointer-events-none"
                >
                    <div className="bg-[#181B26] p-10 rounded-xl border border-fintech-border shadow-[0_30px_100px_rgba(0,0,0,0.95)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1 h-full bg-[#63A583]"></div>
                        <h2 className="text-2xl font-terminal uppercase tracking-[0.2em] text-[#63A583] mb-4">
                            Co-Pilot // Sandbox Validation
                        </h2>
                        <p className="text-xl font-editorial text-fintech-cream max-w-md ml-auto leading-relaxed">
                            WebRTC-enabled algorithmic evaluators conduct live audio coding tests. Only candidates passing standard deviation checks reach your desk.
                        </p>
                    </div>
                </motion.div>

                <motion.div 
                    style={{ opacity: opPage4 }} 
                    className="absolute w-full h-screen flex flex-col justify-end pb-40 items-center text-center z-40"
                >
                    <div className="bg-[#181B26] p-12 rounded-xl border border-fintech-border shadow-[0_30px_100px_rgba(0,0,0,0.95)] max-w-4xl w-full mx-auto relative overflow-hidden">
                        <ShieldCheck className="w-16 h-16 text-fintech-amber mx-auto mb-8 drop-shadow-lg opacity-80" />
                        <h1 className="text-4xl md:text-6xl font-editorial text-fintech-cream mb-8 tracking-wide font-medium">
                            Hire with <span className="italic text-fintech-amber">Absolute Certainty.</span>
                        </h1>
                        
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-12 pointer-events-auto">
                            <Link to="/register/candidate" className="w-full sm:w-auto px-8 py-5 bg-transparent border border-fintech-amber text-fintech-amber font-terminal text-[13px] uppercase tracking-[0.2em] rounded hover:bg-fintech-amber/10 transition shadow-[0_0_15px_rgba(232,168,48,0.1)]">
                                Sign Up as Candidate
                            </Link>
                            <Link to="/register/recruiter" className="w-full sm:w-auto px-8 py-5 bg-fintech-amber text-fintech-base font-editorial font-bold text-lg rounded hover:bg-fintech-amber-hover transition shadow-[0_0_20px_rgba(232,168,48,0.3)] flex items-center justify-center space-x-3">
                                <span>Sign Up as Recruiter</span>
                                <Briefcase className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
