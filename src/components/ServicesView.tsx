import { useState } from 'react';
import { Search, PenTool, Sparkles, Hammer, Scissors, Layers, CheckCircle, Clock, ShieldCheck, ArrowRight, HelpCircle } from 'lucide-react';
import { ServiceOrder } from '../types';
import { INITIAL_SERVICE_ORDERS, IMAGES } from '../data/mockData';

export default function ServicesView() {
  const [trackingId, setTrackingId] = useState<string>('SRV-9081');
  const [activeTab, setActiveTab] = useState<'cleaning' | 'repair' | 'custom'>('repair');

  // Search local orders
  const foundOrder = INITIAL_SERVICE_ORDERS.find(
    o => o.id.toLowerCase() === trackingId.trim().toLowerCase()
  );

  const servicesBreakdown = {
    cleaning: {
      title: 'Ultrasonic Polishing & Deep Cleaning',
      desc: 'Restores the vivid, high-reflectivity mirror shine of raw yellow gold, platinum, and diamonds using automated frequency-swept ultrasonic basins and specialized chemical flushes.',
      price: '$45 starting',
      time: 'Same-day execution',
      warranty: '6-Month Sparkle Lock',
      steps: [
        'Electronic spectroscopy mapping to check stone setting stability.',
        'High-temperature steam pre-wash to lift body oils and micro-debris.',
        'Ultrasonic sweep inside non-abrasive metallurgical bath.',
        'Fine microfiber hand buffing with premium jeweler compounds.'
      ],
      before: IMAGES.antiqueRing,
      after: IMAGES.heroRing,
    },
    repair: {
      title: 'Micro-Laser Soldering & Re-shaping',
      desc: 'Precision structural restoration of hairline fractures, split ring shanks, weak lock clasps, and broken prongs under a 40x micro-camera viewport using matching-purity wire solder.',
      price: '$85 starting',
      time: '2–4 business days',
      warranty: '12-Month Mechanical Warranty',
      steps: [
        'Structural stress-testing under vertical digital gauges.',
        'Micro-laser alignment and localized spot welding to preserve metal integrity.',
        'Re-tipping and tight adjustment of security prongs around valuable gemstones.',
        'Fine metallurgical assay validation of the repaired joint.'
      ],
      before: IMAGES.antiqueRing,
      after: IMAGES.heroRing,
    },
    custom: {
      title: 'Bespoke Jewelry CAD & Creation',
      desc: 'Translate sketches or existing family heirlooms into a masterpiece. Work with master designers to draft 3D CAD renders, construct 3D wax models, vacuum-cast matching-purity alloys, and master-set handpicked stones.',
      price: '$1,200 starting',
      time: '4–6 weeks',
      warranty: 'Lifetime structural warranty with certified pedigree documents',
      steps: [
        'In-depth CAD drafting and rendering based on client preferences.',
        'High-definition 3D stereolithography printing of trial wax models.',
        'Vacuum-sealed induction-casting in solid yellow, white, or rose gold.',
        'Micro-setting of diamonds and precious gems with detailed lab certifications.'
      ],
      before: IMAGES.rawGold,
      after: IMAGES.heroRing,
    }
  };

  const currentService = servicesBreakdown[activeTab];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-16">
      
      {/* Intro Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-sm uppercase tracking-widest text-[#C8A45D] font-black bg-[#C8A45D]/10 px-3 py-1 rounded">
          OneChannelAdmin Service Center
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-[#F7F4EC] tracking-tight">
          Master Jeweler Maintenance &amp; Restoration
        </h2>
        <p className="text-sm text-[#AEB4C0] leading-relaxed">
          Our specialized laboratory preserves and repairs gold bullion, luxury timepieces, and priceless jewelry heirlooms. Track every stage of your work order live inside the 1CA secure tracking database.
        </p>
      </div>

      {/* Live Work-Order Tracker Section */}
      <div className="bg-[#11141A] border border-white/10 rounded-xl p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#F7F4EC] uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C8A45D] animate-pulse"></span>
              Live Work Order Tracker (1CA Integration)
            </h3>
            <p className="text-[13px] uppercase tracking-wider text-[#AEB4C0]/60 mt-1">Enter your 1CA receipt ID to inspect physical progress and technician logs</p>
          </div>

          {/* Input field */}
          <div className="flex gap-2 w-full md:w-auto max-w-sm">
            <input
              type="text"
              placeholder="e.g. SRV-9081"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="bg-[#080A0D] border border-white/10 rounded-sm p-2.5 text-xs text-[#F7F4EC] uppercase focus:border-[#C8A45D] focus:outline-none w-full md:w-48 font-mono"
            />
          </div>
        </div>

        {foundOrder ? (
          <div className="bg-[#080A0D] border border-white/10 rounded-sm p-5 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-[rgba(255,255,255,0.06)] text-xs">
              <div>
                <p className="text-[13px] text-[#AEB4C0] uppercase">Target Asset</p>
                <p className="font-bold text-[#F7F4EC]">{foundOrder.itemName}</p>
              </div>
              <div>
                <p className="text-[13px] text-[#AEB4C0] uppercase">Service Type</p>
                <p className="font-bold text-[#C8A45D]">{foundOrder.serviceType}</p>
              </div>
              <div>
                <p className="text-[13px] text-[#AEB4C0] uppercase">Order Total</p>
                <p className="font-bold text-[#F7F4EC]">${foundOrder.cost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[13px] text-[#AEB4C0] uppercase">Est Completion</p>
                <p className="font-bold text-[#E3C27A]">{foundOrder.estimatedCompletion}</p>
              </div>
            </div>

            {/* Tracker Timeline visualization */}
            <div className="relative pt-2">
              {/* Line background */}
              <div className="absolute top-6 left-4 right-4 h-0.5 bg-white/5 md:block hidden"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
                {foundOrder.timeline.map((step, idx) => {
                  const isActive = step.active;
                  const isCompleted = step.date !== 'Pending';
                  return (
                    <div key={idx} className="flex md:flex-col gap-4 md:gap-2 text-left md:text-center items-start md:items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-200 ${
                        isActive
                          ? 'bg-[#C8A45D] border-[#C8A45D] text-[#080A0D] ring-4 ring-[#C8A45D]/20'
                          : isCompleted
                          ? 'bg-[#2F9D70] border-[#2F9D70] text-[#080A0D]'
                          : 'bg-[#11141A] border-[rgba(255,255,255,0.08)] text-[#AEB4C0]'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <p className={`text-xs font-bold ${isActive ? 'text-[#E3C27A]' : isCompleted ? 'text-[#2F9D70]' : 'text-[#AEB4C0]'}`}>
                          {step.status}
                        </p>
                        <p className="text-xs text-[#AEB4C0]/50 font-semibold">{step.date}</p>
                        <p className="text-[13px] text-[#AEB4C0] leading-normal md:max-w-[140px] md:mx-auto">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-[#11141A] rounded border border-[rgba(255,255,255,0.03)] text-xs text-[#AEB4C0] space-y-2">
            <p className="font-bold text-[#F7F4EC]">Work Order &ldquo;{trackingId}&rdquo; not discovered in 1CA database.</p>
            <p className="max-w-md mx-auto opacity-70">Please check that your ID matches the correct format (e.g., <strong>SRV-9081</strong> or <strong>SRV-9122</strong>). For security compliance, external public query rates are limited.</p>
          </div>
        )}
      </div>

      {/* Services Tabs section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <button
            onClick={() => setActiveTab('cleaning')}
            className={`w-full text-left p-4 rounded-sm border flex items-center gap-4 transition-all duration-150 cursor-pointer ${
              activeTab === 'cleaning'
                ? 'bg-[#11141A] border-[#C8A45D] text-[#E3C27A]'
                : 'bg-transparent border-white/10 hover:bg-[#11141A]/50 text-[#AEB4C0]'
            }`}
          >
            <div className={`p-2 rounded-sm border ${activeTab === 'cleaning' ? 'bg-[#C8A45D]/10 border-[#C8A45D]' : 'bg-[#080A0D] border-white/10'}`}>
              <Sparkles className="w-5 h-5 text-[#C8A45D]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest">Polishing &amp; Buffing</p>
              <p className="text-[13px] text-[#AEB4C0]/60 mt-0.5">Restore metallic glow and clarity</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('repair')}
            className={`w-full text-left p-4 rounded-sm border flex items-center gap-4 transition-all duration-150 cursor-pointer ${
              activeTab === 'repair'
                ? 'bg-[#11141A] border-[#C8A45D] text-[#E3C27A]'
                : 'bg-transparent border-white/10 hover:bg-[#11141A]/50 text-[#AEB4C0]'
            }`}
          >
            <div className={`p-2 rounded-sm border ${activeTab === 'repair' ? 'bg-[#C8A45D]/10 border-[#C8A45D]' : 'bg-[#080A0D] border-white/10'}`}>
              <Hammer className="w-5 h-5 text-[#C8A45D]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest">Prong &amp; Shank Repair</p>
              <p className="text-[13px] text-[#AEB4C0]/60 mt-0.5">Micro-laser joint re-tipping</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`w-full text-left p-4 rounded-sm border flex items-center gap-4 transition-all duration-150 cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-[#11141A] border-[#C8A45D] text-[#E3C27A]'
                : 'bg-transparent border-white/10 hover:bg-[#11141A]/50 text-[#AEB4C0]'
            }`}
          >
            <div className={`p-2 rounded-sm border ${activeTab === 'custom' ? 'bg-[#C8A45D]/10 border-[#C8A45D]' : 'bg-[#080A0D] border-white/10'}`}>
              <PenTool className="w-5 h-5 text-[#C8A45D]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest">Custom Jewelry Design</p>
              <p className="text-[13px] text-[#AEB4C0]/60 mt-0.5">Bespoke 3D CAD modeling</p>
            </div>
          </button>
        </div>

        {/* Tab Detail Screen */}
        <div className="lg:col-span-8 bg-[#11141A] border border-white/10 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-black text-[#F7F4EC] tracking-tight">{currentService.title}</h3>
              <p className="text-xs text-[#AEB4C0] leading-relaxed">{currentService.desc}</p>
              
              <div className="grid grid-cols-3 gap-3 border-t border-[rgba(255,255,255,0.06)] pt-4 text-[13px] text-[#AEB4C0]">
                <div>
                  <span className="block font-semibold uppercase text-xs">Starting Price</span>
                  <span className="text-xs font-bold text-[#E3C27A]">{currentService.price}</span>
                </div>
                <div>
                  <span className="block font-semibold uppercase text-xs">Standard Period</span>
                  <span className="text-xs font-bold text-[#F7F4EC]">{currentService.time}</span>
                </div>
                <div>
                  <span className="block font-semibold uppercase text-xs">Insured Warranty</span>
                  <span className="text-xs font-bold text-[#2F9D70]">{currentService.warranty}</span>
                </div>
              </div>
            </div>

            {/* Micro visual comparison - Slide card style */}
            <div className="space-y-2">
              <label className="text-xs text-[#AEB4C0] uppercase tracking-wider font-bold">Technician Optical View (Before vs After)</label>
              <div className="grid grid-cols-2 gap-2 aspect-[4/3] rounded overflow-hidden">
                <div className="relative group overflow-hidden bg-[#080A0D] border border-white/5">
                  <img src={currentService.before} alt="Before" referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-60" />
                  <span className="absolute bottom-2 left-2 text-[8px] bg-red-500/20 text-[#C85A5A] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Before</span>
                </div>
                <div className="relative group overflow-hidden bg-[#080A0D] border border-white/5">
                  <img src={currentService.after} alt="After" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 text-[8px] bg-emerald-500/20 text-[#2F9D70] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Restored</span>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow list */}
          <div className="border-t border-[rgba(255,255,255,0.06)] pt-6 space-y-3">
            <h4 className="text-[13px] text-[#C8A45D] uppercase tracking-widest font-black">Centralized Intake Checklist Workflow</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentService.steps.map((step, idx) => (
                <div key={idx} className="flex gap-2.5 items-start text-xs text-[#AEB4C0]">
                  <CheckCircle className="w-4 h-4 text-[#C8A45D] shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
