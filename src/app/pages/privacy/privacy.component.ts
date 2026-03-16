import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="privacy-page">
      <div class="container">
        <h1 class="page-title">Privacy Policy</h1>
        <p class="last-updated">Last Updated: February 9, 2026</p>

        <div class="privacy-content">
          <section>
            <h2>1. Introduction</h2>
            <p>
              Legado & Co ("we," "our," or "us"), operated via the website <strong>www.legadoandco.com</strong>, is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, store, disclose, and safeguard your information when you visit our website, create an account, place an order, or interact with our services in any way.
            </p>
            <p>
              By using our website and services, you consent to the data practices described in this Privacy Policy. If you do not agree with any part of this policy, please discontinue use of our website and services immediately.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Information You Provide</h3>
            <p>When you register for an account, place an order, or contact us, we may collect the following personal information:</p>
            <ul>
              <li>Full name (first and last name)</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Shipping and billing address (including city, state, PIN code, and country)</li>
              <li>Account login credentials (email and encrypted password)</li>
              <li>Order history, preferences, and wishlist items</li>
            </ul>

            <h3>2.2 Payment Information</h3>
            <p>
              When you make a purchase, your payment is processed securely through our third-party payment gateway partner(s) such as Razorpay, Stripe, or similar PCI-DSS compliant payment processors. <strong>We do not store, collect, or have access to your full credit/debit card numbers, CVV, or banking credentials on our servers.</strong> All payment data is encrypted and transmitted directly to the payment processor using industry-standard SSL/TLS encryption (256-bit).
            </p>
            <p>We may receive and store the following transaction-related information from the payment processor:</p>
            <ul>
              <li>Transaction ID / Payment reference number</li>
              <li>Payment status (success, failure, pending)</li>
              <li>Last four digits of card number (for order confirmation purposes only)</li>
              <li>Payment method type (credit card, debit card, UPI, net banking, wallet)</li>
              <li>Billing address associated with the payment</li>
            </ul>

            <h3>2.3 Automatically Collected Information</h3>
            <p>When you visit our website, we automatically collect certain technical information, including:</p>
            <ul>
              <li>IP address, browser type, and version</li>
              <li>Operating system and device information</li>
              <li>Pages visited, time spent on pages, and navigation patterns</li>
              <li>Referring website/URL and search terms</li>
              <li>Cookies, session identifiers, and similar tracking technologies</li>
              <li>Geographic location (based on IP address)</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul>
              <li><strong>Order Processing & Fulfillment:</strong> To process, confirm, and ship your orders; to send order confirmations, shipping updates, and delivery notifications.</li>
              <li><strong>Payment Processing:</strong> To facilitate secure payment transactions through our payment gateway partners and to maintain records of completed transactions for accounting purposes.</li>
              <li><strong>Account Management:</strong> To create and manage your user account, authenticate your identity, and provide personalized experiences.</li>
              <li><strong>Customer Communication:</strong> To respond to your inquiries, provide customer support, and send important notices regarding your account or orders.</li>
              <li><strong>Marketing Communications:</strong> To send promotional emails, newsletters, and offers (only with your explicit consent; you may unsubscribe at any time).</li>
              <li><strong>Website Improvement:</strong> To analyze usage patterns, improve our website functionality, optimize user experience, and develop new features.</li>
              <li><strong>Fraud Prevention & Security:</strong> To detect, prevent, and address technical issues, fraud, unauthorized transactions, and other illegal activities.</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, legal processes, or enforceable governmental requests.</li>
            </ul>
          </section>

          <section>
            <h2>4. Payment Security & PCI Compliance</h2>
            <p>
              We take the security of your payment information extremely seriously. Our payment processing is handled entirely by PCI-DSS Level 1 compliant payment gateway partners. This means:
            </p>
            <ul>
              <li>All payment transactions are encrypted using SSL/TLS technology (256-bit encryption).</li>
              <li>Your card details are never stored on our servers — they are tokenized and processed directly by the payment gateway.</li>
              <li>We comply with the Payment Card Industry Data Security Standard (PCI-DSS) requirements.</li>
              <li>Two-factor authentication and fraud detection systems are employed by our payment partners.</li>
              <li>We regularly review and update our security practices to ensure the highest level of protection.</li>
            </ul>
            <p>
              While we implement commercially reasonable security measures, no electronic transmission or storage method is 100% secure. We cannot guarantee absolute security, but we continuously work to protect your data.
            </p>
          </section>

          <section>
            <h2>5. Information Sharing and Disclosure</h2>
            <p><strong>We do not sell, rent, or trade your personal information to third parties for their marketing purposes.</strong> We may share your information only in the following circumstances:</p>
            <ul>
              <li><strong>Payment Processors:</strong> Your payment information is shared with our PCI-DSS compliant payment gateway partners solely for the purpose of processing transactions.</li>
              <li><strong>Shipping & Logistics Partners:</strong> Your name, address, and phone number are shared with our courier and logistics partners to facilitate delivery of your orders.</li>
              <li><strong>Service Providers:</strong> We may engage trusted third-party service providers for email delivery, analytics, cloud hosting, and customer support. These providers are contractually obligated to protect your data.</li>
              <li><strong>Legal Requirements:</strong> We may disclose your information if required by law, court order, subpoena, or governmental regulation, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity with prior notice.</li>
            </ul>
          </section>

          <section>
            <h2>6. Data Retention</h2>
            <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Specifically:</p>
            <ul>
              <li><strong>Account Data:</strong> Retained for as long as your account is active. You may request account deletion at any time.</li>
              <li><strong>Order & Transaction Data:</strong> Retained for a minimum of 8 years as required by applicable tax, accounting, and legal regulations.</li>
              <li><strong>Marketing Data:</strong> Retained until you withdraw consent or unsubscribe from our communications.</li>
              <li><strong>Technical/Log Data:</strong> Typically retained for up to 12 months for security and analytics purposes.</li>
            </ul>
          </section>

          <section>
            <h2>7. Cookies & Tracking Technologies</h2>
            <p>We use cookies and similar technologies to enhance your browsing experience. These include:</p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for basic website functionality, shopping cart, and checkout processes.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website (e.g., Google Analytics).</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements and track campaign effectiveness.</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences for future visits.</li>
            </ul>
            <p>
              You can manage cookie preferences through your browser settings. Please note that disabling certain cookies may affect the functionality of our website, including the checkout and payment process.
            </p>
          </section>

          <section>
            <h2>8. Your Rights</h2>
            <p>Under applicable data protection laws, you have the following rights:</p>
            <ul>
              <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Right to Deletion:</strong> Request deletion of your personal data (subject to legal retention requirements).</li>
              <li><strong>Right to Object:</strong> Object to processing of your data for marketing purposes.</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time for data processing based on consent.</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a structured, commonly used, machine-readable format.</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at <strong>support&#64;legadoandco.com</strong>. We will respond to your request within 30 days.
            </p>
          </section>

          <section>
            <h2>9. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites, social media platforms, or services. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party site you visit.
            </p>
          </section>

          <section>
            <h2>10. Children's Privacy</h2>
            <p>
              Our website and services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have inadvertently collected information from a minor, we will take immediate steps to delete such information. If you believe a child has provided us with personal information, please contact us immediately at <strong>support&#64;legadoandco.com</strong>.
            </p>
          </section>

          <section>
            <h2>11. International Data Transfers</h2>
            <p>
              Your information may be transferred to and maintained on servers located outside of your state, province, or country where data protection laws may differ. By using our services, you consent to such transfers. We ensure that appropriate safeguards are in place for any international data transfers.
            </p>
          </section>

          <section>
            <h2>12. Changes to This Privacy Policy</h2>
            <p>
              We reserve the right to update or modify this Privacy Policy at any time. Any changes will be effective immediately upon posting the revised policy on this page. We will update the "Last Updated" date at the top of this page. Your continued use of the website after any changes constitutes your acceptance of the revised policy. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section>
            <h2>13. Grievance Officer</h2>
            <p>In accordance with applicable regulations, we have appointed a Grievance Officer to address any concerns or complaints regarding your personal data:</p>
            <div class="contact-box">
              <p>
                <strong>Grievance Officer</strong><br>
                Legado & Co<br>
                Email: <strong>support&#64;legadoandco.com</strong><br>
                Response Time: Within 48 hours of receipt
              </p>
            </div>
          </section>

          <section>
            <h2>14. Contact Us</h2>
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:</p>
            <div class="contact-box">
              <p>
                <strong>Legado & Co</strong><br>
                Email: <strong>support&#64;legadoandco.com</strong><br>
                Customer Support: <strong>support&#64;legadoandco.com</strong><br>
                Website: <strong>www.legadoandco.com</strong>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .privacy-page {
      font-family: var(--font-body);
      padding: var(--spacing-xl) 0;
      min-height: calc(100vh - 200px);
    }

    .privacy-page .container {
      max-width: none;
      width: 100%;
      padding-left: var(--spacing-md);
      padding-right: var(--spacing-md);
    }

    .page-title {
      font-family: var(--font-body);
      font-size: clamp(2rem, 4vw, 3rem);
      color: var(--primary-color);
      margin-bottom: var(--spacing-sm);
    }

    .last-updated {
      font-family: var(--font-body);
      color: var(--text-light);
      font-size: 14px;
      margin-bottom: var(--spacing-lg);
    }

    .privacy-content {
      max-width: none;
      width: 100%;
      margin: 0;
      background: var(--text-white);
      padding: var(--spacing-xl);
      border-radius: 12px;
      box-shadow: 0 2px 8px var(--shadow-light);
    }

    .privacy-content section {
      margin-bottom: var(--spacing-lg);
    }

    .privacy-content h2 {
      font-family: var(--font-body);
      color: var(--primary-color);
      font-size: 1.75rem;
      margin-bottom: var(--spacing-sm);
      margin-top: var(--spacing-md);
    }

    .privacy-content h3 {
      font-family: var(--font-body);
      color: var(--primary-dark);
      font-size: 1.25rem;
      margin-top: var(--spacing-md);
      margin-bottom: var(--spacing-xs);
    }

    .privacy-content p {
      font-family: var(--font-body);
      line-height: 1.8;
      color: var(--text-dark);
      margin-bottom: var(--spacing-sm);
    }

    .privacy-content ul {
      margin-left: var(--spacing-md);
      margin-bottom: var(--spacing-sm);
    }

    .privacy-content li {
      font-family: var(--font-body);
      line-height: 1.8;
      color: var(--text-dark);
      margin-bottom: 8px;
    }

    .contact-box {
      background: var(--secondary-color);
      border-left: 4px solid var(--primary-color);
      padding: var(--spacing-md);
      border-radius: 0 8px 8px 0;
      margin: var(--spacing-sm) 0;
    }

    .contact-box p {
      margin: 0;
    }

    @media (max-width: 768px) {
      .privacy-page .container {
        padding-left: var(--spacing-sm);
        padding-right: var(--spacing-sm);
      }
      .privacy-content {
        padding: var(--spacing-md);
      }
    }

    @media (max-width: 480px) {
      .privacy-page .container {
        padding-left: 12px;
        padding-right: 12px;
      }
      .privacy-content {
        padding: var(--spacing-sm);
      }
    }
  `]
})
export class PrivacyComponent {}
