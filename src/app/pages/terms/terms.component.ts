import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terms-page">
      <div class="container">
        <h1 class="page-title">Terms & Conditions</h1>
        <p class="last-updated">Last Updated: February 9, 2026</p>

        <div class="terms-content">
          <section>
            <h2>1. Agreement to Terms</h2>
            <p>
              Welcome to <strong>Legado & Co</strong> (website: <strong>www.legadoandco.com</strong>). By accessing, browsing, or using this website, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions ("Terms"). If you do not agree to these Terms, you must immediately discontinue use of this website and its services.
            </p>
            <p>
              These Terms constitute a legally binding agreement between you ("Customer," "User," "you," or "your") and Legado & Co ("Company," "we," "us," or "our"). We reserve the right to update these Terms at any time, and your continued use of the website after any modifications constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2>2. Eligibility</h2>
            <p>
              By using this website and placing orders, you represent and warrant that you are at least 18 years of age, possess the legal authority to enter into a binding agreement, and are using the website for lawful purposes. If you are under 18, you may use this website only under the supervision of a parent or legal guardian.
            </p>
          </section>

          <section>
            <h2>3. Products and Pricing</h2>
            <h3>3.1 Product Information</h3>
            <p>
              We make every effort to display our products and their colors, sizes, and descriptions as accurately as possible. However, the actual appearance of products may vary slightly due to monitor/display settings, photographic lighting, and other factors. We do not warrant that product descriptions, images, or other content on this site are entirely accurate, complete, or error-free.
            </p>

            <h3>3.2 Pricing</h3>
            <p>
              All prices displayed on the website are in <strong>Indian Rupees (INR / ₹)</strong> unless explicitly stated otherwise. Prices are inclusive of applicable taxes (GST) unless otherwise mentioned. We reserve the right to modify prices at any time without prior notice. The price applicable to your order is the price displayed at the time of placing the order. Prices do not include shipping and delivery charges, which will be displayed separately at checkout.
            </p>

            <h3>3.3 Availability</h3>
            <p>
              All products are subject to availability. We reserve the right to limit the quantity of products available for purchase or to discontinue any product at any time. If a product becomes unavailable after you have placed an order, we will notify you and process a full refund for that specific item.
            </p>
          </section>

          <section>
            <h2>4. Orders</h2>
            <h3>4.1 Order Placement</h3>
            <p>
              When you place an order on our website, it constitutes an offer to purchase the selected products. We reserve the right to accept or reject any order at our sole discretion, including but not limited to cases of product unavailability, pricing errors, suspected fraud, or any other reason we deem appropriate.
            </p>

            <h3>4.2 Order Confirmation</h3>
            <p>
              Upon successful placement of an order and payment confirmation, you will receive an order confirmation email with your order details and a unique order ID. This confirmation does not constitute acceptance of your order — it merely acknowledges receipt. Your order is considered accepted only when we dispatch the product(s) and send you a shipping confirmation.
            </p>

            <h3>4.3 Order Cancellation by Company</h3>
            <p>
              We reserve the right to cancel any order for reasons including but not limited to: suspected fraud, inaccurate pricing, product unavailability, or violation of these Terms. In the event we cancel your order, a full refund will be issued to your original payment method.
            </p>
          </section>

          <section>
            <h2>5. Payment Terms</h2>
            <h3>5.1 Accepted Payment Methods</h3>
            <p>We accept the following payment methods:</p>
            <ul>
              <li>Credit Cards (Visa, MasterCard, American Express, RuPay)</li>
              <li>Debit Cards (Visa, MasterCard, RuPay)</li>
              <li>UPI (Google Pay, PhonePe, Paytm, BHIM, and other UPI apps)</li>
              <li>Net Banking (all major Indian banks)</li>
              <li>Digital Wallets (as available through our payment gateway)</li>
              <li>Cash on Delivery (COD) — subject to availability in your location</li>
            </ul>

            <h3>5.2 Payment Processing</h3>
            <p>
              All online payments are processed through our PCI-DSS compliant third-party payment gateway partner(s). Your payment information is encrypted using industry-standard SSL/TLS encryption (256-bit) and is transmitted directly to the payment processor. <strong>We do not store your full card details, CVV, or banking credentials on our servers.</strong>
            </p>

            <h3>5.3 Payment Authorization</h3>
            <p>
              By submitting your payment information, you authorize us (and our payment processor) to charge the total order amount (including product price, shipping charges, and applicable taxes) to your selected payment method. If your payment is declined, your order will not be processed, and you will be notified accordingly.
            </p>

            <h3>5.4 Currency</h3>
            <p>
              All transactions are processed in <strong>Indian Rupees (INR / ₹)</strong>. If you are using an international payment method, your bank or card issuer may apply currency conversion charges at their prevailing exchange rate. Such charges are not within our control and are the sole responsibility of the customer.
            </p>

            <h3>5.5 Payment Security</h3>
            <p>
              We employ commercially reasonable security measures to protect your payment information. All transactions are secured by 256-bit SSL encryption. Our payment gateway partners are PCI-DSS Level 1 certified, ensuring the highest level of payment data security. We also employ fraud detection systems to prevent unauthorized transactions.
            </p>

            <h3>5.6 Failed Transactions</h3>
            <p>
              If a payment transaction fails but the amount is debited from your account, it will typically be auto-reversed by your bank/payment provider within 5–7 business days. If the reversal does not occur within this period, please contact us at <strong>legadoandco2026&#64;gmail.com</strong> with your transaction details, and we will assist in resolving the issue with our payment partner.
            </p>
          </section>

          <section>
            <h2>6. Shipping and Delivery</h2>
            <h3>6.1 Shipping Coverage</h3>
            <p>
              We currently ship to addresses within India. International shipping may be available for select locations — please contact us for details. Shipping charges, if applicable, will be clearly displayed at the checkout page before you confirm your order.
            </p>

            <h3>6.2 Delivery Timelines</h3>
            <p>
              Estimated delivery times are provided at checkout and in your order confirmation email. Standard delivery typically takes 5–10 business days from the date of dispatch. Delivery timelines may vary based on your location, courier partner availability, and unforeseen circumstances (weather, holidays, etc.).
            </p>

            <h3>6.3 Shipping Risks</h3>
            <p>
              Once a shipment is handed over to the courier/logistics partner, the risk of loss or damage passes to the courier. While we work with reliable logistics partners, we are not liable for delays, damage, or loss caused by the shipping carrier. In case of damaged or lost shipments, we will work with you and the courier to resolve the issue.
            </p>

            <h3>6.4 Free Shipping</h3>
            <p>
              Free shipping is available on orders above ₹5,000 (domestic orders within India). This offer is subject to change and may be modified or withdrawn at any time without prior notice.
            </p>
          </section>

          <section class="highlight-section">
            <h2>7. Return, Refund & Cancellation Policy</h2>
            <div class="policy-box no-refund">
              <h3>IMPORTANT: PLEASE READ CAREFULLY</h3>
              <p>
                All sales on Legado & Co are <strong>FINAL</strong>. We maintain a strict <strong>No Refund</strong> and <strong>No Return</strong> policy on all purchases unless explicitly stated otherwise below.
              </p>
            </div>

            <h3>7.1 No Refund Policy</h3>
            <p>
              Due to the nature of our products (fashion, apparel, and accessories), <strong>all sales are final and non-refundable</strong>. Once an order is placed and payment is confirmed, no refunds will be issued under any circumstances, except as outlined in Section 7.4 below.
            </p>

            <h3>7.2 No Return Policy</h3>
            <p>
              We do not accept returns or exchanges on any purchased items. By placing an order, you acknowledge and agree that you have reviewed the product details, sizing information, and descriptions carefully before completing your purchase. We strongly recommend reviewing our size guide and product descriptions thoroughly before ordering.
            </p>

            <h3>7.3 Order Cancellation by Customer</h3>
            <p>
              You may request cancellation of your order <strong>within 2 hours of placing it</strong>, provided the order has not already been dispatched or processed for shipment. Cancellation requests must be sent to <strong>legadoandco2026&#64;gmail.com</strong> with your Order ID. Once an order is dispatched, it <strong>cannot be cancelled</strong>.
            </p>
            <p>
              If your cancellation request is approved before dispatch, a full refund will be processed to your original payment method within 7–10 business days.
            </p>

            <h3>7.4 Exceptions (Damaged or Defective Products)</h3>
            <p>
              In the rare event that you receive a product that is:
            </p>
            <ul>
              <li>Materially different from what was ordered (wrong product entirely)</li>
              <li>Damaged during transit (physical damage visible upon delivery)</li>
              <li>Defective in manufacturing (stitching defects, fabric flaws not described in the listing)</li>
            </ul>
            <p>
              You must notify us within <strong>24 hours of delivery</strong> by emailing <strong>legadoandco2026&#64;gmail.com</strong> with the following:
            </p>
            <ul>
              <li>Your Order ID</li>
              <li>Clear photographs of the product and the defect/damage</li>
              <li>Photograph of the shipping package (if transit damage)</li>
              <li>Brief description of the issue</li>
            </ul>
            <p>
              After review and verification, we may at our sole discretion offer a <strong>replacement</strong> or <strong>store credit</strong>. Refunds to the original payment method are issued only if a replacement is not available. Claims made after 24 hours of delivery will not be entertained.
            </p>

            <h3>7.5 Non-Returnable Items</h3>
            <p>The following items are strictly non-returnable and non-refundable under all circumstances:</p>
            <ul>
              <li>Items purchased during sales, promotions, or with discount codes</li>
              <li>Customized or personalized items</li>
              <li>Innerwear, swimwear, and undergarments (for hygiene reasons)</li>
              <li>Items that have been worn, washed, altered, or damaged by the customer</li>
              <li>Gift cards and store credits</li>
            </ul>

            <h3>7.6 Chargebacks & Disputes</h3>
            <p>
              We strongly encourage you to contact us directly at <strong>legadoandco2026&#64;gmail.com</strong> before initiating a chargeback or payment dispute with your bank or card issuer. Filing a chargeback without first attempting to resolve the issue with us may result in suspension of your account. We reserve the right to contest all chargebacks.
            </p>
          </section>

          <section>
            <h2>8. Coupon Codes & Promotions</h2>
            <p>
              Promotional offers, discount codes, and coupon codes are subject to specific terms and conditions as communicated at the time of the promotion. Unless stated otherwise:
            </p>
            <ul>
              <li>Coupons are non-transferable and cannot be exchanged for cash.</li>
              <li>Only one coupon code can be applied per order.</li>
              <li>Coupons may have expiration dates, minimum purchase requirements, or product restrictions.</li>
              <li>We reserve the right to modify or cancel any promotion at any time without prior notice.</li>
              <li>Misuse or abuse of coupon codes may result in order cancellation and account suspension.</li>
            </ul>
          </section>

          <section>
            <h2>9. User Accounts</h2>
            <h3>9.1 Account Registration</h3>
            <p>
              You may be required to create an account to access certain features and place orders. You agree to provide accurate, current, and complete information during registration and to keep your account information updated.
            </p>

            <h3>9.2 Account Security</h3>
            <p>
              You are solely responsible for maintaining the confidentiality of your account credentials (email and password). You agree to notify us immediately of any unauthorized use of your account. We are not liable for any loss arising from unauthorized access to your account due to your failure to safeguard your credentials.
            </p>

            <h3>9.3 Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate your account at any time, without prior notice, if we believe you have violated these Terms, engaged in fraudulent activity, or for any other reason at our sole discretion.
            </p>
          </section>

          <section>
            <h2>10. Intellectual Property</h2>
            <p>
              All content on this website — including but not limited to text, graphics, logos, images, photographs, product designs, software, audio, video, and the overall design and layout — is the exclusive property of Legado & Co and is protected by Indian and international copyright, trademark, and intellectual property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, display, sell, or create derivative works from any content on this website without our prior written consent. The "Legado & Co" name, logo, and related marks are registered trademarks. Unauthorized use is strictly prohibited.
            </p>
          </section>

          <section>
            <h2>11. Prohibited Conduct</h2>
            <p>You agree not to use our website for any purpose that is unlawful or prohibited by these Terms. Specifically, you shall not:</p>
            <ul>
              <li>Use the website in any way that violates applicable local, national, or international laws or regulations.</li>
              <li>Attempt to gain unauthorized access to any part of the website, user accounts, or computer systems.</li>
              <li>Upload or transmit viruses, malware, or any other harmful code.</li>
              <li>Engage in any form of automated data collection (scraping, crawling, etc.) without our express permission.</li>
              <li>Place fraudulent orders or provide false information.</li>
              <li>Impersonate any person or entity or falsely represent your affiliation with any entity.</li>
              <li>Attempt to exploit, manipulate, or abuse any promotions, discount codes, or pricing errors.</li>
            </ul>
          </section>

          <section>
            <h2>12. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Legado & Co and its directors, officers, employees, affiliates, agents, and partners shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, goodwill, or other intangible losses, arising from:
            </p>
            <ul>
              <li>Your use or inability to use the website or services.</li>
              <li>Any unauthorized access to or alteration of your transmissions or data.</li>
              <li>Any delay or failure in delivery of products.</li>
              <li>Any errors, inaccuracies, or omissions in product descriptions or pricing.</li>
              <li>Any third-party conduct or content on the website.</li>
            </ul>
            <p>
              In no event shall our total liability exceed the amount you paid for the specific product(s) giving rise to the claim.
            </p>
          </section>

          <section>
            <h2>13. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Legado & Co, its officers, directors, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from your violation of these Terms, your use of the website, or your infringement of any third-party rights.
            </p>
          </section>

          <section>
            <h2>14. Disclaimer of Warranties</h2>
            <p>
              The website and all products and services are provided on an "AS IS" and "AS AVAILABLE" basis. We make no representations or warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
            </p>
          </section>

          <section>
            <h2>15. Governing Law & Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or relating to these Terms or your use of the website shall be subject to the exclusive jurisdiction of the courts located in Hyderabad, Telangana, India.
            </p>
          </section>

          <section>
            <h2>16. Severability</h2>
            <p>
              If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect.
            </p>
          </section>

          <section>
            <h2>17. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy and any other legal notices published on the website, constitute the entire agreement between you and Legado & Co regarding your use of the website and supersede all prior agreements.
            </p>
          </section>

          <section>
            <h2>18. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time at our sole discretion. Changes will be effective immediately upon posting on this page. We will update the "Last Updated" date accordingly. Your continued use of the website after any changes constitutes your acceptance of the revised Terms. We encourage you to review these Terms periodically.
            </p>
          </section>

          <section>
            <h2>19. Contact Information</h2>
            <p>If you have any questions or concerns about these Terms & Conditions, please contact us at:</p>
            <div class="contact-box">
              <p>
                <strong>Legado & Co</strong><br>
                Email / Customer Support: <strong>legadoandco2026&#64;gmail.com</strong><br>
                Phone: <strong>+918019433344</strong><br>
                Website: <strong>www.legadoandco.com</strong>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .terms-page {
      font-family: var(--font-body);
      padding: var(--spacing-xl) 0;
      min-height: calc(100vh - 200px);
    }

    .terms-page .container {
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

    .terms-content {
      max-width: none;
      width: 100%;
      margin: 0;
      background: var(--text-white);
      padding: var(--spacing-xl);
      border-radius: 12px;
      box-shadow: 0 2px 8px var(--shadow-light);
    }

    .terms-content section {
      margin-bottom: var(--spacing-lg);
    }

    .terms-content h2 {
      font-family: var(--font-body);
      color: var(--primary-color);
      font-size: 1.75rem;
      margin-bottom: var(--spacing-sm);
      margin-top: var(--spacing-md);
    }

    .terms-content h3 {
      font-family: var(--font-body);
      color: var(--primary-dark);
      font-size: 1.25rem;
      margin-top: var(--spacing-md);
      margin-bottom: var(--spacing-xs);
    }

    .terms-content p {
      font-family: var(--font-body);
      line-height: 1.8;
      color: var(--text-dark);
      margin-bottom: var(--spacing-sm);
    }

    .terms-content ul {
      margin-left: var(--spacing-md);
      margin-bottom: var(--spacing-sm);
    }

    .terms-content li {
      font-family: var(--font-body);
      line-height: 1.8;
      color: var(--text-dark);
      margin-bottom: 8px;
    }

    .highlight-section {
      background: #fdf8f0;
      border: 1px solid #e8dcc8;
      border-radius: 12px;
      padding: var(--spacing-md);
      margin: var(--spacing-md) 0;
    }

    .policy-box {
      padding: var(--spacing-md);
      border-radius: 8px;
      margin-bottom: var(--spacing-md);
    }

    .policy-box h3 {
      margin-top: 0;
      font-size: 1.1rem;
    }

    .no-refund {
      background: #fff3f3;
      border-left: 5px solid #c0392b;
    }

    .no-refund h3 {
      color: #c0392b;
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
      .terms-page .container {
        padding-left: var(--spacing-sm);
        padding-right: var(--spacing-sm);
      }
      .terms-content {
        padding: var(--spacing-md);
      }

      .highlight-section {
        padding: var(--spacing-sm);
      }
    }

    @media (max-width: 480px) {
      .terms-page .container {
        padding-left: 12px;
        padding-right: 12px;
      }
      .terms-content {
        padding: var(--spacing-sm);
      }
    }
  `]
})
export class TermsComponent {}
