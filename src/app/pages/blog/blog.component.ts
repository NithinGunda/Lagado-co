import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="blog-page">
      <div class="container">
        <div class="blog-header">
          <h1>Our Journal</h1>
          <p>Fashion insights, style tips, and stories from Legado & Co</p>
        </div>

        <div class="blog-content">
          <div class="blog-placeholder">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <h2>Coming Soon</h2>
            <p>We're working on bringing you inspiring content about fashion, style, and lifestyle.</p>
            <p>Check back soon for articles, style guides, and more!</p>
            <a routerLink="/collections" class="btn btn-primary">Continue Shopping</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .blog-page {
      min-height: calc(100vh - 200px);
      padding: var(--spacing-xl) 0;
    }

    .blog-header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }

    .blog-header h1 {
      color: var(--primary-color);
      margin-bottom: var(--spacing-sm);
      font-size: clamp(2.5rem, 5vw, 3.5rem);
    }

    .blog-header p {
      color: var(--text-light);
      font-size: 1.125rem;
    }

    .blog-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .blog-placeholder {
      text-align: center;
      padding: var(--spacing-xl) 0;
      color: var(--text-light);
    }

    .blog-placeholder svg {
      color: var(--primary-color);
      opacity: 0.5;
      margin-bottom: var(--spacing-md);
    }

    .blog-placeholder h2 {
      color: var(--primary-color);
      margin-bottom: var(--spacing-sm);
    }

    .blog-placeholder p {
      margin-bottom: var(--spacing-md);
      font-size: 1.125rem;
    }
  `]
})
export class BlogComponent {}
