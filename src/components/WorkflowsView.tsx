import React, { useState, useEffect } from 'react';
import { Upload, X, ShieldCheck, Scale, FileText, CheckCircle2, ChevronRight, ChevronLeft, Calendar, MapPin, Calculator, AlertCircle } from 'lucide-react';
import { DEMO_SPOT_PRICE_GRAM, KARAT_FACTORS } from '../data/mockData';

interface WorkflowProps {
  type: 'sell' | 'pawn' | 'appraisal';
  onClose: () => void;
  onSubmit: (data: any) => void;
  onShowNotification?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function WorkflowsView({ type, onClose, onSubmit, onShowNotification }: WorkflowProps) {
  const [step, setStep] = useState(1);
  const [dragOver, setDragOver] = useState(false);

  // Common Form States
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState('jewelry');
  const [weight, setWeight] = useState(15);
  const [karat, setKarat] = useState('18K');
  const [shippingMethod, setShippingMethod] = useState<'Store Visit' | 'Secure Pickup' | 'Insured Mail-In'>('Insured Mail-In');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  
  // Personal Info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [idVerified, setIdVerified] = useState(false);
  const [idDocument, setIdDocument] = useState<string | null>(null);
  
  // Custom Signature
  const [signatureText, setSignatureText] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Appraisal Booking States
  const [appraisalService, setAppraisalService] = useState('XRF Assay Lab Certificate');
  const [location, setLocation] = useState('NYC Manhattan Safe Vault');
  const [bookingDate, setBookingDate] = useState('2026-07-25');
  const [bookingTime, setBookingTime] = useState('11:00 AM');

  // Real-time Valuation
  const [calcMeltValue, setCalcMeltValue] = useState(0);
  const [calcMinOffer, setCalcMinOffer] = useState(0);
  const [calcMaxOffer, setCalcMaxOffer] = useState(0);

  useEffect(() => {
    const factor = KARAT_FACTORS[karat] || 0.75;
    const fineMass = weight * factor;
    const melt = fineMass * DEMO_SPOT_PRICE_GRAM;
    setCalcMeltValue(Math.round(melt));
    setCalcMinOffer(Math.round(melt * 0.94));
    setCalcMaxOffer(Math.round(melt * 0.98));
  }, [weight, karat]);

  // Mock Photo Drag-and-Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Simulate file upload
      setUploadedPhotos(prev => [...prev, e.dataTransfer.files[0].name]);
    }
  };

  const handleMockUpload = () => {
    setUploadedPhotos(prev => [...prev, `gold_asset_photo_${prev.length + 1}.jpg`]);
  };

  const handleMockIDUpload = () => {
    setIdDocument('client_identity_passport.png');
    setIdVerified(true);
  };

  const executeSubmit = () => {
    if (!acceptTerms) {
      if (onShowNotification) {
        onShowNotification('Terms and legally binding agreements must be accepted prior to 1CA secure lockbox logging.', 'error');
      } else {
        alert('Terms and legally binding agreements must be accepted prior to 1CA secure lockbox logging.');
      }
      return;
    }

    const compiledData = {
      type,
      itemName: itemName || `${karat} Gold ${itemType}`,
      weight,
      karat,
      shippingMethod,
      calcMeltValue,
      calcMinOffer,
      calcMaxOffer,
      fullName,
      email,
      signatureText,
      appraisalService,
      location,
      bookingDate,
      bookingTime
    };

    onSubmit(compiledData);
    setStep(type === 'appraisal' ? 5 : 6); // Move to completion step
  };

  // Titles Mapping
  const titles = {
    sell: ['Tell Us What You Have', 'Purity & Mass Calculator', 'Secure Shipping & Collection', 'Client Verification & AML', 'Review & Agreement', 'Audit Locked'],
    pawn: ['Initiate Secured Loan', 'Purity & Mass Calculator', 'Collateral Terms Selection', 'Identity Verification', 'Review & Agreement', 'Loan Locked'],
    appraisal: ['Appraisal Laboratory Service', 'Target Item Specification', 'Select Date & Location', 'Verify Contact Details', 'Booking Confirmed']
  };

  const activeSteps = titles[type];
  const currentStepTitle = activeSteps[step - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080A0D]/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#171A21] border border-[#C8A45D]/40 w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between my-8 max-h-[90vh]">
        
        {/* Header bar */}
        <div className="p-5 bg-[#11141A] border-b border-[rgba(255,255,255,0.06)] flex justify-between items-center shrink-0">
          <div>
            <span className="text-[9px] uppercase tracking-widest text-[#C8A45D] font-extrabold block">
              1CA Workflow Portal
            </span>
            <h3 className="text-sm font-black text-[#F7F4EC] uppercase tracking-wider mt-0.5">
              {type === 'sell' ? 'Sell Your Gold' : type === 'pawn' ? 'Apply for Pawn Loan' : 'Book Professional Appraisal'}
            </h3>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-full text-[#AEB4C0] hover:text-[#F7F4EC] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body View */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Progress Tracker Horizontal Dots */}
          {step <= activeSteps.length && (
            <div className="pb-4 border-b border-[rgba(255,255,255,0.04)] flex items-center justify-between text-xs text-[#AEB4C0]">
              <span className="font-bold text-[#C8A45D] uppercase tracking-widest text-[9px]">
                Step {step} of {activeSteps.length}: {currentStepTitle}
              </span>
              <div className="flex gap-1.5">
                {activeSteps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx + 1 === step
                        ? 'bg-[#C8A45D] w-6'
                        : idx + 1 < step
                        ? 'bg-[#2F9D70] w-2'
                        : 'bg-white/10 w-2'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== SELL GOLD / PAWN STEP 1 ==================== */}
          {step === 1 && (type === 'sell' || type === 'pawn') && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-2 font-bold">Item Identification</label>
                <input
                  type="text"
                  placeholder="e.g. Broken 18K Curb Chain or Diamond Wedding Ring"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2.5 text-xs text-[#F7F4EC] focus:border-[#C8A45D] focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-2 font-bold">Asset Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {['jewelry', 'coins', 'bars', 'scrap', 'dental', 'nuggets'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setItemType(c)}
                      className={`py-2 px-3 text-left text-xs rounded border capitalize transition-all duration-150 cursor-pointer ${
                        itemType === c
                          ? 'bg-[#C8A45D]/10 border-[#C8A45D] text-[#E3C27A] font-bold'
                          : 'bg-[#11141A] border-[rgba(255,255,255,0.06)] text-[#AEB4C0]'
                      }`}
                    >
                      {c} Gold
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload Area */}
              <div className="space-y-2">
                <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider font-bold">Upload Asset photographs</label>
                <div
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                    dragOver ? 'border-[#C8A45D] bg-[#C8A45D]/5' : 'border-[rgba(255,255,255,0.1)] bg-[#11141A]'
                  }`}
                >
                  <Upload className="w-8 h-8 text-[#C8A45D] mx-auto mb-2" />
                  <p className="text-xs text-[#F7F4EC]">Drag &amp; drop jewelry photos here, or</p>
                  <button
                    type="button"
                    onClick={handleMockUpload}
                    className="mt-2.5 text-xs font-bold text-[#E3C27A] hover:underline cursor-pointer"
                  >
                    Select files from local device (Demo Upload)
                  </button>
                </div>

                {uploadedPhotos.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {uploadedPhotos.map((p, idx) => (
                      <span key={idx} className="text-[10px] bg-white/5 border border-white/5 px-2.5 py-1 rounded text-[#AEB4C0] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#C8A45D]" />
                        {p}
                        <X className="w-3 h-3 text-red-400 cursor-pointer ml-1" onClick={() => setUploadedPhotos(prev => prev.filter((_, i) => i !== idx))} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== SELL GOLD / PAWN STEP 2 ==================== */}
          {step === 2 && (type === 'sell' || type === 'pawn') && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-2 font-bold">Estimated Mass (Grams)</label>
                  <input
                    type="number"
                    value={weight || ''}
                    onChange={(e) => setWeight(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2.5 text-xs text-[#F7F4EC] focus:border-[#C8A45D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-2 font-bold">Assumed Karatage</label>
                  <select
                    value={karat}
                    onChange={(e) => setKarat(e.target.value)}
                    className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2.5 text-xs text-[#F7F4EC] focus:border-[#C8A45D] focus:outline-none"
                  >
                    {Object.keys(KARAT_FACTORS).map((k) => (
                      <option key={k} value={k}>{k} ({(KARAT_FACTORS[k] * 100).toFixed(1)}% pure)</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Valuation screen inside form */}
              <div className="p-5 bg-[#11141A] rounded-lg border border-[rgba(255,255,255,0.06)] space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#C8A45D] uppercase tracking-widest font-black">
                    <Calculator className="w-4 h-4" />
                    <span>Real-time Calculation Payout</span>
                  </div>
                  <span className="text-[10px] bg-[#2F9D70]/10 text-[#2F9D70] font-bold px-2 py-0.5 rounded">Spot-Indexed</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#AEB4C0] uppercase text-[9px]">Melt Value</span>
                    <p className="text-xl font-bold text-[#F7F4EC]">${calcMeltValue.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[#AEB4C0] uppercase text-[9px]">Indicative Offer Range</span>
                    <p className="text-xl font-bold text-[#E3C27A]">${calcMinOffer.toLocaleString()} – ${calcMaxOffer.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SELL GOLD STEP 3 ==================== */}
          {step === 3 && type === 'sell' && (
            <div className="space-y-4">
              <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-2 font-bold">Select Intake / Shipping Method</label>
              
              <div className="space-y-3">
                {[
                  {
                    id: 'Insured Mail-In',
                    title: 'Secure Insured Mail-In Package',
                    desc: 'We mail you an armored, tamper-evident packing container with prepaid next-day delivery labels and automatic insurance (up to $150,000 per shipment).'
                  },
                  {
                    id: 'Secure Pickup',
                    title: 'Direct Armored Courier Pickup',
                    desc: 'Scheduled physical retrieval by our certified security associates (only available in NYC, Chicago, Zurich, London, and Miami metro areas).'
                  },
                  {
                    id: 'Store Visit',
                    title: 'Physical Laboratory Lobby Drop-off',
                    desc: 'Schedule a direct reservation at one of our high-security vault lobby structures for immediate physical spectrometer assay testing.'
                  }
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setShippingMethod(m.id as any)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      shippingMethod === m.id
                        ? 'bg-[#171A21] border-[#C8A45D] text-[#E3C27A]'
                        : 'bg-[#11141A] border-[rgba(255,255,255,0.04)] text-[#AEB4C0] hover:bg-[#171A21]/30'
                    }`}
                  >
                    <p className="text-xs font-bold">{m.title}</p>
                    <p className="text-[10px] text-[#AEB4C0]/80 mt-1 leading-relaxed">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== PAWN STEP 3 (COLLATERAL PROPOSALS) ==================== */}
          {step === 3 && type === 'pawn' && (
            <div className="space-y-5">
              <h4 className="text-[10px] text-[#C8A45D] uppercase tracking-widest font-black">1CA Pawn Collateral Pricing Options</h4>
              
              <div className="bg-[#11141A] border border-[rgba(255,255,255,0.06)] rounded-lg p-5 space-y-4 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#AEB4C0]">Maximum Loan Principal:</span>
                  <span className="font-bold text-[#F7F4EC]">${Math.round(calcMinOffer * 0.75).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#AEB4C0]">Fixed Monthly finance fee:</span>
                  <span className="font-bold text-[#F7F4EC]">${Math.round(calcMinOffer * 0.75 * 0.06)} (6% monthly rate)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#AEB4C0]">Annual Percentage Rate (APR):</span>
                  <span className="font-bold text-[#D29B3C]">24.0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#AEB4C0]">Standard Maturity limits:</span>
                  <span className="font-bold text-[#F7F4EC]">90 Days (with 30-day default grace period)</span>
                </div>
              </div>

              <div className="p-3.5 bg-yellow-500/5 rounded border border-yellow-500/15 flex gap-2">
                <AlertCircle className="w-4 h-4 text-[#D29B3C] shrink-0 mt-0.5" />
                <p className="text-[9px] text-[#AEB4C0] leading-relaxed">
                  Notice: Pawn transactions do not constitute asset sales. If loan principal and interest are repaid prior to maturity, collateral is released in identical physical condition. Default will cause forfeiture but never impacts client credit score.
                </p>
              </div>
            </div>
          )}

          {/* ==================== SELL GOLD / PAWN STEP 4 (VERIFICATION) ==================== */}
          {step === 4 && (type === 'sell' || type === 'pawn') && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-1.5 font-bold">Client Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2 text-xs text-[#F7F4EC]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-1.5 font-bold">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="johndoe@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2 text-xs text-[#F7F4EC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-1.5 font-bold">Residential Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="123 Financial Row, Manhattan, NY"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2 text-xs text-[#F7F4EC]"
                />
              </div>

              {/* AML Document Scan Upload */}
              <div className="p-4 bg-[#11141A] border border-[rgba(255,255,255,0.04)] rounded-lg space-y-3">
                <p className="text-[10px] uppercase text-[#C8A45D] font-bold">AML/Know-Your-Customer Verification Compliance</p>
                <p className="text-[10px] text-[#AEB4C0] leading-relaxed">
                  Under Federal bank secrecy laws, we must verify owner identity prior to creating binding metal contracts. Upload an image of your passport or government driver&rsquo;s identification.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleMockIDUpload}
                    className="px-4 py-2 bg-[#171A21] border border-white/10 hover:border-[#C8A45D] rounded text-xs text-[#E3C27A] font-bold cursor-pointer"
                  >
                    Simulate ID Document Verification Scan
                  </button>
                  {idVerified && (
                    <span className="text-xs text-[#2F9D70] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> ID Linked: {idDocument}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== SELL GOLD / PAWN STEP 5 (REVIEW & SIGN) ==================== */}
          {step === 5 && (type === 'sell' || type === 'pawn') && (
            <div className="space-y-4">
              <h4 className="text-[10px] text-[#C8A45D] uppercase tracking-widest font-black">Audit Locked Contract Ledger Proposal</h4>
              
              <div className="bg-[#11141A] p-4 rounded-lg border border-[rgba(255,255,255,0.06)] text-xs space-y-2.5 text-[#AEB4C0]">
                <div className="flex justify-between">
                  <span>Owner Name:</span>
                  <span className="font-bold text-[#F7F4EC]">{fullName || 'Jane Doe'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Item:</span>
                  <span className="font-bold text-[#F7F4EC]">{itemName || '18K Scrap Gold Chain'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Gross Mass:</span>
                  <span className="font-bold text-[#F7F4EC]">{weight} grams</span>
                </div>
                <div className="flex justify-between">
                  <span>Tested Purity:</span>
                  <span className="font-bold text-[#F7F4EC]">{karat} ({((KARAT_FACTORS[karat] || 0.75)*100).toFixed(0)}% gold)</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[rgba(255,255,255,0.05)] text-[#E3C27A] font-bold">
                  <span>Estimated Valuation:</span>
                  <span>${calcMinOffer.toLocaleString()} – ${calcMaxOffer.toLocaleString()} USD</span>
                </div>
              </div>

              {/* Signature panel */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-1.5 font-bold">Client digital Signature</label>
                  <input
                    type="text"
                    required
                    placeholder="Type Full Legal Name to Sign"
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    className="w-full bg-[#11141A] border-2 border-dashed border-[rgba(255,255,255,0.1)] focus:border-[#C8A45D] focus:outline-none p-3 rounded font-mono text-sm text-[#E3C27A]"
                  />
                </div>

                <div className="flex items-start gap-2.5">
                  <input
                    id="terms-check"
                    required
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="accent-[#C8A45D] mt-0.5"
                  />
                  <label htmlFor="terms-check" className="text-[9px] text-[#AEB4C0] leading-relaxed cursor-pointer select-none">
                    By checking this box, I declare that I have lawful legal possession of the submitted gold assets, all details are true, and I consent to secure record storing inside 1CA ledger database.
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ==================== APPRAISAL WORKFLOW STEPS ==================== */}
          {type === 'appraisal' && step === 1 && (
            <div className="space-y-4">
              <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-2 font-bold">Appraisal Service Type</label>
              <div className="space-y-2">
                {[
                  'XRF Spectrometry & Metallurgical Certificate',
                  'Hydrostatic Purity Analysis & Valuation Report',
                  'GIA Estate Diamond Certification & Mapping',
                  'Historical Jewelry Pedigree & Authenticity Verification'
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setAppraisalService(s)}
                    className={`w-full text-left p-3.5 rounded border text-xs transition-all ${
                      appraisalService === s ? 'bg-[#C8A45D]/10 border-[#C8A45D] text-[#E3C27A] font-bold' : 'bg-[#11141A] border-white/5 text-[#AEB4C0]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {type === 'appraisal' && step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-2 font-bold">Item Description</label>
                <input
                  type="text"
                  placeholder="e.g. Vintage 22K Solid Wedding Band"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2.5 text-xs text-[#F7F4EC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-2 font-bold font-bold">Weight Estimate (g)</label>
                  <input
                    type="number"
                    value={weight || ''}
                    onChange={(e) => setWeight(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2.5 text-xs text-[#F7F4EC]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-2 font-bold font-bold">Expected Karatage</label>
                  <select
                    value={karat}
                    onChange={(e) => setKarat(e.target.value)}
                    className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2.5 text-xs text-[#F7F4EC]"
                  >
                    {Object.keys(KARAT_FACTORS).map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {type === 'appraisal' && step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-2 font-bold">Laboratory Location</label>
                <div className="space-y-2">
                  {['NYC Manhattan Safe Vault', 'Zurich Central Laboratory', 'Chicago Loop Deposit Lobby'].map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setLocation(loc)}
                      className={`w-full text-left p-3.5 rounded border text-xs flex justify-between items-center ${
                        location === loc ? 'bg-[#C8A45D]/10 border-[#C8A45D] text-[#E3C27A] font-bold' : 'bg-[#11141A] border-white/5 text-[#AEB4C0]'
                      }`}
                    >
                      <span>{loc}</span>
                      <MapPin className="w-4 h-4 text-[#C8A45D]" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-2 font-bold">Select Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2.5 text-xs text-[#F7F4EC]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-2 font-bold font-bold">Preferred Slot</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2.5 text-xs text-[#F7F4EC]"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {type === 'appraisal' && step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-1.5 font-bold">Owner Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2 text-xs text-[#F7F4EC]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-1.5 font-bold">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="johndoe@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2 text-xs text-[#F7F4EC]"
                  />
                </div>
              </div>

              <div className="p-4 bg-[#11141A] rounded-lg border border-[rgba(255,255,255,0.06)] text-xs space-y-2.5 text-[#AEB4C0]">
                <h5 className="font-bold text-[#F7F4EC]">Booking Summary Ledger</h5>
                <div className="flex justify-between">
                  <span>Appraisal Laboratory Type:</span>
                  <span className="font-bold text-[#F7F4EC]">{appraisalService}</span>
                </div>
                <div className="flex justify-between">
                  <span>Scheduled Vault Location:</span>
                  <span>{location}</span>
                </div>
                <div className="flex justify-between">
                  <span>Slot Scheduled:</span>
                  <span>{bookingDate} at {bookingTime}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  id="appraisal-terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="accent-[#C8A45D] mt-0.5"
                />
                <label htmlFor="appraisal-terms" className="text-[9px] text-[#AEB4C0] leading-relaxed cursor-pointer select-none">
                  I agree to structural terms, legal disclosure holding liability limits, and understand that standard laboratory fees may apply upon assay certification completion.
                </label>
              </div>
            </div>
          )}

          {/* ==================== COMPLETION VIEW (FINAL STEP) ==================== */}
          {((type === 'sell' || type === 'pawn') && step === 6) || (type === 'appraisal' && step === 5) ? (
            <div className="p-6 text-center space-y-5 animate-fade-in">
              <CheckCircle2 className="w-16 h-16 text-[#2F9D70] mx-auto animate-bounce-slow" />
              <div>
                <h4 className="text-xl font-black text-[#F7F4EC] uppercase">Transaction Locked &amp; Logged</h4>
                <p className="text-xs text-[#AEB4C0] max-w-sm mx-auto mt-2 leading-relaxed">
                  Your 1CA portal request has been logged successfully inside the secure OneChannelAdmin resource planner. Your audit ID is registered.
                </p>
              </div>

              <div className="bg-[#11141A] p-4 rounded-lg border border-white/5 font-mono text-xs max-w-xs mx-auto space-y-1.5 text-left text-[#AEB4C0]">
                <p className="text-[10px] uppercase text-[#C8A45D] font-bold">1CA SECURE LOG</p>
                <p>Status: <span className="text-[#2F9D70] font-bold">Audit Verified</span></p>
                <p>Transaction ID: <span className="text-[#F7F4EC] font-bold">1CA-TX-{Math.floor(Math.random() * 900000 + 100000)}</span></p>
                <p>Timestamp: <span className="text-[#F7F4EC] font-semibold">{new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC</span></p>
              </div>

              <p className="text-[10px] text-[#AEB4C0]/70 leading-relaxed max-w-md mx-auto">
                An automatic secure packaging kit or appointment confirmation has been sent to your registered email address. Use this tracker ID in your customer dashboard to inspect physical logistics.
              </p>
            </div>
          ) : null}

        </div>

        {/* Footer controls */}
        {step <= activeSteps.length && (
          <div className="p-5 bg-[#11141A] border-t border-[rgba(255,255,255,0.06)] flex justify-between shrink-0">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep(prev => prev - 1)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-xs text-[#AEB4C0] uppercase font-bold tracking-wider flex items-center gap-1 cursor-pointer transition-all duration-150"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {step === activeSteps.length ? (
              <button
                type="button"
                onClick={executeSubmit}
                className="px-6 py-2 bg-[#C8A45D] hover:bg-[#E3C27A] text-[#080A0D] rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all duration-150"
              >
                Submit &amp; Lock <ShieldCheck className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(prev => prev + 1)}
                className="px-6 py-2 bg-white/10 hover:bg-[#C8A45D] hover:text-[#080A0D] rounded text-xs text-[#F7F4EC] uppercase font-bold tracking-wider flex items-center gap-1 cursor-pointer transition-all duration-150"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
