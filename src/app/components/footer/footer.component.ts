import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer">
      <div class="footer-top">
        <div class="footer-inner">
          <!-- Brand -->
          <div class="ft-col ft-brand">
            <a routerLink="/" class="ft-logo-link" aria-label="Legado & Co home">
              <span class="logo-wordmark">Legado &amp; Co</span>
            </a>
            <p class="ft-tagline">Timeless Style, Quiet Confidence</p>
            <p class="ft-desc">Curating premium fashion for the modern individual who values quality, elegance, and sophistication.</p>
            <div class="ft-social">
              <a
                href="https://www.instagram.com/legadoandco/"
                class="social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Legado &amp; Co on Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
              </a>
            </div>
          </div>

          <!-- Customer Service -->
          <div class="ft-col">
            <h4>Customer Service</h4>
            <ul>
              <li><a routerLink="/profile">My Account</a></li>
              <li><a routerLink="/cart">Shopping Cart</a></li>
              <li><a [href]="'mailto:' + email">Contact Us</a></li>
              <li><a routerLink="/privacy">Privacy Policy</a></li>
              <li><a routerLink="/terms">Terms & Conditions</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div class="ft-col">
            <h4>Get In Touch</h4>
            <div class="ft-contact">
              <a [href]="'mailto:' + email" class="contact-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
                <span>{{ email }}</span>
              </a>
              <a [href]="phoneTel" class="contact-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                <span>{{ phoneDisplay }}</span>
              </a>
            </div>
            <div class="ft-payment">
              <span class="pay-label">Payment</span>
              <div class="pay-icons">
                <span class="pay-icon">Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="footer-bottom">
        <div class="footer-bottom-inner">
          <p>&copy; {{ year }} <span class="fb-brand">Legado & Co</span>. All rights reserved.</p>
          <div class="fb-links">
            <a routerLink="/privacy">Privacy</a>
            <span class="fb-sep">·</span>
            <a routerLink="/terms">Terms</a>
            <span class="fb-sep">·</span>
            <a routerLink="/sitemap">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host { display: block; }

    .footer {
      background: var(--btn-primary);
      color: #fff;
      margin-top: 0;
    }

    .footer-top {
      padding: 64px 0 48px;
    }

    .footer-inner {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.8fr) minmax(0, 1fr);
      gap: 48px;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-md);
    }

    .ft-col.ft-brand {
      min-width: 0;
    }

    .ft-col h4 {
      font-family: var(--font-heading);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #fff;
      margin: 0 0 20px;
      padding-bottom: 12px;
      position: relative;
    }
    .ft-col h4::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0;
      width: 24px; height: 2px;
      background: rgba(255,255,255,0.3);
    }

    .ft-logo-link {
      display: block;
      margin: 0 0 10px;
      text-decoration: none;
      min-width: 0;
      max-width: 100%;
    }
    .ft-logo-link .logo-wordmark {
      font-family: var(--font-body);
      font-size: var(--brand-wordmark-size, clamp(0.75rem, 1.65vw + 0.35rem, 1.35rem));
      font-weight: 700;
      letter-spacing: var(--brand-wordmark-tracking, clamp(0.06em, 0.4vw, 0.18em));
      text-transform: uppercase;
      color: #fff;
      line-height: 1.2;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: inline-block;
      vertical-align: top;
      -webkit-font-smoothing: antialiased;
    }
    .ft-logo-link:hover .logo-wordmark {
      opacity: 0.9;
    }

    .ft-tagline {
      font-style: italic;
      font-size: 12px;
      color: rgba(255,255,255,0.5);
      margin: 0 0 14px;
      letter-spacing: 0.5px;
    }

    .ft-desc {
      font-size: 13px;
      color: rgba(255,255,255,0.5);
      line-height: 1.7;
      max-width: 280px;
      margin: 0 0 20px;
    }

    .ft-social {
      display: flex;
      gap: 10px;
    }

    .social-link {
      width: 38px; height: 38px;
      border: 1px solid rgba(255,255,255,0.15);
      display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,0.6);
      transition: all 0.3s ease;
    }
    .social-link:hover {
      background: rgba(255,255,255,0.1);
      color: #fff;
      border-color: rgba(255,255,255,0.35);
      transform: translateY(-3px);
    }

    .ft-col ul {
      list-style: none; padding: 0; margin: 0;
    }
    .ft-col ul li {
      margin-bottom: 10px;
    }
    .ft-col ul a {
      color: rgba(255,255,255,0.55);
      font-size: 13px;
      text-decoration: none;
      display: inline-block;
      position: relative;
      transition: color 0.3s, transform 0.3s;
    }
    .ft-col ul a::after {
      content: '';
      position: absolute;
      bottom: -2px; left: 0;
      width: 0; height: 1px;
      background: rgba(255,255,255,0.5);
      transition: width 0.3s ease;
    }
    .ft-col ul a:hover {
      color: #fff;
      transform: translateX(4px);
    }
    .ft-col ul a:hover::after { width: 100%; }

    .ft-contact {
      display: flex; flex-direction: column; gap: 14px;
      margin-bottom: 24px;
    }
    .contact-row {
      display: flex; align-items: center; gap: 10px;
      color: rgba(255,255,255,0.55);
      font-size: 13px; text-decoration: none;
      transition: color 0.3s;
    }
    .contact-row svg { flex-shrink: 0; opacity: 0.5; }
    .contact-row:hover { color: #fff; }
    .contact-row:hover svg { opacity: 1; }

    .ft-payment {
      margin-top: 8px;
    }
    .pay-label {
      display: block; font-size: 11px;
      color: rgba(255,255,255,0.35);
      text-transform: uppercase; letter-spacing: 1px;
      margin-bottom: 8px; font-weight: 600;
    }
    .pay-icons {
      display: flex; gap: 6px;
    }
    .pay-icon {
      padding: 4px 10px;
      border: 1px solid rgba(255,255,255,0.12);
      font-size: 10px; font-weight: 700;
      letter-spacing: 1px;
      color: rgba(255,255,255,0.45);
    }

    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.08);
      padding: 20px 0;
    }
    .footer-bottom-inner {
      max-width: 1200px; margin: 0 auto;
      padding: 0 var(--spacing-md);
      display: flex; justify-content: space-between;
      align-items: center; flex-wrap: wrap; gap: 12px;
    }
    .footer-bottom p {
      margin: 0; font-size: 12px;
      color: rgba(255,255,255,0.35);
    }
    .fb-brand {
      font-family: var(--font-body);
      font-weight: 700;
      letter-spacing: var(--brand-wordmark-tracking, clamp(0.06em, 0.4vw, 0.18em));
      text-transform: uppercase;
      color: #fff;
      font-size: clamp(0.65rem, 1.2vw + 0.25rem, 0.85rem);
      -webkit-font-smoothing: antialiased;
    }
    .fb-links {
      display: flex; align-items: center; gap: 6px;
    }
    .fb-links a {
      color: rgba(255,255,255,0.35);
      font-size: 12px; text-decoration: none;
      transition: color 0.3s;
    }
    .fb-links a:hover { color: rgba(255,255,255,0.7); }
    .fb-sep { color: rgba(255,255,255,0.15); }

    @media (max-width: 968px) {
      .footer-inner {
        grid-template-columns: 1fr 1fr;
        gap: 36px;
      }
    }
    @media (max-width: 640px) {
      .footer-inner {
        grid-template-columns: 1fr;
        gap: 32px;
      }
      .ft-desc { max-width: 100%; }
      .footer-bottom-inner {
        flex-direction: column; text-align: center;
      }
    }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
  email = 'legadoandco2026@gmail.com';
  phoneDisplay = '+918019433344';
  phoneTel = 'tel:+918019433344';
}
