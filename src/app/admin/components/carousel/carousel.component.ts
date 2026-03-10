import { Component, OnInit } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { CarouselService, CarouselItem } from '../../../services/carousel.service';

@Component({
  selector: 'app-admin-carousel',
  template: `
    <div class="carousel-page">
      <div class="page-header">
        <div>
          <h1>Carousel Management</h1>
          <p class="page-sub">Manage hero banner slides &amp; videos displayed on the homepage</p>
        </div>
        <button class="btn-primary" (click)="openAdd()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Slide
        </button>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-val">{{ items.length }}</span>
          <span class="stat-label">Total Slides</span>
        </div>
        <div class="stat-card">
          <span class="stat-val">{{ activeCount }}</span>
          <span class="stat-label">Active</span>
        </div>
        <div class="stat-card">
          <span class="stat-val">{{ videoCount }}</span>
          <span class="stat-label">Videos</span>
        </div>
      </div>

      <div *ngIf="error" class="alert-error">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        {{ error }}
        <button class="alert-dismiss" (click)="error = ''">&times;</button>
      </div>

      <div *ngIf="successMsg" class="alert-success">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        {{ successMsg }}
        <button class="alert-dismiss" (click)="successMsg = ''">&times;</button>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading slides...</p>
      </div>

      <!-- LIVE PREVIEW -->
      <div *ngIf="!loading && items.length > 0" class="live-preview-section">
        <h3 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="0"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          Live Preview
        </h3>
        <div class="preview-banner">
          <div class="preview-slides">
            <div class="preview-slide"
                 *ngFor="let item of activeItems; let i = index"
                 [class.active]="i === previewIndex">
              <img *ngIf="item.media_type !== 'video'" [src]="item.image_url" [alt]="item.title || 'Slide'" />
              <video *ngIf="item.media_type === 'video'" [src]="item.image_url" autoplay muted loop playsinline></video>
              <div class="preview-overlay" *ngIf="item.title || item.description">
                <h4 *ngIf="item.title">{{ item.title }}</h4>
                <p *ngIf="item.description">{{ item.description }}</p>
              </div>
            </div>
          </div>
          <div class="preview-dots" *ngIf="activeItems.length > 1">
            <span *ngFor="let item of activeItems; let i = index"
                  class="dot" [class.active]="i === previewIndex"
                  (click)="previewIndex = i"></span>
          </div>
        </div>
      </div>

      <!-- EMPTY STATE -->
      <div *ngIf="!loading && items.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="0"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <h3>No carousel slides yet</h3>
        <p>Add your first hero banner image or video to get started.</p>
        <button class="btn-primary" (click)="openAdd()">Add First Slide</button>
      </div>

      <!-- SLIDES LIST -->
      <div *ngIf="!loading && items.length > 0" class="slides-section">
        <h3 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          All Slides ({{ items.length }})
        </h3>
        <div class="slides-grid">
          <div *ngFor="let item of items; let i = index"
               class="slide-card"
               [class.inactive]="item.is_active === false"
               [class.drag-over]="dragOverIndex === i"
               draggable="true"
               (dragstart)="onSlideDragStart(i)"
               (dragover)="onSlideDragOver($event, i)"
               (drop)="onSlideDrop($event, i)"
               (dragend)="onSlideDragEnd()">
            <div class="slide-img-wrap">
              <img *ngIf="item.image_url && item.media_type !== 'video'" [src]="item.image_url" [alt]="item.title || 'Slide'" />
              <video *ngIf="item.image_url && item.media_type === 'video'" [src]="item.image_url" muted loop playsinline (mouseenter)="$any($event.target).play()" (mouseleave)="$any($event.target).pause()"></video>
              <div *ngIf="!item.image_url" class="no-img">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="0"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <div class="slide-order-badge">{{ item.order ?? i + 1 }}</div>
              <span class="slide-type-badge" [class.video]="item.media_type === 'video'">
                <svg *ngIf="item.media_type === 'video'" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                <svg *ngIf="item.media_type !== 'video'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="2" width="20" height="20" rx="0"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                {{ item.media_type === 'video' ? 'Video' : 'Image' }}
              </span>
              <span class="slide-status-badge" [class.active]="item.is_active !== false" [class.off]="item.is_active === false">
                {{ item.is_active !== false ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="slide-body">
              <h4>{{ item.title || 'Slide ' + (item.order ?? i + 1) }}</h4>
              <p *ngIf="item.description" class="slide-desc">{{ item.description }}</p>
              <p *ngIf="item.link" class="slide-link-info">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                {{ item.link }}
              </p>
            </div>
            <div class="slide-actions">
              <button class="action-btn toggle-btn" (click)="toggleActive(item)"
                      [title]="item.is_active !== false ? 'Deactivate' : 'Activate'">
                <svg *ngIf="item.is_active !== false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg *ngIf="item.is_active === false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
              <button class="action-btn edit-btn" (click)="edit(item)" title="Edit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="action-btn move-btn" (click)="moveUp(item)" title="Move Up" [disabled]="i === 0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
              </button>
              <button class="action-btn move-btn" (click)="moveDown(item)" title="Move Down" [disabled]="i === items.length - 1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <button class="action-btn delete-btn" (click)="confirmDelete(item)" title="Delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SLIDE FORM PANEL -->
      <div class="form-backdrop" *ngIf="editing" (click)="cancel()"></div>
      <div class="form-panel" [class.open]="editing">
        <div class="fp-head">
          <h3>{{ editing?.id ? 'Edit' : 'Add' }} Slide</h3>
          <button class="fp-close" (click)="cancel()">&times;</button>
        </div>
        <div class="fp-body" *ngIf="editing">
          <!-- Image cropper for images -->
          <div *ngIf="showCropper && originalImageBase64" class="cropper-wrapper">
            <div class="cropper-tabs">
              <button type="button" class="tab-btn" [class.active]="cropMode === 'desktop'" (click)="setCropMode('desktop')">
                Desktop banner
                <span class="tab-sub">16:7 hero</span>
              </button>
              <button type="button" class="tab-btn" [class.active]="cropMode === 'mobile'" (click)="setCropMode('mobile')">
                Mobile banner
                <span class="tab-sub">9:16 phone</span>
              </button>
            </div>
            <image-cropper
              [imageBase64]="originalImageBase64"
              [maintainAspectRatio]="true"
              [aspectRatio]="cropMode === 'desktop' ? 16 / 7 : 9 / 16"
              [resizeToWidth]="cropMode === 'desktop' ? 1600 : 900"
              format="png"
              (imageCropped)="onImageCropped($event)">
            </image-cropper>
            <div class="cropper-actions">
              <div class="crop-status">
                <span *ngIf="croppedDesktopBlob">Desktop crop saved</span>
                <span *ngIf="croppedMobileBlob">Mobile crop saved</span>
              </div>
              <div class="crop-buttons">
                <button type="button" class="btn-primary" (click)="applyCrop()" [disabled]="!croppedImageBlob">
                  Save {{ cropMode === 'desktop' ? 'desktop' : 'mobile' }} crop
                </button>
                <button type="button" class="btn-secondary" (click)="cancelCrop()">Done</button>
              </div>
            </div>
          </div>

          <div class="upload-zone"
               (dragover)="onDragOver($event)"
               (dragleave)="onDragLeave($event)"
               (drop)="onDrop($event)"
               [class.dragover]="isDragging"
               [class.has-media]="mediaPreview || editing.image_url"
               (click)="fileInput.click()">
            <input #fileInput type="file" accept="image/*,video/mp4,video/webm,video/mov" (change)="onFileChange($event)" style="display:none" />

            <!-- Image preview -->
            <img *ngIf="mediaPreview && selectedMediaType === 'image'" [src]="mediaPreview" alt="Preview" class="upload-preview" />
            <img *ngIf="!mediaPreview && editing.image_url && editing.media_type !== 'video'" [src]="editing.image_url" alt="Current" class="upload-preview" />

            <!-- Video preview -->
            <video *ngIf="mediaPreview && selectedMediaType === 'video'" [src]="mediaPreview" class="upload-preview" autoplay muted loop playsinline></video>
            <video *ngIf="!mediaPreview && editing.image_url && editing.media_type === 'video'" [src]="editing.image_url" class="upload-preview" autoplay muted loop playsinline></video>

            <div class="upload-placeholder" *ngIf="!mediaPreview && !editing.image_url">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="0"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <p>Drag & drop or click to upload</p>
              <span>Image: PNG, JPG, WEBP (max 5MB)</span>
              <span>Video: MP4, WEBM, MOV (max 50MB)</span>
            </div>
            <div class="upload-change" *ngIf="mediaPreview || editing.image_url">
              <span>Click or drop to replace</span>
            </div>
          </div>
          <div *ngIf="mediaPreview || editing.image_url" class="media-type-indicator">
            <span class="type-pill" [class.video]="(selectedMediaType || editing.media_type) === 'video'">
              {{ (selectedMediaType || editing.media_type) === 'video' ? 'Video' : 'Image' }}
            </span>
            <span class="file-name" *ngIf="mediaFile">{{ mediaFile.name }}</span>
          </div>
          <div *ngIf="mediaError" class="field-error">{{ mediaError }}</div>

          <div class="form-field">
            <label>Display Order</label>
            <input type="number" [(ngModel)]="editing.order" min="1" max="20" placeholder="1" />
          </div>
          <div class="form-field">
            <label>Title <span class="opt">(optional)</span></label>
            <input type="text" [(ngModel)]="editing.title" placeholder="e.g. Summer Collection 2026" />
          </div>
          <div class="form-field">
            <label>Description <span class="opt">(optional)</span></label>
            <textarea [(ngModel)]="editing.description" rows="2" placeholder="Short description..."></textarea>
          </div>
          <div class="form-field">
            <label>Link URL <span class="opt">(optional)</span></label>
            <input type="text" [(ngModel)]="editing.link" placeholder="https://..." />
          </div>
          <div class="form-field toggle-field">
            <label class="toggle-label">
              <input type="checkbox" [(ngModel)]="editing!.is_active" />
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span>Active</span>
            </label>
          </div>
        </div>
        <div class="fp-footer">
          <button class="btn-primary" (click)="save()" [disabled]="saving || (!mediaFile && !editing?.image_url)">
            {{ saving ? 'Saving...' : (editing?.id ? 'Update Slide' : 'Add Slide') }}
          </button>
          <button class="btn-secondary" (click)="cancel()">Cancel</button>
        </div>
      </div>

      <!-- DELETE CONFIRM -->
      <div class="form-backdrop" *ngIf="toDelete" (click)="toDelete = null"></div>
      <div class="delete-dialog" *ngIf="toDelete">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c00" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        <h3>Delete Slide?</h3>
        <p>This will permanently remove slide "{{ toDelete?.title || 'Slide ' + (toDelete?.order ?? '?') }}" and its media.</p>
        <div class="del-actions">
          <button class="btn-danger" (click)="deleteConfirm()" [disabled]="saving">Delete</button>
          <button class="btn-secondary" (click)="toDelete = null">Cancel</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .carousel-page { padding: 0; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .page-header h1 { margin: 0; font-size: 24px; font-weight: 700; color: var(--text-dark, #1a1a1a); }
    .page-sub { margin: 4px 0 0; color: var(--text-light, #777); font-size: 14px; }

    .btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; background: var(--primary-color, #1a1a1a); color: #fff; border: none; cursor: pointer; font-size: 14px; font-weight: 600; transition: opacity 0.2s; }
    .btn-primary:hover { opacity: 0.85; }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-secondary { padding: 10px 20px; background: #f5f5f5; border: 1px solid var(--border-color, #e0e0e0); cursor: pointer; font-size: 14px; font-weight: 500; }
    .btn-secondary:hover { background: #eee; }
    .btn-danger { padding: 10px 20px; background: #dc3545; color: #fff; border: none; cursor: pointer; font-size: 14px; font-weight: 600; }
    .btn-danger:hover { background: #c82333; }
    .btn-danger:disabled { opacity: 0.5; }

    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: #fff; padding: 20px; border: 1px solid var(--border-color, #e0e0e0); text-align: center; }
    .stat-val { display: block; font-size: 28px; font-weight: 700; color: var(--primary-color, #1a1a1a); }
    .stat-label { display: block; font-size: 13px; color: var(--text-light, #777); margin-top: 4px; }

    .alert-error, .alert-success { display: flex; align-items: center; gap: 8px; padding: 12px 16px; margin-bottom: 16px; font-size: 14px; position: relative; }
    .alert-error { background: #fff5f5; border: 1px solid #fecaca; color: #dc2626; }
    .alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
    .alert-dismiss { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 18px; cursor: pointer; color: inherit; }

    .loading-state { text-align: center; padding: 60px 20px; color: var(--text-light, #777); }
    .spinner { width: 32px; height: 32px; border: 3px solid #eee; border-top-color: var(--primary-color, #1a1a1a); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .section-title { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 600; margin: 0 0 16px; color: var(--text-dark, #1a1a1a); }
    .live-preview-section { margin-bottom: 32px; }
    .preview-banner {
      position: relative;
      width: 100%;
      aspect-ratio: 16/7;
      background: #f0f0f0;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 18px 40px rgba(15,23,42,0.2);
    }
    .preview-slides { position: relative; width: 100%; height: 100%; }
    .preview-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.6s ease; }
    .preview-slide.active { opacity: 1; }
    .preview-slide img,
    .preview-slide video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.9);
    }
    .preview-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 28px 40px 32px;
      background: linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0.25), transparent);
      color: #fff;
      max-width: 540px;
    }
    .preview-overlay h4 {
      margin: 0 0 6px;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }
    .preview-overlay p {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
      line-height: 1.5;
    }
    .preview-dots { position: absolute; bottom: 12px; right: 16px; display: flex; gap: 6px; }
    .dot { width: 10px; height: 10px; background: rgba(255,255,255,0.5); cursor: pointer; transition: background 0.2s; }
    .dot.active { background: #fff; }

    .empty-state { text-align: center; padding: 80px 20px; background: #fff; border: 2px dashed var(--border-color, #e0e0e0); }
    .empty-state h3 { margin: 16px 0 8px; font-size: 18px; color: var(--text-dark, #1a1a1a); }
    .empty-state p { color: var(--text-light, #777); font-size: 14px; margin-bottom: 20px; }

    .slides-section { margin-bottom: 32px; }
    .slides-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
    .slide-card {
      background: #fff;
      border: 1px solid var(--border-color, #e0e0e0);
      overflow: hidden;
      transition: box-shadow 0.2s, transform 0.15s, border-color 0.15s;
      cursor: grab;
    }
    .slide-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-2px); }
    .slide-card.drag-over {
      border-color: var(--primary-color, #1a1a1a);
      box-shadow: 0 0 0 2px rgba(26,26,26,0.15);
    }
    .slide-card.inactive { opacity: 0.55; }
    .slide-card.inactive:hover { opacity: 0.75; }

    .slide-img-wrap { position: relative; width: 100%; aspect-ratio: 16/7; background: #f5f5f5; overflow: hidden; }
    .slide-img-wrap img, .slide-img-wrap video { width: 100%; height: 100%; object-fit: cover; }
    .no-img { display: flex; align-items: center; justify-content: center; height: 100%; }
    .slide-order-badge { position: absolute; top: 10px; left: 10px; width: 28px; height: 28px; background: rgba(0,0,0,0.7); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; z-index: 2; }
    .slide-type-badge { position: absolute; bottom: 10px; left: 10px; padding: 3px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; z-index: 2; background: rgba(0,0,0,0.6); color: #fff; display: flex; align-items: center; gap: 4px; }
    .slide-type-badge.video { background: #7c3aed; }
    .slide-status-badge { position: absolute; top: 10px; right: 10px; padding: 4px 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; z-index: 2; line-height: 1.2; white-space: nowrap; }
    .slide-status-badge.active { background: #16a34a; color: #fff; }
    .slide-status-badge.off { background: #ef4444; color: #fff; }

    .slide-body { padding: 14px 16px 8px; }
    .slide-body h4 { margin: 0 0 6px; font-size: 15px; font-weight: 600; color: var(--text-dark, #1a1a1a); }
    .slide-desc { margin: 0 0 6px; font-size: 13px; color: var(--text-light, #777); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .slide-link-info { margin: 0; font-size: 12px; color: #2563eb; display: flex; align-items: center; gap: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .slide-actions { display: flex; gap: 6px; padding: 8px 16px 14px; }
    .action-btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 1px solid var(--border-color, #e0e0e0); background: #fff; cursor: pointer; transition: all 0.15s; color: var(--text-dark, #333); }
    .action-btn:hover { background: #f5f5f5; }
    .action-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .edit-btn:hover { border-color: #2563eb; color: #2563eb; }
    .delete-btn:hover { border-color: #dc2626; color: #dc2626; }
    .toggle-btn:hover { border-color: #16a34a; color: #16a34a; }
    .move-btn:hover { border-color: var(--primary-color, #1a1a1a); }

    .form-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 999; }
    .form-panel { position: fixed; top: 0; right: -480px; width: 460px; max-width: 90vw; height: 100vh; background: #fff; z-index: 1000; display: flex; flex-direction: column; transition: right 0.3s ease; box-shadow: -4px 0 24px rgba(0,0,0,0.12); }
    .form-panel.open { right: 0; }
    .fp-head { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-color, #e0e0e0); }
    .fp-head h3 { margin: 0; font-size: 18px; font-weight: 700; }
    .fp-close { background: none; border: none; font-size: 28px; cursor: pointer; color: #999; line-height: 1; }
    .fp-close:hover { color: #333; }
    .fp-body { flex: 1; overflow-y: auto; padding: 24px; }
    .fp-footer { padding: 16px 24px; border-top: 1px solid var(--border-color, #e0e0e0); display: flex; gap: 10px; }

    .upload-zone { position: relative; width: 100%; aspect-ratio: 16/9; border: 2px dashed var(--border-color, #d0d0d0); background: #fafafa; cursor: pointer; display: flex; align-items: center; justify-content: center; overflow: hidden; transition: border-color 0.2s, background 0.2s; margin-bottom: 8px; }
    .upload-zone:hover { border-color: var(--primary-color, #1a1a1a); background: #f5f5f5; }
    .upload-zone.dragover { border-color: #2563eb; background: #eff6ff; }
    .upload-zone.has-media { border-style: solid; }
    .upload-preview { width: 100%; height: 100%; object-fit: cover; }
    .upload-placeholder { text-align: center; color: #999; }
    .upload-placeholder p { margin: 12px 0 4px; font-size: 14px; font-weight: 500; color: #666; }
    .upload-placeholder span { display: block; font-size: 12px; color: #aaa; margin-top: 2px; }
    .upload-change { position: absolute; bottom: 0; left: 0; right: 0; padding: 8px; background: rgba(0,0,0,0.5); color: #fff; text-align: center; font-size: 12px; opacity: 0; transition: opacity 0.2s; }
    .upload-zone:hover .upload-change { opacity: 1; }

    .cropper-wrapper {
      margin-bottom: 12px;
      background: #050816;
      padding: 12px;
      border-radius: 12px;
    }
    .cropper-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }
    .tab-btn {
      flex: 1;
      padding: 6px 10px;
      font-size: 12px;
      border-radius: 999px !important;
      border: 1px solid rgba(255,255,255,0.15);
      background: transparent;
      color: rgba(255,255,255,0.75);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      cursor: pointer;
    }
    .tab-btn.active {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.4);
      color: #fff;
    }
    .tab-sub {
      font-size: 10px;
      opacity: 0.8;
    }
    .cropper-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    }
    .crop-status {
      font-size: 11px;
      color: rgba(255,255,255,0.7);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .crop-buttons {
      display: flex;
      gap: 8px;
    }

    .media-type-indicator { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .type-pill { display: inline-flex; align-items: center; padding: 3px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: #e5e7eb; color: #374151; }
    .type-pill.video { background: #7c3aed; color: #fff; }
    .file-name { font-size: 12px; color: var(--text-light, #777); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .field-error { color: #dc2626; font-size: 13px; margin-bottom: 12px; }

    .form-field { margin-bottom: 16px; }
    .form-field label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: var(--text-dark, #333); }
    .form-field .opt { font-weight: 400; color: #aaa; }
    .form-field input[type="text"],
    .form-field input[type="number"],
    .form-field textarea { width: 100%; padding: 10px 12px; border: 1px solid var(--border-color, #e0e0e0); font-size: 14px; background: #fff; box-sizing: border-box; transition: border-color 0.2s; }
    .form-field input:focus,
    .form-field textarea:focus { outline: none; border-color: var(--primary-color, #1a1a1a); }

    .toggle-field { margin-top: 8px; }
    .toggle-label { display: flex; align-items: center; gap: 12px; cursor: pointer; font-size: 14px; font-weight: 500; }
    .toggle-label input { position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none; }
    .toggle-track { display: inline-block; position: relative; min-width: 44px; width: 44px; height: 24px; background: #ccc; transition: background 0.25s; flex-shrink: 0; box-sizing: border-box; }
    .toggle-thumb { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; background: #fff; transition: transform 0.25s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
    .toggle-label input:checked + .toggle-track { background: #16a34a; }
    .toggle-label input:checked + .toggle-track .toggle-thumb { transform: translateX(20px); }

    .delete-dialog { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; padding: 32px; z-index: 1001; min-width: 340px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
    .delete-dialog h3 { margin: 12px 0 8px; }
    .delete-dialog p { color: var(--text-light, #777); font-size: 14px; margin-bottom: 20px; }
    .del-actions { display: flex; justify-content: center; gap: 10px; }

    @media (max-width: 768px) {
      .stats-row { grid-template-columns: 1fr; }
      .slides-grid { grid-template-columns: 1fr; }
      .form-panel { width: 100vw; right: -100vw; }
    }
  `]
})
export class AdminCarouselComponent implements OnInit {
  items: CarouselItem[] = [];
  loading = false;
  saving = false;
  error = '';
  successMsg = '';

