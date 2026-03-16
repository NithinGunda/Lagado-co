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
              <a href="#" aria-label="Instagram" class="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
              </a>
              <a href="#" aria-label="Facebook" class="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="#" aria-label="Twitter" class="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" aria-label="Pinterest" class="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.425 1.81-2.425.853 0 1.265.64 1.265 1.408 0 .858-.546 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.745 2.282a.3.3 0 01.069.288l-.278 1.133c-.044.183-.145.222-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.527-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.936.29 1.93.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
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
              <a href="tel:+919876543210" class="contact-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                <span>+91 98765 43210</span>
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
      grid-template-columns: 1.4fr 0.8fr 1fr;
      gap: 48px;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-md);
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
      display: inline-block;
      margin: 0 0 10px;
      text-decoration: none;
    }
    .ft-logo-link .logo-wordmark {
      font-family: var(--font-body);
      font-size: 1.4rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #fff;
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
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #fff;
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
  email = 'support@legadoandco.com';
}
