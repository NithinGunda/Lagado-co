import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-our-story',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="story-page" (scroll)="onScroll($event)">

      <!-- ===== HERO BANNER ===== -->
      <section class="story-hero">
        <div class="hero-img-wrap">
          <img src="assets/ourstory.png" alt="Our Philosophy" class="hero-bg" />
        </div>
        <div class="hero-overlay"></div>
        <div class="hero-content" [class.visible]="animReady">
          <span class="hero-label">
            <span class="label-line"></span>
            <span>Est. 2024</span>
            <span class="label-line"></span>
          </span>
          <h1>Our Philosophy</h1>
          <p>Building a legacy of timeless elegance, one garment at a time.</p>
        </div>
      </section>

      <!-- ===== INTRO SECTION ===== -->
      <section class="intro-section">
        <div class="intro-inner">
          <div class="intro-text">
            <span class="section-label"><span class="label-bar"></span>Who We Are</span>
            <h2>Where Legacy<br/><em>Meets Fashion</em></h2>
            <p><span class="brand-name">Legado & Co</span> was born from a passion for timeless elegance and quality craftsmanship. Our name — "Legado," meaning <em>legacy</em> in Spanish — reflects our commitment to creating pieces that will be cherished for generations.</p>
            <p>We curate collections that blend classic design with modern sensibilities, ensuring each piece tells a story of refined taste and quiet confidence.</p>
          </div>
          <div class="intro-image">
            <img src="assets/homebanner2.png" alt="Legado & Co Fashion" loading="lazy" />
            <div class="img-accent"></div>
          </div>
        </div>
      </section>

      <!-- ===== FULL-WIDTH QUOTE ===== -->
      <section class="quote-section">
        <div class="quote-bg">
          <img src="assets/homebanner.png" alt="" loading="lazy" />
        </div>
        <div class="quote-overlay"></div>
        <div class="quote-content">
          <svg class="quote-mark" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
          <blockquote>True style isn't about following trends — it's about knowing who you are and dressing the part with confidence.</blockquote>
          <cite>— The Philosophy of <span class="brand-name">Legado & Co</span></cite>
        </div>
      </section>

      <!-- ===== MISSION SECTION ===== -->
      <section class="mission-section">
        <div class="mission-inner mission-inner-single">
          <div class="mission-text mission-text-center">
            <span class="section-label center"><span class="label-bar"></span>Our Mission</span>
            <h2>Empowering<br/><em>Individual Style</em></h2>
            <p>We are dedicated to providing premium fashion that empowers individuals to express their unique identity while maintaining the highest standards of quality and craftsmanship.</p>
            <p>Every piece in our collection is carefully selected to meet our exacting standards for design, materials, and construction — because you deserve nothing less.</p>
          </div>
        </div>
      </section>

      <!-- ===== VALUES ===== -->
      <section class="values-section">
        <div class="values-inner">
          <div class="values-header">
            <span class="section-label center"><span class="label-bar"></span>What We Stand For</span>
            <h2>Our Core Values</h2>
          </div>
          <div class="values-grid">
            <div class="value-card" *ngFor="let v of values; let i = index" [style.animation-delay]="i * 0.1 + 's'">
              <div class="value-num">0{{ i + 1 }}</div>
              <h3>{{ v.title }}</h3>
              <p>{{ v.desc }}</p>
              <div class="value-line"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== TIMELINE / JOURNEY ===== -->
      <section class="journey-section">
        <div class="journey-inner">
          <div class="journey-header">
            <span class="section-label center"><span class="label-bar"></span>Our Journey</span>
            <h2>The Path We've Walked</h2>
          </div>
          <div class="timeline">
            <div class="tl-item" *ngFor="let m of milestones; let i = index; let odd = odd" [class.tl-right]="odd">
              <div class="tl-dot"></div>
              <div class="tl-content">
                <span class="tl-year">{{ m.year }}</span>
                <h4>{{ m.title }}</h4>
                <p>{{ m.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== NUMBERS ===== -->
      <section class="stats-section">
        <div class="stats-inner">
          <div class="stat" *ngFor="let s of stats">
            <span class="stat-num">{{ s.num }}</span>
            <span class="stat-label">{{ s.label }}</span>
          </div>
        </div>
      </section>

      <!-- ===== CTA ===== -->
      <section class="cta-section">
        <div class="cta-bg">
          <img src="assets/buythelook3.png" alt="" loading="lazy" />
        </div>
        <div class="cta-overlay"></div>
        <div class="cta-content">
          <h2>Join Our Journey</h2>
          <p>Discover pieces that resonate with your personal style and build a wardrobe that tells your story.</p>
          <a routerLink="/collections" class="cta-btn">
            <span>Explore Collections</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .story-page { overflow-x: hidden; }

    .brand-name {
      font-family: var(--font-logo);
      font-weight: 400;
    }

    /* ===== HERO ===== */
    .story-hero {
      position: relative;
      height: 70vh;
      min-height: 420px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .hero-img-wrap {
      position: absolute; inset: 0;
    }
    .hero-bg {
      width: 100%; height: 100%;
      object-fit: cover; object-position: center 30%;
    }
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(
        160deg,
        rgba(10,20,40,0.75) 0%,
        rgba(15,30,55,0.6) 40%,
        rgba(20,40,70,0.75) 100%
      );
      z-index: 1;
    }
    .hero-content {
      position: relative; z-index: 2;
      text-align: center; color: #fff;
      max-width: 600px; padding: 0 var(--spacing-md);
    }
    .hero-content > * {
      opacity: 0; transform: translateY(24px);
      transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .hero-content.visible > * { opacity: 1; transform: translateY(0); }
    .hero-content.visible > :nth-child(1) { transition-delay: 0.2s; }
    .hero-content.visible > :nth-child(2) { transition-delay: 0.4s; }
    .hero-content.visible > :nth-child(3) { transition-delay: 0.6s; }

    .hero-label {
      display: flex; align-items: center; justify-content: center;
      gap: 14px; margin-bottom: 16px;
      font-size: 11px; font-weight: 700;
      letter-spacing: 3px; text-transform: uppercase;
      color: rgba(255,255,255,0.6);
    }
    .label-line {
      width: 40px; height: 1px;
      background: rgba(255,255,255,0.3);
    }

    .hero-content h1 {
      font-family: var(--font-heading);
      font-size: clamp(2.5rem, 6vw, 4rem);
      font-weight: 700; line-height: 1.1;
      margin: 0 0 16px; color: #fff;
      letter-spacing: -0.02em;
    }
    .hero-content p {
      font-size: clamp(1rem, 1.5vw, 1.15rem);
      color: rgba(255,255,255,0.7);
      line-height: 1.6; margin: 0;
    }

    /* ===== SHARED ===== */
    .section-label {
      display: flex; align-items: center; gap: 12px;
      font-size: 11px; font-weight: 700;
      letter-spacing: 3px; text-transform: uppercase;
      color: var(--text-muted); margin-bottom: 16px;
    }
    .section-label.center { justify-content: center; }
    .label-bar {
      width: 28px; height: 2px;
      background: var(--primary-color);
    }

    /* ===== INTRO ===== */
    .intro-section {
      padding: 100px 0;
      background: #fff;
    }
    .intro-inner {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 64px; align-items: center;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-md);
    }
    .intro-text h2 {
      font-family: var(--font-heading);
      font-size: clamp(1.8rem, 3vw, 2.4rem);
      font-weight: 700; color: var(--text-dark);
      line-height: 1.2; margin: 0 0 24px;
    }
    .intro-text h2 em {
      font-style: italic; color: var(--primary-color);
    }
    .intro-text p {
      color: var(--text-light);
      font-size: 0.95rem; line-height: 1.8;
      margin: 0 0 16px;
    }
    .intro-image {
      position: relative;
    }
    .intro-image img {
      width: 100%; height: 480px;
      object-fit: cover; display: block;
      position: relative; z-index: 1;
    }
    .img-accent {
      position: absolute;
      top: 20px; left: 20px; right: -20px; bottom: -20px;
      border: 2px solid var(--primary-color);
      opacity: 0.2; z-index: 0;
    }

    /* ===== QUOTE ===== */
    .quote-section {
      position: relative;
      padding: 120px 0;
      overflow: hidden;
    }
    .quote-bg {
      position: absolute; inset: 0;
    }
    .quote-bg img {
      width: 100%; height: 100%;
      object-fit: cover; object-position: center 40%;
    }
    .quote-overlay {
      position: absolute; inset: 0;
      background: rgba(10,20,40,0.82);
      z-index: 1;
    }
    .quote-content {
      position: relative; z-index: 2;
      max-width: 700px; margin: 0 auto;
      text-align: center; padding: 0 var(--spacing-md);
      color: #fff;
    }
    .quote-mark {
      color: rgba(232,197,71,0.4);
      margin-bottom: 24px;
    }
    blockquote {
      font-family: var(--font-heading);
      font-size: clamp(1.3rem, 2.5vw, 1.8rem);
      font-weight: 600; font-style: italic;
      line-height: 1.5; margin: 0 0 20px;
      color: #fff;
    }
    cite {
      font-style: normal;
      font-size: 0.85rem;
      color: rgba(255,255,255,0.5);
      letter-spacing: 1px;
      text-transform: uppercase;
      font-weight: 600;
    }

    /* ===== MISSION ===== */
    .mission-section {
      padding: 100px 0;
      background: var(--secondary-color);
    }
    .mission-inner {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 64px; align-items: center;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-md);
    }
    .mission-inner-single {
      grid-template-columns: 1fr;
      justify-items: center;
    }
    .mission-text-center {
      text-align: center;
      max-width: 640px;
      margin: 0 auto;
    }
    .mission-text h2 {
      font-family: var(--font-heading);
      font-size: clamp(1.8rem, 3vw, 2.4rem);
      font-weight: 700; color: var(--text-dark);
      line-height: 1.2; margin: 0 0 24px;
    }
    .mission-text h2 em {
      font-style: italic; color: var(--primary-color);
    }
    .mission-text p {
      color: var(--text-light);
      font-size: 0.95rem; line-height: 1.8;
      margin: 0 0 16px;
    }

    /* ===== VALUES ===== */
    .values-section {
      padding: 100px 0;
      background: #fff;
    }
    .values-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-md);
    }
    .values-header {
      text-align: center;
      margin-bottom: 56px;
    }
    .values-header h2 {
      font-family: var(--font-heading);
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      font-weight: 700; color: var(--text-dark);
      margin: 0;
    }
    .values-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }

    @keyframes valueIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .value-card {
      padding: 36px 28px;
      border: 1px solid var(--border-color);
      background: #fff;
      position: relative;
      transition: all 0.4s ease;
      animation: valueIn 0.6s ease both;
    }
    .value-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.08);
      border-color: transparent;
    }
    .value-num {
      font-family: var(--font-heading);
      font-size: 2.5rem; font-weight: 700;
      color: var(--border-color);
      line-height: 1; margin-bottom: 16px;
      transition: color 0.3s;
    }
    .value-card:hover .value-num { color: var(--primary-color); }
    .value-card h3 {
      font-family: var(--font-heading);
      font-size: 1.15rem; font-weight: 700;
      color: var(--text-dark); margin: 0 0 12px;
    }
    .value-card p {
      font-size: 0.88rem; color: var(--text-muted);
      line-height: 1.6; margin: 0;
    }
    .value-line {
      width: 0; height: 2px;
      background: var(--primary-color);
      margin-top: 20px;
      transition: width 0.4s ease;
    }
    .value-card:hover .value-line { width: 40px; }

    /* ===== JOURNEY / TIMELINE ===== */
    .journey-section {
      padding: 100px 0;
      background: var(--secondary-color);
    }
    .journey-inner {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 var(--spacing-md);
    }
    .journey-header {
      text-align: center;
      margin-bottom: 56px;
    }
    .journey-header h2 {
      font-family: var(--font-heading);
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      font-weight: 700; color: var(--text-dark);
      margin: 0;
    }
    .timeline {
      position: relative;
      padding-left: 40px;
    }
    .timeline::before {
      content: '';
      position: absolute; left: 8px; top: 0; bottom: 0;
      width: 2px;
      background: linear-gradient(to bottom, var(--primary-color), var(--border-color));
    }
    .tl-item {
      position: relative;
      padding: 0 0 48px 32px;
    }
    .tl-item:last-child { padding-bottom: 0; }
    .tl-dot {
      position: absolute; left: -36px; top: 4px;
      width: 14px; height: 14px;
      background: #fff;
      border: 3px solid var(--primary-color);
      border-radius: 50% !important;
      z-index: 1;
    }
    .tl-year {
      display: inline-block;
      font-size: 11px; font-weight: 800;
      letter-spacing: 2px; color: var(--primary-color);
      text-transform: uppercase;
      margin-bottom: 6px;
      padding: 3px 10px;
      background: rgba(60,90,153,0.08);
    }
    .tl-content h4 {
      font-family: var(--font-heading);
      font-size: 1.1rem; font-weight: 700;
      color: var(--text-dark); margin: 0 0 8px;
    }
    .tl-content p {
      font-size: 0.9rem; color: var(--text-muted);
      line-height: 1.6; margin: 0;
    }

    /* ===== STATS ===== */
    .stats-section {
      padding: 64px 0;
      background: var(--primary-color);
    }
    .stats-inner {
      display: flex;
      justify-content: center;
      gap: 80px;
      max-width: 900px;
      margin: 0 auto;
      padding: 0 var(--spacing-md);
      flex-wrap: wrap;
    }
    .stat {
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .stat-num {
      font-family: var(--font-heading);
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 700;
      color: #fff;
      line-height: 1;
    }
    .stat-label {
      font-size: 11px; font-weight: 700;
      letter-spacing: 2px; text-transform: uppercase;
      color: rgba(255,255,255,0.5);
    }

    /* ===== CTA ===== */
    .cta-section {
      position: relative;
      padding: 120px 0;
      overflow: hidden;
    }
    .cta-bg {
      position: absolute; inset: 0;
    }
    .cta-bg img {
      width: 100%; height: 100%;
      object-fit: cover;
    }
    .cta-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(10,20,40,0.8), rgba(30,58,95,0.85));
      z-index: 1;
    }
    .cta-content {
      position: relative; z-index: 2;
      text-align: center;
      max-width: 560px;
      margin: 0 auto;
      padding: 0 var(--spacing-md);
    }
    .cta-content h2 {
      font-family: var(--font-heading);
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      font-weight: 700; color: #fff;
      margin: 0 0 14px;
    }
    .cta-content p {
      color: rgba(255,255,255,0.65);
      font-size: 0.95rem; line-height: 1.6;
      margin: 0 0 32px;
    }
    .cta-btn {
      display: inline-flex;
      align-items: center; gap: 10px;
      padding: 16px 36px;
      background: #fff; color: var(--primary-color);
      font-size: 12px; font-weight: 700;
      letter-spacing: 2px; text-transform: uppercase;
      text-decoration: none;
      font-family: var(--font-body);
      transition: all 0.3s ease;
    }
    .cta-btn:hover {
      background: var(--secondary-color);
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    }
    .cta-btn svg { transition: transform 0.3s; }
    .cta-btn:hover svg { transform: translateX(4px); }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 968px) {
      .intro-inner,
      .mission-inner { grid-template-columns: 1fr; gap: 40px; }
      .intro-image img,
      .mission-image img { height: 340px; }
      .img-accent { display: none; }
      .values-grid { grid-template-columns: 1fr 1fr; }
      .stats-inner { gap: 40px; }
    }

    @media (max-width: 640px) {
      .story-hero { height: 55vh; min-height: 340px; }
      .values-grid { grid-template-columns: 1fr; }
      .stats-inner { gap: 32px; }
      .stat-num { font-size: 2rem; }
      .quote-section { padding: 80px 0; }
      blockquote { font-size: 1.2rem; }
      .timeline { padding-left: 32px; }
      .tl-dot { left: -28px; }
    }
  `]
})
export class OurStoryComponent implements OnInit, OnDestroy {
  animReady = false;
  private scrollY = 0;

  values = [
    { title: 'Quality', desc: 'We never compromise on the quality of materials or craftsmanship. Every stitch tells a story of excellence.' },
    { title: 'Elegance', desc: 'We believe in timeless design that transcends fleeting trends and celebrates enduring beauty.' },
    { title: 'Authenticity', desc: 'We celebrate individuality and authentic self-expression through thoughtful, honest design.' },
    { title: 'Sustainability', desc: 'We are committed to responsible practices, ethical sourcing, and a smaller environmental footprint.' }
  ];

  milestones = [
    { year: '2024', title: 'The Beginning', desc: 'Legado & Co was founded with a vision to redefine premium fashion — blending heritage craftsmanship with contemporary style.' },
    { year: '2024', title: 'First Collection', desc: 'Our debut collection launched to an overwhelming response, establishing our signature aesthetic of quiet confidence.' },
    { year: '2025', title: 'Growing Community', desc: 'We expanded our reach, building a loyal community of fashion-forward individuals who value quality over quantity.' },
    { year: '2026', title: 'The Road Ahead', desc: 'Continuing to innovate with new collections, sustainable materials, and an unwavering commitment to our customers.' }
  ];

  stats = [
    { num: '500+', label: 'Products Crafted' },
    { num: '100%', label: 'Quality Promise' }
  ];

  ngOnInit() {
    setTimeout(() => this.animReady = true, 200);
  }

  ngOnDestroy() {}

  onScroll(e: Event) {
    this.scrollY = (e.target as HTMLElement).scrollTop || 0;
  }
}