  editing: CarouselItem | null = null;
  toDelete: CarouselItem | null = null;

  mediaFile: File | null = null;
  mediaPreview: string | null = null;
  mediaError: string | null = null;
  selectedMediaType: 'image' | 'video' | null = null;
  isDragging = false;

  // cropping
  showCropper = false;
  originalImageBase64: string | null = null;
  croppedImageBlob: Blob | null = null;
  cropMode: 'desktop' | 'mobile' = 'desktop';
  croppedDesktopBlob: Blob | null = null;
  croppedMobileBlob: Blob | null = null;

  previewIndex = 0;
  private previewTimer: any;

  dragFromIndex: number | null = null;
  dragOverIndex: number | null = null;

  constructor(private api: CarouselService) {}

  ngOnInit() {
    this.load();
  }

  get activeCount(): number {
    return this.items.filter(i => i.is_active !== false).length;
  }

  get videoCount(): number {
    return this.items.filter(i => i.media_type === 'video').length;
  }

  get activeItems(): CarouselItem[] {
    return this.items.filter(i => i.is_active !== false && i.image_url);
  }

  load() {
    this.loading = true;
    this.error = '';
    this.api.list().subscribe({
      next: (items) => {
        this.items = items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        this.loading = false;
        this.startPreviewTimer();
      },
      error: () => {
        this.error = 'Failed to load carousel slides';
        this.loading = false;
      }
    });
  }

