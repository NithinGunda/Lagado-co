import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';

/** Flattened node for display and drag-drop */
interface FlatNode {
  category: Category;
  depth: number;
  parentId: number | string | null;
  childrenCount: number;
}

@Component({
  selector: 'app-admin-subcategories',
  template: `
    <div class="admin-subcategories">
      <div class="page-header">
        <div>
          <h1>Subcategories</h1>
          <p class="page-sub">Manage category tree. Drag rows to reorder; use Edit to change parent or details.</p>
        </div>
        <button type="button" class="btn btn-primary" (click)="openAdd(null)">Add top-level category</button>
      </div>

      <div *ngIf="error" class="alert error">{{ error }}</div>
      <div *ngIf="successMsg" class="alert success">{{ successMsg }}</div>
      <div *ngIf="loading" class="loading">Loading…</div>

      <div *ngIf="!loading && flatNodes.length === 0" class="empty">
        No categories yet. Add a top-level category above, or use Categories to add and assign parents.
      </div>

      <div *ngIf="!loading && flatNodes.length > 0" class="tree-section">
        <div class="tree-toolbar">
          <span class="hint">Drag the handle to reorder within the same level.</span>
        </div>
        <div class="tree-list">
          <div *ngFor="let node of flatNodes; let i = index"
               class="tree-row"
               [class.drag-over]="dragOverIndex === i && canDrop(i)"
               [style.padding-left.rem]="1 + node.depth * 1.5"
               draggable="true"
               (dragstart)="onDragStart($event, i)"
               (dragover)="onDragOver($event, i)"
               (drop)="onDrop($event, i)"
               (dragend)="onDragEnd()">
            <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
            <span class="expand" *ngIf="node.childrenCount > 0" (click)="toggleExpand(node.category.id!)">
              {{ isExpanded(node.category.id!) ? '▼' : '▶' }}
            </span>
            <span class="expand-placeholder" *ngIf="node.childrenCount === 0"></span>
            <img *ngIf="node.category.image_url" [src]="node.category.image_url" alt="" class="row-thumb" />
            <span class="name">{{ node.category.name }}</span>
            <span class="slug">{{ node.category.slug || '—' }}</span>
            <span class="status-badge" [class.active]="node.category.is_active !== false" [class.inactive]="node.category.is_active === false">
              {{ node.category.is_active !== false ? 'Active' : 'Inactive' }}
            </span>
            <div class="row-actions">
              <button type="button" class="btn btn-sm" (click)="openAdd(node.category.id!)" title="Add subcategory">+ Sub</button>
              <button type="button" class="btn btn-sm" (click)="edit(node.category)">Edit</button>
              <button type="button" class="btn btn-sm btn-danger" (click)="confirmDelete(node.category)">Delete</button>
            </div>
          </div>
        </div>
        <div class="tree-actions" *ngIf="hasOrderChange()">
          <button type="button" class="btn btn-primary" (click)="saveOrder()" [disabled]="saving">Save order</button>
          <button type="button" class="btn" (click)="resetOrder()">Reset</button>
        </div>
      </div>

      <!-- Add/Edit form overlay -->
      <div *ngIf="editing as e" class="form-overlay">
        <div class="form-card">
          <h3>{{ e.id ? 'Edit' : 'Add' }} category</h3>
          <div class="form-group">
            <label>Name</label>
            <input [(ngModel)]="e.name" placeholder="Category name" class="form-input" />
          </div>
          <div class="form-group">
            <label>Parent category</label>
            <select [(ngModel)]="e.parent_id" class="form-input">
              <option [ngValue]="null">None (top-level)</option>
              <option *ngFor="let c of allCategoriesFlat" [ngValue]="c.id" [disabled]="e.id === c.id || isInSubtree(c.id, e.id)">
                {{ indent(c) }}{{ c.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Slug (optional)</label>
            <input [(ngModel)]="e.slug" placeholder="url-slug" class="form-input" />
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="e.is_active" />
              Active
            </label>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-primary" (click)="save()" [disabled]="saving || !e.name">Save</button>
            <button type="button" class="btn" (click)="cancel()">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Delete confirm overlay -->
      <div *ngIf="toDelete" class="form-overlay">
        <div class="form-card">
          <h3>Delete category?</h3>
          <p>{{ getDeleteMessage() }}</p>
          <div class="form-actions">
            <button type="button" class="btn btn-danger" (click)="deleteConfirm()" [disabled]="saving">Delete</button>
            <button type="button" class="btn" (click)="toDelete = null">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-subcategories { max-width: 960px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-md); flex-wrap: wrap; gap: 12px; }
    .page-header h1 { margin: 0; }
    .page-sub { margin: 4px 0 0 0; color: var(--text-light); font-size: 14px; }
    .alert { padding: 12px; border-radius: 8px; margin-bottom: var(--spacing-sm); }
    .alert.error { background: #fee; color: #c00; }
    .alert.success { background: #efe; color: #262; }
    .loading, .empty { padding: var(--spacing-md); color: var(--text-light); }
    .tree-section { background: var(--text-white); border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px var(--shadow-light); }
    .tree-toolbar { padding: 10px 16px; background: var(--grey-light, #f5f5f5); border-bottom: 1px solid var(--border-color); font-size: 13px; color: var(--text-light); }
    .tree-list { min-height: 80px; }
    .tree-row {
      display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-bottom: 1px solid var(--border-color);
      transition: background 0.15s;
    }
    .tree-row:hover { background: rgba(0,0,0,0.02); }
    .tree-row.drag-over { background: rgba(0,100,200,0.08); }
    .drag-handle { cursor: grab; color: var(--text-light); font-size: 14px; padding: 4px; user-select: none; }
    .drag-handle:active { cursor: grabbing; }
    .expand, .expand-placeholder { width: 20px; text-align: center; cursor: pointer; font-size: 10px; color: var(--text-light); }
    .expand-placeholder { cursor: default; }
    .row-thumb { width: 36px; height: 36px; object-fit: cover; border-radius: 6px; }
    .name { font-weight: 600; min-width: 140px; }
    .slug { color: var(--text-light); font-size: 13px; min-width: 100px; }
    .status-badge { font-size: 11px; padding: 2px 8px; border-radius: 10px; }
    .status-badge.active { background: #d4edda; color: #155724; }
    .status-badge.inactive { background: #f8d7da; color: #721c24; }
    .row-actions { margin-left: auto; display: flex; gap: 6px; }
    .btn-sm { padding: 6px 10px; font-size: 12px; }
    .btn-danger { background: var(--accent-color); color: #fff; border-color: var(--accent-color); }
    .tree-actions { padding: 12px 16px; border-top: 1px solid var(--border-color); background: var(--grey-light, #f9f9f9); }
    .form-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .form-card { background: var(--text-white); padding: var(--spacing-md); border-radius: 12px; min-width: 320px; max-width: 90%; }
    .form-card h3 { margin-top: 0; }
    .form-group { margin-bottom: var(--spacing-sm); }
    .form-group label { display: block; margin-bottom: 4px; font-weight: 500; }
    .form-input { width: 100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 8px; }
    .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .form-actions { display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-md); }
  `]
})
export class AdminSubcategoriesComponent implements OnInit {
  tree: Category[] = [];
  flatNodes: FlatNode[] = [];
  allCategoriesFlat: Category[] = [];
  expandedIds = new Set<number | string>();
  loading = false;
  error = '';
  successMsg = '';
  saving = false;
  editing: Partial<Category> & { parent_id?: number | string | null } | null = null;
  toDelete: Category | null = null;
  private dragIndex: number | null = null;
  dragOverIndex: number | null = null;
  private initialFlat: FlatNode[] = [];

