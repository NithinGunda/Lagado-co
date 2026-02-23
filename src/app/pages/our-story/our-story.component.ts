import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-our-story',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="our-story-page">
      <div class="container">
        <div class="story-header">
          <h1>Our Story</h1>
          <p class="subtitle">Timeless Style, Quiet Confidence</p>
        </div>

        <div class="story-content">
          <section class="story-section">
            <h2 class="brand-heading">About <span class="brand-name">Legado & Co</span></h2>
            <p>
              <span class="brand-name">Legado & Co</span> was born from a passion for timeless elegance and quality craftsmanship. 
              We believe that true style transcends trends and speaks to the individual who values 
              sophistication, quality, and authenticity.
            </p>
            <p>
              Our name, "Legado," meaning "legacy" in Spanish, reflects our commitment to creating 
              pieces that will be cherished for generations. We curate collections that blend 
              classic design with modern sensibilities, ensuring each piece tells a story of 
              refined taste and quiet confidence.
            </p>
          </section>

          <section class="story-section">
            <h2>Our Mission</h2>
            <p>
              We are dedicated to providing premium fashion that empowers individuals to express 
              their unique style while maintaining the highest standards of quality and craftsmanship. 
              Every piece in our collection is carefully selected to meet our exacting standards 
              for design, materials, and construction.
            </p>
          </section>

          <section class="story-section">
            <h2>Our Values</h2>
            <div class="values-grid">
              <div class="value-card">
                <h3>Quality</h3>
                <p>We never compromise on the quality of materials or craftsmanship.</p>
              </div>
              <div class="value-card">
                <h3>Elegance</h3>
                <p>We believe in timeless design that transcends fleeting trends.</p>
              </div>
              <div class="value-card">
                <h3>Authenticity</h3>
                <p>We celebrate individuality and authentic self-expression.</p>
              </div>
              <div class="value-card">
                <h3>Sustainability</h3>
                <p>We are committed to responsible practices and ethical sourcing.</p>
              </div>
            </div>
          </section>

          <section class="story-section">
            <h2>Join Our Journey</h2>
            <p>
              We invite you to explore our collections and discover pieces that resonate with your 
              personal style. Whether you're looking for a statement piece or building a timeless 
              wardrobe, <span class="brand-name">Legado & Co</span> is here to help you express your unique sense of style.
            </p>
            <a routerLink="/collections" class="btn btn-primary">Explore Collections</a>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .our-story-page {
      min-height: calc(100vh - 200px);
      padding: var(--spacing-xl) 0;
    }

    .story-header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }

    .story-header h1 {
      color: var(--primary-color);
      margin-bottom: var(--spacing-sm);
      font-size: clamp(2.5rem, 5vw, 3.5rem);
    }

    .subtitle {
      font-size: 1.25rem;
      color: var(--text-light);
      font-style: italic;
    }

    .story-content {
      max-width: 900px;
      margin: 0 auto;
    }

    .story-section {
      margin-bottom: var(--spacing-xl);
    }

    .story-section h2 {
      color: var(--primary-color);
      margin-bottom: var(--spacing-md);
      font-size: 2rem;
    }

    .story-section p {
      color: var(--text-dark);
      line-height: 1.8;
      margin-bottom: var(--spacing-md);
      font-size: 1.125rem;
    }

    .values-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-md);
      margin-top: var(--spacing-md);
    }

    .value-card {
      background: var(--secondary-color);
      padding: var(--spacing-md);
      border-radius: 12px;
      text-align: center;
    }

    .value-card h3 {
      color: var(--primary-color);
      margin-bottom: var(--spacing-sm);
      font-size: 1.5rem;
    }

    .value-card p {
      color: var(--text-dark);
      margin: 0;
      font-size: 1rem;
    }

    .brand-name {
      font-family: var(--font-logo);
      font-weight: 400;
    }

    @media (max-width: 768px) {
      .values-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OurStoryComponent {}
