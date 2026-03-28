'use client';

import React, { useEffect } from 'react';

export default function CaseStudyPage() {
  useEffect(() => {
    document.querySelectorAll('[data-src]').forEach((el) => {
      const element = el as HTMLElement;
      const src = element.dataset.src;
      if (!src) return;
      const img = new Image();
      img.onload = () => {
        element.innerHTML = '';
        element.appendChild(img);
        element.classList.add('has-image');
        const body = element.closest('.screen-body') as HTMLElement | null;
        if (body) body.style.aspectRatio = 'unset';
      };
      img.src = src;
      img.alt = element.querySelector('strong')?.textContent || '';
    });
  }, []);

  return (
    <div dangerouslySetInnerHTML={{ __html: `<main class="page">

    <!-- ═══════════════════════════════════ HERO ═══════════════════════════════════ -->
    <div class="hero">
      <div class="hero-left">
        <div class="hero-top">
          <div class="kicker">
            <span class="kicker-dot"></span>
            Custom Business Platform · Beauty Industry
          </div>

          <h1>Glitz &amp;<br><em>Glamour</em><br>OS</h1>

          <p class="hero-desc">
            A fully custom platform built for a US-based nail salon — replacing five disconnected tools
            with one system that handles bookings, loyalty, wallet passes, CRM, content, analytics,
            and client communication, all under one brand.
          </p>

          <div class="tech-chips">
            <span class="chip">Next.js</span>
            <span class="chip">Prisma + PostgreSQL</span>
            <span class="chip">Apple Wallet API</span>
            <span class="chip">Google Wallet API</span>
            <span class="chip">Resend + SMS</span>
            <span class="chip">Vercel</span>
            <span class="chip">CMS + CRM + Analytics</span>
          </div>
        </div>

        <div class="hero-bottom">
          <div class="hero-stat">
            <div class="label">Project Type</div>
            <strong>Vertical SaaS-style<br>operating system</strong>
          </div>
          <div class="hero-stat">
            <div class="label">Primary Goal</div>
            <strong>Replace fragmented tools<br>with one platform</strong>
          </div>
          <div class="hero-stat">
            <div class="label">Business Impact</div>
            <strong>Better retention, tighter ops,<br>full business visibility</strong>
          </div>
        </div>
      </div>

      <div class="hero-right">
        <div class="meta-block">
          <div class="block-label">Project Snapshot</div>
          <div class="meta-grid">
            <div class="meta-item">
              <div class="label">Industry</div>
              <strong>Beauty / nail salon</strong>
            </div>
            <div class="meta-item">
              <div class="label">Client Location</div>
              <strong>United States</strong>
            </div>
            <div class="meta-item">
              <div class="label">Project Scope</div>
              <strong>Full-stack web platform</strong>
            </div>
            <div class="meta-item">
              <div class="label">Role</div>
              <strong>Design, architecture,<br>frontend & backend</strong>
            </div>
            <div class="meta-item">
              <div class="label">Focus Areas</div>
              <strong>Retention, operations,<br>brand experience</strong>
            </div>
            <div class="meta-item">
              <div class="label">Deployment</div>
              <strong>Vercel + Supabase</strong>
            </div>
          </div>
        </div>

        <div class="hero-callout">
          <p>Not a brochure website. Not a basic booking app. A connected system built to run, grow, and retain clients inside one owned platform.</p>
          <div class="attr">Case Study Positioning Statement</div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════ SECTION 1: EXECUTIVE SUMMARY ═══════════════════════════════════ -->
    <section class="section">
      <div class="section-inner">
        <div class="section-head-full">
          <div>
            <div class="section-tag">01 · Executive Summary</div>
            <h2 class="section-title" style="margin-top:12px;">What this platform actually does</h2>
          </div>
          <p>
            Glitz & Glamour OS was built as a single source of truth for the business. Every touchpoint
            a client has — finding the salon, booking an appointment, earning rewards, getting reminders —
            now lives inside one branded product. The owner manages everything from one admin panel.
          </p>
        </div>

        <div class="grid-4" style="margin-bottom:40px;">
          <div class="kpi-card">
            <div class="kpi-label">Customer Lifecycle</div>
            <div class="kpi-value">End&#8209;to&#8209;end</div>
            <p>Discovery, booking, follow-up, rewards, referrals, and reviews — all in one product.</p>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Operations</div>
            <div class="kpi-value">Unified</div>
            <p>Admin dashboard, CRM, bookings, communications, and content publishing — all connected.</p>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Retention Engine</div>
            <div class="kpi-value">Built&#8209;in</div>
            <p>Loyalty cards, milestone rewards, birthday perks, referral links, and wallet-based engagement.</p>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Client Experience</div>
            <div class="kpi-value">Premium</div>
            <p>Branded booking flow, mobile-first account area, and native wallet passes for returning clients.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════ SECTION 2: THE PROBLEM ═══════════════════════════════════ -->
    <section class="section">
      <div class="section-inner">
        <div class="section-with-sidebar">
          <div class="section-sidebar">
            <div class="section-tag">02 · The Problem</div>
            <h2 class="sidebar-title">Why the old setup wasn't working</h2>
            <p class="sidebar-desc">
              Most small service businesses run on four or five separate tools stitched together with manual effort.
              That creates friction, lost data, and a weaker client experience.
            </p>
          </div>
          <div class="section-body">
            <div class="timeline">
              <div class="timeline-step">
                <div class="step-no">1</div>
                <h4>Fragmented tools</h4>
                <p>Bookings, loyalty, reviews, marketing, and reporting each lived in a separate system with no shared data.</p>
              </div>
              <div class="timeline-step">
                <div class="step-no">2</div>
                <h4>Manual overhead</h4>
                <p>Staff spent time on manual follow-ups and copy-pasting between systems instead of focusing on the client.</p>
              </div>
              <div class="timeline-step">
                <div class="step-no">3</div>
                <h4>Weak retention</h4>
                <p>No single place for clients to see their loyalty progress, past visits, or upcoming appointments under the brand.</p>
              </div>
              <div class="timeline-step">
                <div class="step-no">4</div>
                <h4>No real visibility</h4>
                <p>The owner had no first-party data dashboard. Business decisions relied on disconnected reports from third-party apps.</p>
              </div>
            </div>

            <div class="callout" style="margin-top:24px;">
              <p>The solution was to build one connected system from scratch — designed around how this specific business actually runs, not around generic templates.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════ SECTION 3: ARCHITECTURE ═══════════════════════════════════ -->
    <section class="section">
      <div class="section-inner">
        <div class="section-with-sidebar">
          <div class="section-sidebar">
            <div class="section-tag">03 · Architecture</div>
            <h2 class="sidebar-title">How the system is structured</h2>
            <p class="sidebar-desc">
              The platform is built around meaningful business objects — not isolated pages.
              Every feature connects back to a central data model.
            </p>
          </div>
          <div class="section-body">
            <div class="grid-3" style="margin-bottom:24px;">
              <div class="card">
                <h3>Data foundation</h3>
                <p>Core data entities include users, admin users, services, bookings, loyalty cards, stamps, reviews, referrals, wallet devices, page views, and notification logs — all connected in one schema.</p>
              </div>
              <div class="card">
                <h3>Access control</h3>
                <p>Customer sign-in and admin access are separated by design. Clients only see their own data. Admins see everything. No shared login, no role confusion.</p>
              </div>
              <div class="card">
                <h3>Workflow-driven backend</h3>
                <p>API routes handle booking state transitions, wallet updates, media uploads, review requests, notification dispatch, and analytics — all as platform logic, not one-off scripts.</p>
              </div>
            </div>

            <div class="two-col-even">
              <div class="card">
                <div class="card-micro">Primary Stack</div>
                <h4>Next.js + Prisma + PostgreSQL</h4>
                <p>A solid foundation for a product that needs public pages, authenticated client areas, admin workflows, structured data, and custom backend behavior — inside one maintainable codebase.</p>
              </div>
              <div class="card">
                <div class="card-micro">Supporting Integrations</div>
                <h4>Wallets · Notifications · Cloud storage · Image processing</h4>
                <p>These integrations move the platform beyond basic CRUD. They give it mobile ecosystem hooks, first-party communication infrastructure, and real content management workflows.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════ SECTION 4: FEATURE SURFACES ═══════════════════════════════════ -->
    <section class="section">
      <div class="section-inner">
        <div class="section-head-full">
          <div>
            <div class="section-tag">04 · Feature Surfaces</div>
            <h2 class="section-title" style="margin-top:12px;">What clients and the owner actually see</h2>
          </div>
          <p>
            The platform surfaces shown below cover the full client and admin experience.
          </p>
        </div>

        <div class="device-wrap">
          <div class="screen">
            <div class="screen-bar">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
            <div class="screen-body">
              <div class="screen-placeholder" data-src="/casestudy/public-homepage-overview.png">
                <strong>Public website homepage</strong>
              </div>
            </div>
          </div>

          <div class="screen">
            <div class="screen-bar">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
            <div class="screen-body">
              <div class="screen-placeholder" data-src="/casestudy/booking-flow-screen.png">
                <strong>Booking flow</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="phone-row">
          <div class="phone">
            <div class="phone-body" data-src="/casestudy/client-profile-mobile.png">
              <strong>Client profile</strong>
            </div>
          </div>
          <div class="phone">
            <div class="phone-body" data-src="/casestudy/apple-wallet-pass.png">
              <strong>Apple Wallet pass</strong>
            </div>
          </div>
          <div class="phone">
            <div class="phone-body" data-src="/casestudy/google-wallet-pass.jpeg">
              <strong>Google Wallet pass</strong>
            </div>
          </div>
          <div class="phone">
            <div class="phone-body" data-src="/casestudy/loyalty-client-screen.png">
              <strong>Loyalty card</strong>
            </div>
          </div>
          <div class="phone">
            <div class="phone-body" data-src="/casestudy/booking-confirmation-mobile.png">
              <strong>Booking confirmation</strong>
            </div>
          </div>
          <div class="phone">
            <div class="phone-body" data-src="/casestudy/referral-screen-mobile.png">
              <strong>Referral screen</strong>
            </div>
          </div>
          <div class="phone">
            <div class="phone-body" data-src="/casestudy/services-browse-mobile.png">
              <strong>Services browse</strong>
            </div>
          </div>
          <div class="phone">
            <div class="phone-body" data-src="/casestudy/chat-ai-mobile.png">
              <strong>AI chat</strong>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════ SECTION 5: CLIENT EXPERIENCE ═══════════════════════════════════ -->
    <section class="section">
      <div class="section-inner">
        <div class="section-with-sidebar">
          <div class="section-sidebar">
            <div class="section-tag">05 · Client Experience</div>
            <h2 class="sidebar-title">Discovery, booking, loyalty, engagement</h2>
            <p class="sidebar-desc">
              The client-facing side is designed to convert and keep clients. Every step from finding the salon
              to becoming a loyal regular is handled inside one brand experience.
            </p>
          </div>
          <div class="section-body">
            <div class="grid-2">
              <div class="card">
                <div class="card-micro">01 · Discovery & Trust</div>
                <h3>Portfolio-first website</h3>
                <p>The homepage, services page, gallery, and blog work together as an acquisition layer. It's not just presenting services — it's building trust through visuals, clarity, and content.</p>
                <ul>
                  <li>Dynamic homepage with strong first impression</li>
                  <li>Service browsing with pricing and descriptions</li>
                  <li>Gallery showcasing craftsmanship and results</li>
                  <li>Blog engine for local SEO and authority</li>
                </ul>
              </div>
              <div class="card">
                <div class="card-micro">02 · Conversion</div>
                <h3>Custom booking funnel</h3>
                <p>Instead of redirecting clients to a generic third-party scheduler, the platform keeps them inside the brand. That preserves trust and captures richer booking context before the appointment starts.</p>
                <ul>
                  <li>Service and add-on selection</li>
                  <li>Date and time scheduling</li>
                  <li>Inspiration image uploads</li>
                  <li>Policy and waiver acknowledgment</li>
                </ul>
              </div>
              <div class="card">
                <div class="card-micro">03 · Retention Loop</div>
                <h3>Profile, loyalty, referrals</h3>
                <p>Logged-in clients get more than a receipt page. Their account becomes a repeat-visit surface with booking history, loyalty progress, earned perks, and referral mechanics.</p>
                <ul>
                  <li>Past and upcoming appointments</li>
                  <li>Digital loyalty card progress</li>
                  <li>Referral code generation</li>
                  <li>Birthday and milestone reward visibility</li>
                </ul>
              </div>
              <div class="card">
                <div class="card-micro">04 · Ongoing Engagement</div>
                <h3>Chat + reviews</h3>
                <p>The experience doesn't stop after booking. An AI chat layer handles repetitive questions, while the review system turns happy appointments into captured social proof.</p>
                <ul>
                  <li>AI assistant for service and booking queries</li>
                  <li>Secure review request links</li>
                  <li>Support for review media uploads</li>
                  <li>Lower support friction, higher trust</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════ SECTION 6: LOYALTY & WALLET ═══════════════════════════════════ -->
    <section class="section">
      <div class="section-inner">
        <div class="section-with-sidebar">
          <div class="section-sidebar">
            <div class="section-tag">06 · Loyalty & Wallets</div>
            <h2 class="sidebar-title">The strongest retention layer</h2>
            <p class="sidebar-desc">
              Loyalty here isn't a simple stamp counter. It's a full retention infrastructure with wallet integration,
              milestone triggers, birthday incentives, and referral mechanics.
            </p>
          </div>
          <div class="section-body">
            <div class="two-col-even" style="margin-bottom:20px;">
              <div class="card">
                <h3>Apple Wallet</h3>
                <p>iPhone clients can add a branded loyalty card directly to Apple Wallet. The system tracks registered devices and pushes updates when loyalty activity changes — no app download needed, no friction.</p>
              </div>
              <div class="card">
                <h3>Google Wallet</h3>
                <p>Android clients get the same experience through Google Wallet. The business has parity across both major mobile ecosystems, giving every returning client a native-feeling loyalty experience.</p>
              </div>
            </div>

            <div class="grid-3" style="margin-bottom:28px;">
              <div class="card">
                <h4>Milestone rewards</h4>
                <p>Structured triggers — like a 10-stamp unlock — make the loyalty card feel meaningful, not decorative. Clients have a real reason to come back.</p>
              </div>
              <div class="card">
                <h4>Birthday incentives</h4>
                <p>Time-based perks give the business a seasonal touchpoint to re-engage existing clients without needing a separate email tool.</p>
              </div>
              <div class="card">
                <h4>Referral mechanics</h4>
                <p>Referral links turn satisfied clients into a lightweight acquisition channel. No third-party referral software needed.</p>
              </div>
            </div>

            <div class="device-wrap">
              <div class="screen">
                <div class="screen-bar">
                  <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
                <div class="screen-body">
                  <div class="screen-placeholder" data-src="/casestudy/loyaltydesktop.png">
                    <strong>Loyalty card — client view</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════ SECTION 7: ADMIN & CRM ═══════════════════════════════════ -->
    <section class="section">
      <div class="section-inner">
        <div class="section-with-sidebar">
          <div class="section-sidebar">
            <div class="section-tag">07 · Admin & CRM</div>
            <h2 class="sidebar-title">The owner's command center</h2>
            <p class="sidebar-desc">
              The admin side is where the platform moves beyond a client-facing product.
              It acts as a complete internal tool suite for operations, communication, and growth.
            </p>
          </div>
          <div class="section-body">
            <div class="grid-3" style="margin-bottom:28px;">
              <div class="card">
                <h3>Bookings & calendar</h3>
                <p>The owner can view pending appointments, check client reference images, and confirm or manage bookings — all from one screen without switching to a separate scheduling tool.</p>
              </div>
              <div class="card">
                <h3>Customer CRM</h3>
                <p>Each client has a full internal record: contact details, booking history, private notes, loyalty status, and uploaded reference imagery. Richer context than any generic booking system provides.</p>
              </div>
              <div class="card">
                <h3>Operational visibility</h3>
                <p>Notification logs, analytics, task tracking, and system observability give the owner more insight into how the business is running than any third-party dashboard would.</p>
              </div>
            </div>

            <div class="device-wrap">
              <div class="screen">
                <div class="screen-bar">
                  <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
                <div class="screen-body">
                  <div class="screen-placeholder" data-src="/casestudy/admin-dashboard-overview.png">
                    <strong>Admin dashboard overview</strong>
                  </div>
                </div>
              </div>

              <div class="screen">
                <div class="screen-bar">
                  <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
                <div class="screen-body">
                  <div class="screen-placeholder" data-src="/casestudy/booking-management-screen.png">
                    <strong>Booking management screen</strong>
                  </div>
                </div>
              </div>

              <div class="screen">
                <div class="screen-bar">
                  <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
                <div class="screen-body">
                  <div class="screen-placeholder" data-src="/casestudy/customer-crm-screen.png">
                    <strong>Customer CRM screen</strong>
                  </div>
                </div>
              </div>

              <div class="screen">
                <div class="screen-bar">
                  <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
                <div class="screen-body">
                  <div class="screen-placeholder" data-src="/casestudy/services-management-screen.png">
                    <strong>Services management</strong>
                  </div>
                </div>
              </div>

              <div class="screen">
                <div class="screen-bar">
                  <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
                <div class="screen-body">
                  <div class="screen-placeholder" data-src="/casestudy/reviews-management-screen.png">
                    <strong>Reviews management</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════ SECTION 8: MARKETING & GROWTH ═══════════════════════════════════ -->
    <section class="section">
      <div class="section-inner">
        <div class="section-with-sidebar">
          <div class="section-sidebar">
            <div class="section-tag">08 · Marketing & Growth</div>
            <h2 class="sidebar-title">Owned acquisition and reputation systems</h2>
            <p class="sidebar-desc">
              The platform doesn't just run operations. It also builds acquisition channels
              the business owns — through content, reviews, and re-engagement.
            </p>
          </div>
          <div class="section-body">
            <div class="grid-2" style="margin-bottom:24px;">
              <div class="card">
                <h4>SEO content engine</h4>
                <p>An integrated blog gives the business a direct channel for local search traffic, education, and branded content — without needing a separate CMS or marketing tool.</p>
              </div>
              <div class="card">
                <h4>Review generation workflow</h4>
                <p>After a successful appointment, the owner can send a secure review link to the client. Reputation-building becomes an active process, not something left to chance.</p>
              </div>
              <div class="card">
                <h4>Verified review logic</h4>
                <p>Review submission is tied back to completed appointments, which supports authenticity and reduces low-trust or fake submissions creeping into the record.</p>
              </div>
              <div class="card">
                <h4>Legacy proof preservation</h4>
                <p>Older review history can be imported or synchronized, so the business doesn't lose social proof when migrating away from a previous platform.</p>
              </div>
            </div>

            <div class="device-wrap">
              <div class="screen">
                <div class="screen-bar">
                  <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
                <div class="screen-body">
                  <div class="screen-placeholder" data-src="/casestudy/content-management-screen.png">
                    <strong>Content management screen</strong>
                  </div>
                </div>
              </div>
              <div class="screen">
                <div class="screen-bar">
                  <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
                <div class="screen-body">
                  <div class="screen-placeholder" data-src="/casestudy/analytics-dashboard-screen.png">
                    <strong>Analytics dashboard</strong>
                  </div>
                </div>
              </div>

              <div class="screen">
                <div class="screen-bar">
                  <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
                <div class="screen-body">
                  <div class="screen-placeholder" data-src="/casestudy/notification-log-screen.png">
                    <strong>Notification log</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════ SECTION 9: COMMUNICATIONS ═══════════════════════════════════ -->
    <section class="section">
      <div class="section-inner">
        <div class="section-with-sidebar">
          <div class="section-sidebar">
            <div class="section-tag">09 · Communications</div>
            <h2 class="sidebar-title">What makes the platform feel reliable</h2>
            <p class="sidebar-desc">
              Communication, logging, and analytics don't show on the surface — but they're what makes a platform
              feel complete to anyone who actually operates it day to day.
            </p>
          </div>
          <div class="section-body">
            <div class="grid-3" style="margin-bottom:24px;">
              <div class="card">
                <h4>Email + SMS workflows</h4>
                <p>Booking confirmations, reminders, reschedule notices, cancellations, loyalty milestones, and owner alerts are all built into the platform's core logic — not added via a third-party plugin.</p>
              </div>
              <div class="card">
                <h4>Notification log</h4>
                <p>Every outbound message attempt is recorded. That makes support easier, issue diagnosis faster, and gives the owner confidence that communications are actually being delivered.</p>
              </div>
              <div class="card">
                <h4>First-party analytics</h4>
                <p>Page tracking and event data is captured natively. The business has visibility into what clients are doing without depending entirely on Google Analytics or a third-party tool.</p>
              </div>
            </div>

            <div class="two-col-even">
              <div class="card">
                <div class="card-micro">Why it matters</div>
                <h4>Operational maturity</h4>
                <p>These features signal that the build was designed for real-world operation — not just a polished launch day. They support follow-up, debugging, observability, and iteration over time.</p>
              </div>
              <div class="card">
                <div class="card-micro">Best supporting screenshot</div>
                <h4>Analytics or notification log</h4>
                <p>If you have one especially strong admin screenshot, analytics or notifications work well here — they visually reinforce the "complete system" framing of the case study.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════ SECTION 10: TECH AUDIT ═══════════════════════════════════ -->
    <section class="section">
      <div class="section-inner">
        <div class="section-with-sidebar">
          <div class="section-sidebar">
            <div class="section-tag">10 · Technical Depth</div>
            <h2 class="sidebar-title">Why this is a strong portfolio piece</h2>
            <p class="sidebar-desc">
              This project shows breadth, systems thinking, and applied business logic — not just frontend skills.
              Multiple difficult areas are combined into one coherent product.
            </p>
          </div>
          <div class="section-body">
            <div class="grid-2" style="margin-bottom:28px;">
              <div class="card">
                <h4>Auth flows</h4>
                <p>Social sign-in, email authentication, onboarding, and a clean admin vs. customer separation — done properly with role-based access throughout.</p>
              </div>
              <div class="card">
                <h4>Domain modeling</h4>
                <p>Bookings, loyalty cards, rewards, CRM records, reviews, referrals, wallet devices, and content objects — all modeled and connected in one schema.</p>
              </div>
              <div class="card">
                <h4>Integration work</h4>
                <p>Apple Wallet, Google Wallet, email delivery, SMS, image handling, cloud storage, and analytics — real integrations, not placeholder APIs.</p>
              </div>
              <div class="card">
                <h4>Internal tooling</h4>
                <p>Admin dashboard, CRM, content management, notification log, analytics view, and task tracking — built as a proper internal product, not as an afterthought.</p>
              </div>
            </div>

            <div class="callout">
              <p>The strongest framing isn't "I built a salon website." It's "I designed and built a custom operating system for a service business — combining bookings, loyalty, wallet passes, CRM, analytics, and growth tools into one unified platform."</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════ ACCENT STRIP ═══════════════════════════════════ -->
    <div class="accent-strip">
      <p>Glitz & Glamour OS isn't just a booking website. It's custom digital infrastructure for running, growing, and retaining clients inside a modern beauty business — built and owned by the brand.</p>
    </div>

    <!-- ═══════════════════════════════════ SECTION 11: OUTCOME ═══════════════════════════════════ -->
    <section class="section">
      <div class="section-inner">
        <div class="section-head-full">
          <div>
            <div class="section-tag">11 · Outcome & Positioning</div>
            <h2 class="section-title" style="margin-top:12px;">What this case study should leave behind</h2>
          </div>
          <p>
            The main takeaway isn't that the interface looks polished. It's that the product solves the business
            at the workflow level — acquisition, conversion, operations, retention, and visibility all improve
            when the stack becomes unified.
          </p>
        </div>

        <div class="grid-3" style="margin-bottom:40px;">
          <div class="card">
            <h4>Business transformation</h4>
            <p>The platform moves the business from running on disconnected third-party tools to owning its own tailored digital infrastructure. That's a fundamentally different starting position.</p>
          </div>
          <div class="card">
            <h4>Client trust and retention</h4>
            <p>Branded flows, wallet convenience, and reward mechanics create a more premium and memorable experience — one that generic booking apps can't replicate.</p>
          </div>
          <div class="card">
            <h4>Signal to future clients</h4>
            <p>This project communicates system design ability, product judgment, and full-stack execution. It's the kind of work that earns a higher tier of client conversation.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <div class="footer" style="justify-content:center;text-align:center;">
      <div>
        <div style="font-size:11px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:var(--ink-3);margin-bottom:6px;">Designed & Developed by</div>
        <div style="font-family:'DM Serif Display',Georgia,serif;font-size:28px;color:var(--ink);letter-spacing:-0.01em;">Zeeshan Khan</div>
      </div>
    </div>

  </main>` }} />
  );
}