  constructor(private api: CategoryService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.api.getTree().subscribe({
      next: (res) => {
        this.tree = (res as any)?.data ?? res?.data ?? [];
        this.buildFlat();
        this.allCategoriesFlat = this.flattenForSelect(this.tree);
        this.initialFlat = this.flatNodes.map(n => ({ ...n, category: { ...n.category } }));
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load categories';
        this.loading = false;
      }
    });
  }

  private buildFlat() {
    const out: FlatNode[] = [];
    const visit = (list: Category[], depth: number, parentId: number | string | null) => {
      (list || []).forEach(c => {
        const children = (c as any).children || [];
        out.push({
          category: c,
          depth,
          parentId,
          childrenCount: children.length
        });
        if (this.isExpanded(c.id!)) {
          visit(children, depth + 1, c.id!);
        }
      });
    };
    visit(this.tree, 0, null);
    this.flatNodes = out;
  }

  private flattenForSelect(list: Category[], depth = 0): (Category & { _depth?: number })[] {
    const out: (Category & { _depth?: number })[] = [];
    (list || []).forEach(c => {
      out.push({ ...c, _depth: depth });
      out.push(...this.flattenForSelect((c as any).children || [], depth + 1));
    });
    return out;
  }

  indent(c: Category): string {
    const d = (c as any)._depth ?? 0;
    return '\u00A0'.repeat(d * 3) + (d > 0 ? '↳ ' : '');
  }

  /** True if nodeId is the same as rootId or lies under rootId (prevents cycle when choosing parent). */
  isInSubtree(nodeId: number | string | undefined, rootId: number | string | undefined): boolean {
    if (!nodeId || !rootId || nodeId === rootId) return nodeId === rootId;
    const root = this.findNode(this.tree, rootId);
    const visit = (list: Category[]): boolean => {
      for (const c of list || []) {
        if (c.id === nodeId) return true;
        if (visit((c as any).children || [])) return true;
      }
      return false;
    };
    return root ? visit((root as any).children || []) : false;
  }

