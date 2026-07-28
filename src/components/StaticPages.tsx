import React, { useState } from 'react';
import { ShieldCheck, HelpCircle, Phone, Mail, MapPin, Building, Globe, Send, CheckCircle2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { FAQS } from '../data/mockData';

interface StaticPagesProps {
  pageType: 'about' | 'resources' | 'faq' | 'contact' | 'security';
}

export default function StaticPages({ pageType }: StaticPagesProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [conName, setConName] = useState('');
  const [conEmail, setConEmail] = useState('');
  const [conMsg, setConMsg] = useState('');

  const toggleFaq = (idx: number) => {
    setExpandedFaq(expandedFaq === idx ? null : idx);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
      
      {/* ==================== ABOUT PAGE ==================== */}
      {pageType === 'about' && (
        <div className="space-y-10">
          <div className="text-center space-y-3">
            <span className="text-[13px] text-[#C8A45D] uppercase tracking-widest font-extrabold block">Our Heritage &amp; Mission</span>
            <h1 className="text-3xl md:text-4xl font-black text-[#F7F4EC] tracking-tight">OneGold Corporate Infrastructure</h1>
            <p className="text-sm text-[#AEB4C0] max-w-2xl mx-auto leading-relaxed">
              Founded in 2018, OneGold bridges physical precious metal commerce with automated cloud resource planning. We secure value through high-precision physics and unyielding compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-6">
            <div className="space-y-4 text-xs text-[#AEB4C0] leading-relaxed">
              <h3 className="text-sm font-bold text-[#F7F4EC] uppercase tracking-wider">The 1CA Core Platform</h3>
              <p>
                Every transaction, appraisal, auction bid, and vault lock is cataloged instantly within <strong>OneChannelAdmin (1CA)</strong>. This robust ledger ensures complete chain-of-custody tracking from client intake to final refinery settlement.
              </p>
              <p>
                By linking independent lab assaying with real-time global spot price index feeds, we remove pricing ambiguities. Our clients buy, sell, and pledge gold with institutional-grade transparency.
              </p>
            </div>
            
            <div className="p-6 bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-xl space-y-4">
              <h4 className="text-[13px] text-[#C8A45D] uppercase tracking-widest font-black">Our Structural Standards</h4>
              <div className="space-y-3 text-xs text-[#F7F4EC]">
                <div className="flex gap-2.5 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C8A45D]"></div>
                  <span>ISO 9001:2015 Quality Assured</span>
                </div>
                <div className="flex gap-2.5 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C8A45D]"></div>
                  <span>LBMA Assaying Standards</span>
                </div>
                <div className="flex gap-2.5 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C8A45D]"></div>
                  <span>AML/KYC Bank Secrecy Act Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TRUST & SECURITY PAGE ==================== */}
      {pageType === 'security' && (
        <div className="space-y-10">
          <div className="text-center space-y-3">
            <span className="text-[13px] text-[#C8A45D] uppercase tracking-widest font-extrabold block">Risk Mitigated Custody</span>
            <h1 className="text-3xl md:text-4xl font-black text-[#F7F4EC] tracking-tight">Security Built Into Every Ledger</h1>
            <p className="text-sm text-[#AEB4C0] max-w-2xl mx-auto leading-relaxed">
              Protecting digital transactions and physical bullion assets is our utmost corporate mandate. Learn how our multi-layered protocols insulate your jewelry and gold.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {[
              {
                title: 'Holographic Vaulting',
                desc: 'Physical gold is stored inside subterranean UL-Class 3 secure safes with automated seismic detection and biometric gate logs.'
              },
              {
                title: 'Lloyd’s Protection',
                desc: 'All secured assets and high-value logistics transit are fully protected up to $150,000 against theft, damage, or loss.'
              },
              {
                title: 'AML Ledger Locking',
                desc: 'Client records, signatures, and document contracts are encrypted under AES-256 protocols and mapped inside OneChannelAdmin.'
              }
            ].map((card, idx) => (
              <div key={idx} className="p-5 bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-lg space-y-2.5">
                <ShieldCheck className="w-6 h-6 text-[#C8A45D]" />
                <h4 className="text-xs font-bold text-[#F7F4EC] uppercase tracking-wider">{card.title}</h4>
                <p className="text-sm text-[#AEB4C0] leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== FAQ PAGE ==================== */}
      {pageType === 'faq' && (
        <div className="space-y-8">
          <div className="text-center space-y-3 mb-10">
            <span className="text-[13px] text-[#C8A45D] uppercase tracking-widest font-extrabold block">Frequently Asked Queries</span>
            <h1 className="text-3xl md:text-4xl font-black text-[#F7F4EC] tracking-tight">Market Bulletin FAQ</h1>
          </div>

          <div className="space-y-3.5">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#171A21] border border-[rgba(255,255,255,0.06)] hover:border-white/10 rounded-lg overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-4 sm:p-5 flex justify-between items-center text-xs font-bold text-[#F7F4EC] uppercase tracking-wider cursor-pointer"
                >
                  <span className="max-w-[90%]">{faq.question}</span>
                  {expandedFaq === idx ? <ChevronUp className="w-4 h-4 text-[#C8A45D]" /> : <ChevronDown className="w-4 h-4 text-[#C8A45D]" />}
                </button>
                {expandedFaq === idx && (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-[#AEB4C0] leading-relaxed border-t border-[rgba(255,255,255,0.03)] pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== RESOURCES PAGE ==================== */}
      {pageType === 'resources' && (
        <div className="space-y-10">
          <div className="text-center space-y-3">
            <span className="text-[13px] text-[#C8A45D] uppercase tracking-widest font-extrabold block">Technical Guides &amp; Disclosures</span>
            <h1 className="text-3xl md:text-4xl font-black text-[#F7F4EC] tracking-tight">OneGold Reference Vault</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
            {[
              { title: 'Gold Purity Assay Guide.pdf', cat: 'Appraisal Tech' },
              { title: 'Secured Pawn Financing Disclosures.pdf', cat: 'Regulatory' },
              { title: '1CA API Integration Schema.json', cat: 'B2B Developers' },
              { title: 'Vault Logistics & Transit Rules.pdf', cat: 'Secure Transit' }
            ].map((res, idx) => (
              <div key={idx} className="p-4 bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-lg flex justify-between items-center hover:border-[#C8A45D]/40 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#C8A45D]" />
                  <div>
                    <p className="text-xs font-bold text-[#F7F4EC]">{res.title}</p>
                    <p className="text-[13px] text-[#AEB4C0] font-semibold">{res.cat}</p>
                  </div>
                </div>
                <span className="text-[13px] bg-white/5 px-2 py-0.5 rounded text-[#AEB4C0] uppercase font-bold tracking-wider">Download</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== CONTACT PAGE ==================== */}
      {pageType === 'contact' && (
        <div className="space-y-10">
          <div className="text-center space-y-3">
            <span className="text-[13px] text-[#C8A45D] uppercase tracking-widest font-extrabold block">Corporate Desk Communication</span>
            <h1 className="text-3xl md:text-4xl font-black text-[#F7F4EC] tracking-tight">Get in Touch with our Vault Lobby</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
            {/* Form */}
            <div className="lg:col-span-7 bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 md:p-6">
              {contactSuccess ? (
                <div className="text-center p-8 space-y-4 animate-fade-in">
                  <CheckCircle2 className="w-12 h-12 text-[#2F9D70] mx-auto animate-bounce" />
                  <div>
                    <h4 className="text-sm font-bold text-[#F7F4EC] uppercase">Message Logged</h4>
                    <p className="text-xs text-[#AEB4C0] mt-1">Our compliance and client management team has queued your ticket within 1CA.</p>
                  </div>
                  <button
                    onClick={() => setContactSuccess(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-xs text-[#AEB4C0]"
                  >
                    Send another query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[13px] text-[#AEB4C0] uppercase tracking-wider mb-1.5 font-bold">Your full Legal Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Marcus Aurelius"
                      value={conName}
                      onChange={(e) => setConName(e.target.value)}
                      className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2 text-xs text-[#F7F4EC] focus:border-[#C8A45D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] text-[#AEB4C0] uppercase tracking-wider mb-1.5 font-bold">Registered Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. marcus@rome.com"
                      value={conEmail}
                      onChange={(e) => setConEmail(e.target.value)}
                      className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2 text-xs text-[#F7F4EC] focus:border-[#C8A45D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] text-[#AEB4C0] uppercase tracking-wider mb-1.5 font-bold">Message details</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Specify your metal holdings query, wholesale lockbox demands, or pawn renewal limits..."
                      value={conMsg}
                      onChange={(e) => setConMsg(e.target.value)}
                      className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2 text-xs text-[#F7F4EC] focus:border-[#C8A45D] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#C8A45D] hover:bg-[#E3C27A] text-[#080A0D] py-2.5 text-xs font-bold uppercase tracking-widest rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Submit 1CA Service Ticket <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

            {/* Side Coordinates */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-xl space-y-4 text-xs text-[#AEB4C0]">
                <h4 className="font-bold text-[#F7F4EC] uppercase tracking-wider">Vault Coordinates</h4>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-[#C8A45D] shrink-0" />
                    <span>+1 (800) 555-3010 (Trading Desk)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-[#C8A45D] shrink-0" />
                    <span>support@onegold-1ca.com</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#C8A45D] shrink-0" />
                    <span>Suite 920, Financial District, Manhattan, NY 10005</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
