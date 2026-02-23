import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <!-- Brand Column -->
          <div class="footer-column">
            <h3 class="footer-logo">Legado & Co</h3>
            <p class="footer-tagline">Timeless Style, Quiet Confidence</p>
            <p class="footer-description">
              Curating premium fashion for the modern individual who values quality, elegance, and sophistication.
            </p>
          </div>

          <!-- Quick Links -->
          <div class="footer-column">
            <h4>Quick Links</h4>
            <ul class="footer-links">
              <li><a routerLink="/collections">Collections</a></li>
              <li><a routerLink="/mens">Men's</a></li>
              <li><a routerLink="/womens">Women's</a></li>
              <li><a routerLink="/our-story">Our Story</a></li>
              <li><a routerLink="/blog">Blog</a></li>
            </ul>
          </div>

          <!-- Customer Service -->
          <div class="footer-column">
            <h4>Customer Service</h4>
            <ul class="footer-links">
              <li><a routerLink="/profile">My Account</a></li>
              <li><a routerLink="/cart">Shopping Cart</a></li>
              <li><a [href]="'mailto:' + supportEmail">Contact Us</a></li>
              <li><a routerLink="/privacy">Privacy Policy</a></li>
              <li><a routerLink="/terms">Terms & Conditions</a></li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div class="footer-column">
            <h4>Get in Touch</h4>
            <div class="contact-info">
              <p>
                <strong>Email:</strong><br>
                <a [href]="'mailto:' + infoEmail">{{ infoEmail }}</a>
              </p>
              <p>
                <strong>Customer Support:</strong><br>
                <a [href]="'mailto:' + supportEmail">{{ supportEmail }}</a>
              </p>
            </div>
          </div>
        </div>

        <!-- Footer Bottom -->
        <div class="footer-bottom">
          <p>&copy; {{ currentYear }} Legado & Co. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--primary-dark);
      color: var(--text-white);
      padding: var(--spacing-md) 0 var(--spacing-sm);
      margin-top: var(--spacing-lg);
    }

    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-sm);
    }

    .footer-column h3,
    .footer-column h4 {
      color: var(--text-white);
      margin-bottom: 0.5rem;
      font-family: var(--font-heading);
      font-size: 0.95rem;
    }

    .footer-logo {
      font-family: var(--font-logo);
      font-size: 1.35rem;
      font-weight: 400;
      word-spacing: 0.2em;
      letter-spacing: 0.02em;
    }

    .footer-tagline {
      font-style: italic;
      color: var(--secondary-color);
      margin-bottom: 0.25rem;
      font-size: 11px;
    }

    .footer-description {
      color: rgba(255, 255, 255, 0.8);
      font-size: 11px;
      line-height: 1.4;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: 4px;
    }

    .footer-links a {
      color: rgba(255, 255, 255, 0.8);
      font-size: 12px;
      transition: var(--transition-normal);
    }

    .footer-links a:hover {
      color: var(--secondary-color);
      padding-left: 4px;
    }

    .contact-info p {
      margin-bottom: 0.5rem;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
    }

    .contact-info a {
      color: var(--secondary-color);
      transition: var(--transition-normal);
    }

    .contact-info a:hover {
      color: var(--text-white);
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: var(--spacing-sm);
      text-align: center;
      color: rgba(255, 255, 255, 0.6);
      font-size: 11px;
    }

    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr;
        gap: var(--spacing-sm);
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  infoEmail = 'support@legadoandco.com';
  supportEmail = 'support@legadoandco.com';
}