  private findNode(list: Category[], id: number | string): Category | null {
    for (const c of list || []) {
      if (c.id === id) return c;
      const inChild = this.findNode((c as any).children || [], id);
      if (inChild) return inChild;
    }
    return null;
  }

  isExpanded(id: number | string): boolean {
    return this.expandedIds.has(id);
  }

  toggleExpand(id: number | string) {
    if (this.expandedIds.has(id)) this.expandedIds.delete(id);
    else this.expandedIds.add(id);
    this.buildFlat();
  }

  canDrop(targetIndex: number): boolean {
    if (this.dragIndex == null) return false;
    const src = this.flatNodes[this.dragIndex];
    const tgt = this.flatNodes[targetIndex];
    if (!src || !tgt) return false;
    return src.depth === tgt.depth && src.parentId === tgt.parentId;
  }

  onDragStart(ev: DragEvent, index: number) {
    this.dragIndex = index;
    ev.dataTransfer!.effectAllowed = 'move';
    ev.dataTransfer!.setData('text/plain', String(index));
  }

  onDragOver(ev: DragEvent, index: number) {
    ev.preventDefault();
    if (this.canDrop(index)) this.dragOverIndex = index;
  }

  onDrop(ev: DragEvent, targetIndex: number) {
    ev.preventDefault();
    this.dragOverIndex = null;
    if (this.dragIndex == null || !this.canDrop(targetIndex) || this.dragIndex === targetIndex) {
      this.dragIndex = null;
      return;
    }
    const nodes = [...this.flatNodes];
    const [moved] = nodes.splice(this.dragIndex, 1);
    nodes.splice(targetIndex, 0, moved);
    this.flatNodes = nodes;
    this.dragIndex = null;
  }

  onDragEnd() {
    this.dragIndex = null;
    this.dragOverIndex = null;
  }

  hasOrderChange(): boolean {
    if (this.initialFlat.length !== this.flatNodes.length) return true;
    for (let i = 0; i < this.flatNodes.length; i++) {
      if (this.flatNodes[i].category.id !== this.initialFlat[i].category.id) return true;
    }
    return false;
  }

  resetOrder() {
    this.flatNodes = this.initialFlat.map(n => ({ ...n, category: { ...n.category } }));
  }

  saveOrder() {
    const updates = this.buildOrderUpdates();
    if (updates.length === 0) return;
    this.saving = true;
    this.api.reorder(updates).subscribe({
      next: () => {
        this.saving = false;
        this.successMsg = 'Order saved.';
        setTimeout(() => this.successMsg = '', 3000);
        this.load();
      },
      error: () => {
        this.saving = false;
        this.error = 'Failed to save order';
      }
    });
  }

  private buildOrderUpdates(): { id: number | string; sort_order: number; parent_id: number | string | null }[] {
    const byParent = new Map<string, number>();
    return this.flatNodes.map(node => {
      const key = node.parentId == null ? 'null' : String(node.parentId);
      const sort_order = byParent.get(key) ?? 0;
      byParent.set(key, sort_order + 1);
      return {
        id: node.category.id!,
        sort_order,
        parent_id: node.parentId
      };
    });
  }

  openAdd(parentId: number | string | null) {
    const numericParentId: number | null = parentId != null ? Number(parentId) : null;
    this.editing = { name: '', slug: '', is_active: true, parent_id: numericParentId };
  }

  edit(c: Category) {
    this.editing = { ...c, parent_id: c.parent_id ?? null };
  }

  cancel() {
    this.editing = null;
  }

  save() {
    if (!this.editing || !this.editing.name || this.saving) return;
    this.saving = true;
    const id = this.editing.id;
    const payload = {
      name: this.editing.name,
      slug: this.editing.slug || undefined,
      is_active: this.editing.is_active !== false,
      parent_id: this.editing.parent_id ?? null
    };
    const op = id ? this.api.update(id, payload) : this.api.create(payload);
    op.subscribe({
      next: () => {
        this.saving = false;
        this.cancel();
        this.load();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Save failed';
        this.saving = false;
      }
    });
  }

  getDeleteMessage(): string {
    if (!this.toDelete) return '';
    const children = (this.toDelete as Category & { children?: Category[] }).children;
    const hasChildren = Array.isArray(children) && children.length > 0;
    return hasChildren
      ? `Delete "${this.toDelete.name}" and its subcategories?`
      : `Delete "${this.toDelete.name}"?`;
  }

  confirmDelete(c: Category) {
    this.toDelete = c;
  }

  deleteConfirm() {
    if (!this.toDelete || this.saving) return;
    this.saving = true;
    this.api.delete(this.toDelete.id!).subscribe({
      next: () => {
        this.saving = false;
        this.toDelete = null;
        this.load();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Delete failed';
        this.saving = false;
      }
    });
  }
}
