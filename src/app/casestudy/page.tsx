'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle2, Workflow, Crown, Smartphone, 
  Wallet, LayoutDashboard, LineChart, Globe, Lock, Code2, 
  MessageSquare, Sparkles, UserCheck, Search, Image as ImageIcon,
  Bell, Building2, CalendarDays
} from 'lucide-react';

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function CaseStudyPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#1a1a1a] font-sans selection:bg-[#c9365e] selection:text-white overscroll-none pb-20">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#fafaf8]/80 backdrop-blur-md border-b border-[#dddad4]">
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#4a4a4a] hover:text-[#c9365e] transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to App
          </Link>
          <div className="font-serif text-lg tracking-tight font-bold text-[#1a1a1a]">
            Glitz<span className="text-[#c9365e]">&</span>Glamour
          </div>
        </div>
      </nav>

      <main className="max-w-[1920px] mx-auto pt-16">
        
        {/* HERO SPREAD */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] min-h-[90vh] border-b border-[#dddad4]">
          
          {/* Hero Left */}
          <div className="px-6 md:px-16 lg:px-20 py-16 lg:py-24 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#dddad4]">
             <div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase text-[#c9365e] mb-8 bg-[#f5e8ec] px-3 py-1.5 rounded-full"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c9365e]" /> Custom Business Platform · Beauty Industry
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                  className="font-serif text-6xl md:text-8xl xl:text-[96px] leading-[0.95] tracking-tight text-[#1a1a1a] mb-8 max-w-[14ch]"
                >
                  Glitz &<br/><em className="italic text-[#c9365e]">Glamour</em><br/>OS
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                  className="text-lg md:text-xl font-light text-[#4a4a4a] max-w-[58ch] leading-relaxed mb-10"
                >
                  A fully custom platform built for a US-based nail salon — replacing five disconnected tools
                  with one system that handles bookings, loyalty, wallet passes, CRM, content, analytics,
                  and client communication, all under one brand.
                </motion.p>

                <motion.div 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                   className="flex flex-wrap gap-2 mb-12"
                >
                  {['Next.js', 'Prisma + PostgreSQL', 'Apple Wallet API', 'Google Wallet API', 'Resend + SMS', 'Vercel', 'CMS + CRM + Analytics'].map(tech => (
                     <span key={tech} className="text-xs font-medium text-[#4a4a4a] bg-white border border-[#c9c4bb] rounded px-3 py-1.5 tracking-wide shadow-sm">
                       {tech}
                     </span>
                  ))}
                </motion.div>
             </div>

             <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
               className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 pt-10 border-t border-[#dddad4]"
             >
                <div className="md:pr-8 md:border-r border-[#dddad4]">
                  <div className="text-[10px] tracking-[0.16em] uppercase text-[#8a8a8a] font-medium mb-2">Project Type</div>
                  <strong className="text-[15px] font-medium text-[#1a1a1a] leading-snug block">Vertical SaaS-style<br/>operating system</strong>
                </div>
                <div className="md:px-8 md:border-r border-[#dddad4]">
                  <div className="text-[10px] tracking-[0.16em] uppercase text-[#8a8a8a] font-medium mb-2">Primary Goal</div>
                  <strong className="text-[15px] font-medium text-[#1a1a1a] leading-snug block">Replace fragmented tools<br/>with one platform</strong>
                </div>
                <div className="md:pl-8">
                  <div className="text-[10px] tracking-[0.16em] uppercase text-[#8a8a8a] font-medium mb-2">Business Impact</div>
                  <strong className="text-[15px] font-medium text-[#1a1a1a] leading-snug block">Better retention, tighter ops,<br/>full business visibility</strong>
                </div>
             </motion.div>
          </div>

          {/* Hero Right */}
          <div className="bg-[#f3f2ee] p-6 md:p-12 lg:p-14 flex flex-col gap-8 md:gap-12">
            <div>
              <div className="text-[10px] tracking-[0.16em] uppercase text-[#8a8a8a] font-medium mb-4 pb-3 border-b border-[#dddad4]">
                Project Snapshot
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1px] bg-[#dddad4] border border-[#dddad4] rounded-lg overflow-hidden shadow-sm">
                {[
                  { l: "Industry", v: "Beauty / nail salon" },
                  { l: "Client Location", v: "United States" },
                  { l: "Project Scope", v: "Full-stack web platform" },
                  { l: "Role", v: "Design, architecture, frontend & backend" },
                  { l: "Focus Areas", v: "Retention, operations, brand experience" },
                  { l: "Deployment", v: "Vercel + Supabase" }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-4 lg:p-5">
                    <div className="text-[10px] tracking-[0.14em] uppercase text-[#8a8a8a] font-medium mb-1.5">{item.l}</div>
                    <strong className="text-[13px] font-medium text-[#1a1a1a] leading-snug block">{item.v}</strong>
                  </div>
                ))}
              </div>
            </div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
               className="bg-[#1a1a1a] text-white rounded-xl p-8 shadow-xl shadow-black/10 relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9365e] rounded-full blur-[80px] opacity-20 -mr-10 -mt-10" />
               <p className="font-serif italic text-xl leading-relaxed text-white/95 relative z-10">
                 "Not a brochure website. Not a basic booking app. A connected system built to run, grow, and retain clients inside one owned platform."
               </p>
               <div className="text-[11px] tracking-[0.14em] uppercase text-white/45 mt-4 relative z-10">
                 Case Study Positioning Statement
               </div>
            </motion.div>
          </div>
        </div>

        {/* SECTION 1: EXEC SUMMARY */}
        <section className="border-b border-[#dddad4] px-6 md:px-16 lg:px-20 py-16 lg:py-20">
           <FadeIn className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-end border-b border-[#dddad4] pb-10 mb-10">
              <div>
                 <div className="inline-block text-[10px] font-semibold tracking-[0.16em] uppercase text-[#c9365e] bg-[#f5e8ec] px-2.5 py-1 rounded mb-3">
                   01 · Executive Summary
                 </div>
                 <h2 className="font-serif text-4xl lg:text-5xl leading-[1.05] tracking-tight text-[#1a1a1a]">What this platform actually does</h2>
              </div>
              <p className="text-base font-light text-[#4a4a4a] leading-relaxed">
                Glitz & Glamour OS was built as a single source of truth for the business. Every touchpoint
                a client has — finding the salon, booking an appointment, earning rewards, getting reminders —
                now lives inside one branded product. The owner manages everything from one admin panel.
              </p>
           </FadeIn>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
             {[
                { icon: Workflow, label: "Customer Lifecycle", value: "End-to-end", desc: "Discovery, booking, follow-up, rewards, referrals, and reviews — all in one product." },
                { icon: Building2, label: "Operations", value: "Unified", desc: "Admin dashboard, CRM, bookings, communications, and content publishing — all connected." },
                { icon: Crown, label: "Retention Engine", value: "Built-in", desc: "Loyalty cards, milestone rewards, birthday perks, referral links, and wallet-based engagement." },
                { icon: Sparkles, label: "Client Experience", value: "Premium", desc: "Branded booking flow, mobile-first account area, and native wallet passes for returning clients." }
             ].map((kpi, i) => (
                <FadeIn key={i} delay={i * 0.1} className="bg-white border border-[#dddad4] rounded-xl p-6 lg:p-8 hover:shadow-lg hover:border-[#c9c4bb] transition-all group">
                   <kpi.icon className="text-[#c9365e] mb-4 group-hover:scale-110 transition-transform" size={24} strokeWidth={1.5} />
                   <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#c9365e] mb-3">{kpi.label}</div>
                   <div className="font-serif text-3xl lg:text-4xl leading-none text-[#1a1a1a] mb-3">{kpi.value}</div>
                   <p className="text-[13px] font-light text-[#4a4a4a] leading-relaxed">{kpi.desc}</p>
                </FadeIn>
             ))}
           </div>
        </section>

        {/* SECTION 2: THE PROBLEM */}
        <section className="border-b border-[#dddad4]">
           <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-0">
             <div className="border-b lg:border-b-0 lg:border-r border-[#dddad4] px-6 md:px-16 lg:px-12 py-12 lg:py-16 bg-[#fafaf8]">
                <div className="inline-block text-[10px] font-semibold tracking-[0.16em] uppercase text-[#c9365e] bg-[#f5e8ec] px-2.5 py-1 rounded mb-3">
                  02 · The Problem
                </div>
                <h2 className="font-serif text-3xl leading-tight text-[#1a1a1a] mb-4">Why the old setup wasn't working</h2>
                <p className="text-sm font-light text-[#4a4a4a] leading-relaxed">
                  Most small service businesses run on four or five separate tools stitched together with manual effort.
                  That creates friction, lost data, and a weaker client experience.
                </p>
             </div>
             <div className="px-6 md:px-16 lg:px-20 py-12 lg:py-16 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-[#dddad4] rounded-xl overflow-hidden shadow-sm">
                  {[
                    { no: 1, title: "Fragmented tools", desc: "Bookings, loyalty, reviews, marketing, and reporting each lived in a separate system with no shared data." },
                    { no: 2, title: "Manual overhead", desc: "Staff spent time on manual follow-ups and copy-pasting between systems instead of focusing on the client." },
                    { no: 3, title: "Weak retention", desc: "No single place for clients to see their loyalty progress, past visits, or upcoming appointments under the brand." },
                    { no: 4, title: "No real visibility", desc: "The owner had no first-party data dashboard. Business decisions relied on disconnected reports from third-party apps." }
                  ].map((step, i) => (
                    <FadeIn key={i} delay={i * 0.1} className="p-6 lg:p-8 bg-white border-b sm:border-b-0 sm:border-r last:border-0 border-[#dddad4] relative">
                       <div className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-[13px] font-semibold mb-5 shadow-md">
                         {step.no}
                       </div>
                       <h4 className="text-[15px] font-semibold text-[#1a1a1a] mb-2">{step.title}</h4>
                       <p className="text-[13px] font-light text-[#4a4a4a] leading-relaxed">{step.desc}</p>
                    </FadeIn>
                  ))}
                </div>

                <FadeIn delay={0.4} className="mt-8 bg-[#f7f0e4] border border-[#dfc99a] rounded-xl p-8 lg:p-10 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10"><Workflow size={100} /></div>
                   <p className="font-serif italic text-xl lg:text-2xl leading-relaxed text-[#1a1a1a] relative z-10 max-w-[45ch]">
                     The solution was to build one connected system from scratch — designed around how this specific business actually runs, not around generic templates.
                   </p>
                </FadeIn>
             </div>
           </div>
        </section>

        {/* SECTION 3: ARCHITECTURE */}
        <section className="border-b border-[#dddad4]">
           <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-0">
             <div className="border-b lg:border-b-0 lg:border-r border-[#dddad4] px-6 md:px-16 lg:px-12 py-12 lg:py-16 bg-[#fafaf8]">
                <div className="inline-block text-[10px] font-semibold tracking-[0.16em] uppercase text-[#c9365e] bg-[#f5e8ec] px-2.5 py-1 rounded mb-3">
                  03 · Architecture
                </div>
                <h2 className="font-serif text-3xl leading-tight text-[#1a1a1a] mb-4">How the system is structured</h2>
                <p className="text-sm font-light text-[#4a4a4a] leading-relaxed">
                  The platform is built around meaningful business objects — not isolated pages.
                  Every feature connects back to a central data model.
                </p>
             </div>
             <div className="px-6 md:px-16 lg:px-20 py-12 lg:py-16 bg-[#fafaf8]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {[
                    { title: "Data foundation", icon: Globe, desc: "Core data entities include users, admin users, services, bookings, loyalty cards, stamps, reviews, referrals, wallet devices, page views, and notification logs — all connected in one schema." },
                    { title: "Access control", icon: Lock, desc: "Customer sign-in and admin access are separated by design. Clients only see their own data. Admins see everything. No shared login, no role confusion." },
                    { title: "Workflow-driven backend", icon: Code2, desc: "API routes handle booking state transitions, wallet updates, media uploads, review requests, notification dispatch, and analytics — all as platform logic, not one-off scripts." }
                  ].map((card, i) => (
                    <FadeIn key={i} delay={i * 0.1} className="bg-white border border-[#dddad4] rounded-xl p-6 lg:p-8 shadow-sm">
                       <card.icon className="text-[#c9365e] mb-4" size={24} strokeWidth={1.5} />
                       <h3 className="font-serif text-2xl leading-tight text-[#1a1a1a] mb-3">{card.title}</h3>
                       <p className="text-[14px] font-light text-[#4a4a4a] leading-relaxed">{card.desc}</p>
                    </FadeIn>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FadeIn delay={0.3} className="bg-white border border-[#dddad4] rounded-xl p-6 lg:p-8 shadow-sm">
                     <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#8a8a8a] mb-3">Primary Stack</div>
                     <h4 className="text-[15px] font-semibold text-[#1a1a1a] mb-2 tracking-tight">Next.js + Prisma + PostgreSQL</h4>
                     <p className="text-[14px] font-light text-[#4a4a4a] leading-relaxed">A solid foundation for a product that needs public pages, authenticated client areas, admin workflows, structured data, and custom backend behavior — inside one maintainable codebase.</p>
                   </FadeIn>
                   <FadeIn delay={0.4} className="bg-white border border-[#dddad4] rounded-xl p-6 lg:p-8 shadow-sm">
                     <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#8a8a8a] mb-3">Supporting Integrations</div>
                     <h4 className="text-[15px] font-semibold text-[#1a1a1a] mb-2 tracking-tight">Wallets · Notifications · Cloud storage · Image processing</h4>
                     <p className="text-[14px] font-light text-[#4a4a4a] leading-relaxed">These integrations move the platform beyond basic CRUD. They give it mobile ecosystem hooks, first-party communication infrastructure, and real content management workflows.</p>
                   </FadeIn>
                </div>
             </div>
           </div>
        </section>

        {/* SECTION 4: FEATURE SURFACES */}
        <section className="border-b border-[#dddad4] px-6 md:px-16 lg:px-20 py-16 lg:py-20 bg-[#f3f2ee]">
           <FadeIn className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-end border-b border-[#dddad4] pb-10 mb-10">
              <div>
                 <div className="inline-block text-[10px] font-semibold tracking-[0.16em] uppercase text-[#c9365e] bg-[#f5e8ec] px-2.5 py-1 rounded mb-3 border border-[#e8b0bf]">
                   04 · Feature Surfaces
                 </div>
                 <h2 className="font-serif text-4xl lg:text-5xl leading-[1.05] tracking-tight text-[#1a1a1a]">What clients and the owner actually see</h2>
              </div>
              <p className="text-base font-light text-[#4a4a4a] leading-relaxed">
                The platform surfaces shown below cover the full client and admin experience natively dynamically adapting to mobile or desktop environments.
              </p>
           </FadeIn>

           <div className="flex flex-col gap-8 mb-10">
              <FadeIn className="border border-[#c9c4bb] rounded-2xl overflow-hidden bg-white shadow-xl shadow-black/5">
                 <div className="flex items-center gap-2 px-4 py-3 bg-[#f3f2ee] border-b border-[#dddad4]">
                    <div className="w-3 h-3 rounded-full bg-[#fc5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#fdbc2c]" />
                    <div className="w-3 h-3 rounded-full bg-[#29c940]" />
                    <span className="ml-auto text-[10px] tracking-[0.12em] uppercase text-[#8a8a8a] font-medium">Public website homepage</span>
                 </div>
                 <div className="bg-[#0A0A0A] w-full aspect-video relative flex items-center justify-center overflow-hidden">
                    <Image src="/casestudy/public-homepage-overview.png" alt="Homepage" fill className="object-cover object-top" unoptimized />
                 </div>
              </FadeIn>
              
              <FadeIn delay={0.2} className="border border-[#c9c4bb] rounded-2xl overflow-hidden bg-white shadow-xl shadow-black/5">
                 <div className="flex items-center gap-2 px-4 py-3 bg-[#f3f2ee] border-b border-[#dddad4]">
                    <div className="w-3 h-3 rounded-full bg-[#fc5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#fdbc2c]" />
                    <div className="w-3 h-3 rounded-full bg-[#29c940]" />
                    <span className="ml-auto text-[10px] tracking-[0.12em] uppercase text-[#8a8a8a] font-medium">Booking flow screen</span>
                 </div>
                 <div className="bg-[#0A0A0A] w-full aspect-[21/9] lg:aspect-[24/9] relative flex items-center justify-center overflow-hidden">
                    <Image src="/casestudy/booking-flow-screen.png" alt="Booking Flow" fill className="object-cover object-top" unoptimized />
                 </div>
              </FadeIn>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-6">
              {[
                { file: "client-profile-mobile.png", label: "Client profile" },
                { file: "apple-wallet-pass.png", label: "Apple Wallet" },
                { file: "google-wallet-pass.jpeg", label: "Google Wallet" },
                { file: "loyalty-client-screen.png", label: "Loyalty card" }
              ].map((phone, i) => (
                <FadeIn key={i} delay={i * 0.1} className="border border-[#c9c4bb] rounded-[2rem] bg-white p-2 sm:p-3 shadow-xl shadow-black/10">
                   <div className="aspect-[9/19.5] w-full relative rounded-[1.5rem] overflow-hidden border border-[#dddad4] bg-[#0A0A0A]">
                      <Image src={`/casestudy/${phone.file}`} alt={phone.label} fill className="object-cover" unoptimized/>
                   </div>
                   <div className="text-center text-[11px] font-medium text-[#4a4a4a] uppercase tracking-wide mt-3 mb-1">{phone.label}</div>
                </FadeIn>
              ))}
           </div>
        </section>

        {/* SECTION 6: LOYALTY & WALLETS */}
        <section className="border-b border-[#dddad4]">
           <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-0">
             <div className="border-b lg:border-b-0 lg:border-r border-[#dddad4] px-6 md:px-16 lg:px-12 py-12 lg:py-16 bg-[#fafaf8]">
                <div className="inline-block text-[10px] font-semibold tracking-[0.16em] uppercase text-[#c9365e] bg-[#f5e8ec] px-2.5 py-1 rounded mb-3">
                  06 · Loyalty & Wallets
                </div>
                <h2 className="font-serif text-3xl leading-tight text-[#1a1a1a] mb-4">The strongest retention layer</h2>
                <p className="text-sm font-light text-[#4a4a4a] leading-relaxed">
                  Loyalty here isn't a simple stamp counter. It's a full retention infrastructure with wallet integration,
                  milestone triggers, birthday incentives, and referral mechanics.
                </p>
             </div>
             <div className="px-6 md:px-16 lg:px-20 py-12 lg:py-16 bg-white overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                   <FadeIn className="bg-[#fafaf8] border border-[#dddad4] rounded-xl p-8 relative overflow-hidden group hover:border-[#8a8a8a] transition-colors">
                     <Wallet className="text-[#1a1a1a] mb-5 group-hover:scale-110 transition-transform" size={32} />
                     <h3 className="font-serif text-2xl leading-tight text-[#1a1a1a] mb-3">Apple Wallet</h3>
                     <p className="text-[14px] font-light text-[#4a4a4a] leading-relaxed relative z-10">iPhone clients can add a branded loyalty card directly to Apple Wallet. The system tracks registered devices and pushes updates when loyalty activity changes — no app download needed, no friction.</p>
                   </FadeIn>
                   <FadeIn delay={0.1} className="bg-[#fafaf8] border border-[#dddad4] rounded-xl p-8 relative overflow-hidden group hover:border-[#8a8a8a] transition-colors">
                     <Smartphone className="text-[#1a1a1a] mb-5 group-hover:scale-110 transition-transform" size={32} />
                     <h3 className="font-serif text-2xl leading-tight text-[#1a1a1a] mb-3">Google Wallet</h3>
                     <p className="text-[14px] font-light text-[#4a4a4a] leading-relaxed relative z-10">Android clients get the same experience through Google Wallet. The business has parity across both major mobile ecosystems, giving every returning client a native-feeling loyalty experience with automated Geofences.</p>
                   </FadeIn>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <FadeIn delay={0.2} className="bg-white border text-center border-[#dddad4] rounded-xl p-6 shadow-sm">
                    <h4 className="text-[15px] font-semibold text-[#1a1a1a] mb-2 tracking-tight">Milestone rewards</h4>
                    <p className="text-[13px] font-light text-[#4a4a4a] leading-relaxed">Structured triggers — like a 10-stamp unlock — make the loyalty card feel meaningful, not decorative.</p>
                  </FadeIn>
                  <FadeIn delay={0.3} className="bg-white border text-center border-[#dddad4] rounded-xl p-6 shadow-sm">
                    <h4 className="text-[15px] font-semibold text-[#1a1a1a] mb-2 tracking-tight">Birthday incentives</h4>
                    <p className="text-[13px] font-light text-[#4a4a4a] leading-relaxed">Time-based perks give the business a seasonal touchpoint to re-engage existing clients automatically.</p>
                  </FadeIn>
                  <FadeIn delay={0.4} className="bg-white border text-center border-[#dddad4] rounded-xl p-6 shadow-sm">
                    <h4 className="text-[15px] font-semibold text-[#1a1a1a] mb-2 tracking-tight">Referral mechanics</h4>
                    <p className="text-[13px] font-light text-[#4a4a4a] leading-relaxed">Referral links turn satisfied clients into a lightweight acquisition channel natively in the ecosystem.</p>
                  </FadeIn>
                </div>

                <FadeIn delay={0.5} className="border border-[#c9c4bb] rounded-2xl overflow-hidden bg-[#1a1a1a] shadow-xl shadow-black/10">
                   <div className="flex items-center gap-2 px-4 py-3 bg-[#f3f2ee] border-b border-[#dddad4]">
                      <div className="w-3 h-3 rounded-full bg-[#fc5f57]" />
                      <div className="w-3 h-3 rounded-full bg-[#fdbc2c]" />
                      <div className="w-3 h-3 rounded-full bg-[#29c940]" />
                      <span className="ml-auto text-[10px] tracking-[0.12em] uppercase text-[#8a8a8a] font-medium">Desktop Loyalty Pass Render</span>
                   </div>
                   <div className="bg-[#0A0A0A] w-full aspect-video relative flex items-center justify-center p-8">
                      <Image src="/casestudy/loyaltydesktop.png" alt="Loyalty Desktop" fill className="object-contain p-8" unoptimized />
                   </div>
                </FadeIn>
             </div>
           </div>
        </section>

        {/* SECTION 7: ADMIN & CRM */}
        <section className="border-b border-[#dddad4]">
           <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-0">
             <div className="border-b lg:border-b-0 lg:border-r border-[#dddad4] px-6 md:px-16 lg:px-12 py-12 lg:py-16 bg-[#fafaf8]">
                <div className="inline-block text-[10px] font-semibold tracking-[0.16em] uppercase text-[#c9365e] bg-[#f5e8ec] px-2.5 py-1 rounded mb-3">
                  07 · Admin & CRM
                </div>
                <h2 className="font-serif text-3xl leading-tight text-[#1a1a1a] mb-4">The owner's command center</h2>
                <p className="text-sm font-light text-[#4a4a4a] leading-relaxed">
                  The admin side is where the platform moves beyond a client-facing product.
                  It acts as a complete internal tool suite for operations, communication, and growth.
                </p>
             </div>
             <div className="px-6 md:px-16 lg:px-20 py-12 lg:py-16 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <FadeIn className="bg-white border border-[#dddad4] rounded-xl p-6 lg:p-8 shadow-sm">
                    <CalendarDays className="text-[#c9365e] mb-4" size={24} />
                    <h3 className="font-serif text-xl leading-tight text-[#1a1a1a] mb-3">Bookings & calendar</h3>
                    <p className="text-[13px] font-light text-[#4a4a4a] leading-relaxed">The owner can view pending appointments, check client reference images, and confirm or manage bookings — all from one screen without switching to a separate tool.</p>
                  </FadeIn>
                  <FadeIn delay={0.1} className="bg-white border border-[#dddad4] rounded-xl p-6 lg:p-8 shadow-sm">
                    <UserCheck className="text-[#c9365e] mb-4" size={24} />
                    <h3 className="font-serif text-xl leading-tight text-[#1a1a1a] mb-3">Customer CRM</h3>
                    <p className="text-[13px] font-light text-[#4a4a4a] leading-relaxed">Each client has a full internal record: contact details, booking history, private notes, loyalty status, and uploaded reference imagery. Deep, actionable context.</p>
                  </FadeIn>
                  <FadeIn delay={0.2} className="bg-white border border-[#dddad4] rounded-xl p-6 lg:p-8 shadow-sm">
                    <LineChart className="text-[#c9365e] mb-4" size={24} />
                    <h3 className="font-serif text-xl leading-tight text-[#1a1a1a] mb-3">Operational visibility</h3>
                    <p className="text-[13px] font-light text-[#4a4a4a] leading-relaxed">Notification logs, analytics, task tracking, and system observability give the owner more insight into how the business is running than third-party dashboards.</p>
                  </FadeIn>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FadeIn delay={0.3} className="border border-[#c9c4bb] rounded-xl overflow-hidden bg-white shadow-xl shadow-black/5">
                     <div className="bg-[#0A0A0A] w-full aspect-video relative flex items-center justify-center border-b border-[#dddad4]">
                        <Image src="/casestudy/admin-dashboard-overview.png" alt="Admin Dashboard" fill className="object-cover object-left-top" unoptimized />
                     </div>
                     <div className="px-4 py-3 bg-[#f3f2ee] text-xs font-semibold tracking-wide uppercase text-[#1a1a1a] text-center">Dashboard Analytics</div>
                   </FadeIn>
                   <FadeIn delay={0.4} className="border border-[#c9c4bb] rounded-xl overflow-hidden bg-white shadow-xl shadow-black/5">
                     <div className="bg-[#0A0A0A] w-full aspect-video relative flex items-center justify-center border-b border-[#dddad4]">
                        <Image src="/casestudy/customer-crm-screen.png" alt="Customer CRM" fill className="object-cover object-left-top" unoptimized />
                     </div>
                     <div className="px-4 py-3 bg-[#f3f2ee] text-xs font-semibold tracking-wide uppercase text-[#1a1a1a] text-center">Customer CRM View</div>
                   </FadeIn>
                </div>
             </div>
           </div>
        </section>

        {/* ACCENT STRIP */}
        <section className="bg-[#1a1a1a] text-white py-16 lg:py-24 px-6 md:px-16 lg:px-20 text-center relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#c9365e] rounded-full blur-[120px] opacity-20 pointer-events-none" />
           <p className="font-serif italic text-3xl md:text-4xl lg:text-5xl leading-[1.3] text-white/95 max-w-[30ch] mx-auto relative z-10">
             Glitz & Glamour OS isn't just a booking website. It's custom digital infrastructure for running, growing, and retaining clients inside a modern beauty business.
           </p>
        </section>

        {/* SECTION 11: OUTCOME */}
        <section className="px-6 md:px-16 lg:px-20 py-16 lg:py-20 bg-[#fafaf8]">
           <FadeIn className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-end pb-10 mb-10 border-b border-[#dddad4]">
              <div>
                 <div className="inline-block text-[10px] font-semibold tracking-[0.16em] uppercase text-[#c9365e] bg-[#f5e8ec] px-2.5 py-1 rounded mb-3">
                   11 · Outcome & Positioning
                 </div>
                 <h2 className="font-serif text-4xl lg:text-5xl leading-[1.05] tracking-tight text-[#1a1a1a]">What this case study leaves behind</h2>
              </div>
              <p className="text-base font-light text-[#4a4a4a] leading-relaxed">
                The main takeaway isn't that the interface looks polished. It's that the product solves the business
                at the workflow level — acquisition, conversion, operations, retention, and visibility all improve
                when the stack becomes unified.
              </p>
           </FadeIn>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Business transformation", desc: "The platform moves the business from running on disconnected third-party tools to owning its own tailored digital infrastructure. That's a fundamentally different starting position." },
                { title: "Client trust & retention", desc: "Branded flows, wallet convenience, and reward mechanics create a more premium and memorable experience — one that generic booking apps can't replicate." },
                { title: "Full-stack execution", desc: "This project communicates system design ability, product judgment, and full-stack execution. It connects SMS, Push Notifications, Cloud storage, and Analytics cleanly." }
              ].map((card, i) => (
                <FadeIn key={i} delay={i * 0.1} className="bg-white border border-[#c9c4bb] rounded-xl p-6 lg:p-8 shadow-md">
                   <div className="w-8 h-8 rounded bg-[#f5e8ec] text-[#c9365e] flex items-center justify-center mb-4"><CheckCircle2 size={16} strokeWidth={3} /></div>
                   <h4 className="text-[17px] font-semibold text-[#1a1a1a] mb-3 tracking-tight">{card.title}</h4>
                   <p className="text-[14px] font-light text-[#4a4a4a] leading-relaxed">{card.desc}</p>
                </FadeIn>
              ))}
           </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="max-w-[1920px] mx-auto pt-20 px-6">
        <div className="flex flex-col items-center justify-center text-center p-12 bg-[#f3f2ee] border border-[#dddad4] rounded-2xl">
           <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#8a8a8a] mb-2">Developed by</div>
           <div className="font-serif text-3xl md:text-4xl text-[#1a1a1a] tracking-tight">Zeeshan Khan</div>
           <p className="text-xs text-[#8a8a8a] mt-8 max-w-2xl mx-auto italic font-light">
             This case study is published with the full knowledge and consent of the client. 
             All product details, branding, and platform features are shared for portfolio purposes only.
           </p>
        </div>
      </footer>
    </div>
  );
}