  private startPreviewTimer() {
    if (this.previewTimer) clearInterval(this.previewTimer);
    if (this.activeItems.length > 1) {
      this.previewTimer = setInterval(() => {
        this.previewIndex = (this.previewIndex + 1) % this.activeItems.length;
      }, 3000);
    }
  }

  openAdd() {
    this.editing = {
      order: this.items.length + 1,
      title: '',
      description: '',
      link: '',
      is_active: true,
      media_type: 'image'
    };
    this.resetMedia();
  }

  onSlideDragStart(index: number) {
    this.dragFromIndex = index;
    this.dragOverIndex = null;
  }

  onSlideDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    if (this.dragFromIndex === null || this.dragFromIndex === index) {
      this.dragOverIndex = null;
      return;
    }
    this.dragOverIndex = index;
  }

  onSlideDrop(event: DragEvent, index: number) {
    event.preventDefault();
    if (this.dragFromIndex === null || this.dragFromIndex === index) {
      this.dragFromIndex = null;
      this.dragOverIndex = null;
      return;
    }

    const from = this.dragFromIndex;
    const to = index;

    const moved = this.items.splice(from, 1)[0];
    this.items.splice(to, 0, moved);

    this.dragFromIndex = null;
    this.dragOverIndex = null;

    this.persistOrder();
  }

  onSlideDragEnd() {
    this.dragFromIndex = null;
    this.dragOverIndex = null;
  }

  private persistOrder() {
    this.items.forEach((item, idx) => {
      const desiredOrder = idx + 1;
      if (item.order !== desiredOrder) {
        item.order = desiredOrder;
        this.api.update(item.id!, { order: desiredOrder }).subscribe({
          next: () => {
            this.startPreviewTimer();
          },
          error: () => {
            // keep local order even if API call fails
          }
        });
      }
    });
  }

  private openCropperWithFile(file: File) {
    this.mediaError = null;
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxImageSize = 5 * 1024 * 1024;

    if (!allowed.includes(file.type)) {
      this.mediaError = 'Only PNG, JPG, JPEG or WEBP allowed.';
      return;
    }
    if (file.size > maxImageSize) {
      this.mediaError = 'Image must be under 5MB.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.originalImageBase64 = reader.result as string;
      this.croppedImageBlob = null;
      this.croppedDesktopBlob = null;
      this.croppedMobileBlob = null;
      this.cropMode = 'desktop';
      this.showCropper = true;
      this.mediaFile = null;
      this.mediaPreview = null;
      this.selectedMediaType = 'image';
    };
    reader.readAsDataURL(file);
  }

  edit(item: CarouselItem) {
    this.editing = { ...item };
    this.mediaFile = null;
    this.mediaPreview = null;
    this.mediaError = null;
    this.selectedMediaType = null;
  }

  cancel() {
    this.editing = null;
    this.resetMedia();
  }

  private resetMedia() {
    this.mediaFile = null;
    this.mediaPreview = null;
    this.mediaError = null;
    this.selectedMediaType = null;
    this.isDragging = false;
    this.croppedImageBlob = null;
    this.croppedDesktopBlob = null;
    this.croppedMobileBlob = null;
    this.originalImageBase64 = null;
    this.cropMode = 'desktop';
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging = false;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging = false;
    const files = e.dataTransfer?.files;
    if (files?.length) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.openCropperWithFile(file);
        return;
      }
      this.processFile(file);
    }
  }

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    if (file.type.startsWith('image/')) {
      this.openCropperWithFile(file);
      return;
    }

    // videos go directly
    this.processFile(file);
  }

  onImageCropped(event: ImageCroppedEvent) {
    this.croppedImageBlob = event.blob || null;
    if (this.cropMode === 'desktop') {
      this.croppedDesktopBlob = this.croppedImageBlob;
    } else {
      this.croppedMobileBlob = this.croppedImageBlob;
    }
  }

  applyCrop() {
    if (!this.croppedImageBlob) return;
    const mime = this.croppedImageBlob.type || 'image/png';
    const file = new File([this.croppedImageBlob], this.cropMode === 'desktop' ? 'carousel-desktop.png' : 'carousel-mobile.png', { type: mime });

    if (this.cropMode === 'desktop') {
      // Desktop crop also drives the main preview
      this.croppedDesktopBlob = this.croppedImageBlob;
      this.processFile(file);
    } else {
      // Mobile crop is only stored for saving
      this.croppedMobileBlob = this.croppedImageBlob;
    }
    // keep originalImageBase64 so user can switch modes; just clear current blob
    this.croppedImageBlob = null;
  }

  cancelCrop() {
    this.showCropper = false;
    this.croppedImageBlob = null;
    this.originalImageBase64 = null;
    this.cropMode = 'desktop';
    // do not reset existing editing.image_url so user can keep old image
  }

  setCropMode(mode: 'desktop' | 'mobile') {
    this.cropMode = mode;
    this.croppedImageBlob = null;
  }

  private processFile(file: File) {
    this.mediaError = null;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      this.mediaError = 'Only image (PNG, JPG, WEBP) or video (MP4, WEBM, MOV) files allowed.';
      return;
    }

    const maxImageSize = 5 * 1024 * 1024;
    const maxVideoSize = 50 * 1024 * 1024;

    if (isImage && file.size > maxImageSize) {
      this.mediaError = 'Image must be under 5MB.';
      return;
    }
    if (isVideo && file.size > maxVideoSize) {
      this.mediaError = 'Video must be under 50MB.';
      return;
    }

    this.mediaFile = file;
    this.selectedMediaType = isVideo ? 'video' : 'image';
    this.mediaPreview = URL.createObjectURL(file);
  }

  save() {
    if (!this.editing || this.saving) return;
    if (!this.mediaFile && !this.editing.image_url) {
      this.mediaError = 'Image or video is required.';
      return;
    }
    this.saving = true;
    this.error = '';

    const fd = new FormData();
    // For videos, keep existing single media upload
    if (this.mediaFile && this.selectedMediaType === 'video') {
      fd.append('media', this.mediaFile);
    } else {
      // Images: send separate desktop/mobile crops when available
      if (this.croppedDesktopBlob) {
        const mime = this.croppedDesktopBlob.type || 'image/png';
        const file = new File([this.croppedDesktopBlob], 'carousel-desktop.png', { type: mime });
        fd.append('media_desktop', file);
      } else if (this.mediaFile) {
        // fallback: use single image as desktop
        fd.append('media_desktop', this.mediaFile);
      }
      if (this.croppedMobileBlob) {
        const mimeM = this.croppedMobileBlob.type || 'image/png';
        const fileM = new File([this.croppedMobileBlob], 'carousel-mobile.png', { type: mimeM });
        fd.append('media_mobile', fileM);
      }
    }
    fd.append('order', String(this.editing.order ?? 1));
    fd.append('is_active', this.editing.is_active !== false ? '1' : '0');
    if (this.editing.title) fd.append('title', this.editing.title);
    if (this.editing.description) fd.append('description', this.editing.description);
    if (this.editing.link) fd.append('link', this.editing.link);

    const id = this.editing.id;
    const isNew = !id;
    const op = id ? this.api.update(id, fd) : this.api.create(fd);
    op.subscribe({
      next: () => {
        this.saving = false;
        this.successMsg = isNew ? 'Slide added successfully!' : 'Slide updated successfully!';
        this.cancel();
        this.load();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (e) => {
        this.saving = false;
        this.error = e?.error?.message || 'Save failed. Please try again.';
      }
    });
  }

  toggleActive(item: CarouselItem) {
    const newState = item.is_active === false;
    this.api.toggleActive(item.id!, newState).subscribe({
      next: () => {
        item.is_active = newState;
        this.successMsg = newState ? 'Slide activated' : 'Slide deactivated';
        this.startPreviewTimer();
        setTimeout(() => this.successMsg = '', 2000);
      },
      error: () => {
        this.error = 'Failed to update status';
      }
    });
  }

  moveUp(item: CarouselItem) {
    const idx = this.items.indexOf(item);
    if (idx <= 0) return;
    this.swapOrders(idx, idx - 1);
  }

  moveDown(item: CarouselItem) {
    const idx = this.items.indexOf(item);
    if (idx < 0 || idx >= this.items.length - 1) return;
    this.swapOrders(idx, idx + 1);
  }

  private swapOrders(aIdx: number, bIdx: number) {
    const a = this.items[aIdx];
    const b = this.items[bIdx];
    const aOrder = a.order ?? aIdx + 1;
    const bOrder = b.order ?? bIdx + 1;

    this.api.update(a.id!, { order: bOrder }).subscribe({
      next: () => {
        this.api.update(b.id!, { order: aOrder }).subscribe({
          next: () => {
            a.order = bOrder;
            b.order = aOrder;
            this.items.sort((x, y) => (x.order ?? 0) - (y.order ?? 0));
          }
        });
      }
    });
  }

  confirmDelete(item: CarouselItem) {
    this.toDelete = item;
  }

  deleteConfirm() {
    if (!this.toDelete || this.saving) return;
    this.saving = true;
    const id = this.toDelete.id;
    this.api.delete(id!).subscribe({
      next: () => {
        this.saving = false;
        this.items = this.items.filter(i => i.id !== id);
        this.toDelete = null;
        this.successMsg = 'Slide deleted successfully';
        this.startPreviewTimer();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || 'Delete failed';
      }
    });
  }
}
