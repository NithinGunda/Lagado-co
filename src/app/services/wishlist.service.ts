import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';

const WISHLIST_STORAGE_KEY = 'legado_wishlist';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private items: Product[] = [];
  private subject = new BehaviorSubject<Product[]>(this.items);

  /** Stream of current wishlist items. */
  readonly wishlist$: Observable<Product[]> = this.subject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  /** Stable key: product id + normalized size (empty = one-size / legacy). */
  lineKey(product: Pick<Product, 'id'> & { wishlistSize?: string }): string {
    const id = String(product?.id ?? '');
    const s = (product.wishlistSize ?? '').trim();
    return `${id}::${s}`;
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        this.items = [];
        return;
      }
      // Normalize legacy entries (no wishlistSize)
      this.items = parsed.map((p: Product) => ({
        ...p,
        wishlistSize: p.wishlistSize != null && String(p.wishlistSize).trim() !== '' ? String(p.wishlistSize).trim() : undefined,
      }));
      this.subject.next(this.items);
    } catch {
      this.items = [];
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(this.items));
    this.subject.next(this.items);
  }

  /** Add a product line (id + size). No duplicate lines. */
  add(product: Product): void {
    const id = String(product?.id ?? '');
    if (!id) return;
    const line: Product = {
      ...product,
      wishlistSize: product.wishlistSize != null && String(product.wishlistSize).trim() !== ''
        ? String(product.wishlistSize).trim()
        : undefined,
    };
    const key = this.lineKey(line);
    if (this.items.some(p => this.lineKey(p) === key)) return;
    this.items = [...this.items, line];
    this.saveToStorage();
  }

  /** Remove every wishlist line for this product id (e.g. listing card heart off). */
  removeAllByProductId(productId: string | number): void {
    const id = String(productId ?? '');
    if (!id) return;
    this.items = this.items.filter(p => String(p.id) !== id);
    this.saveToStorage();
  }

  /** Remove one line (id + wishlistSize). */
  removeProductLine(product: Product): void {
    const key = this.lineKey(product);
    this.items = this.items.filter(p => this.lineKey(p) !== key);
    this.saveToStorage();
  }

  /**
   * @deprecated Use removeProductLine or removeAllByProductId
   */
  remove(productId: string | number): void {
    this.removeAllByProductId(productId);
  }

  /**
   * Toggle exact line (id + wishlistSize). Returns true if now in wishlist.
   * Caller must pass product with correct wishlistSize for sized products.
   */
  toggle(product: Product): boolean {
    const id = String(product?.id ?? '');
    if (!id) return false;
    const line: Product = {
      ...product,
      wishlistSize: product.wishlistSize != null && String(product.wishlistSize).trim() !== ''
        ? String(product.wishlistSize).trim()
        : undefined,
    };
    const key = this.lineKey(line);
    const inList = this.items.some(p => this.lineKey(p) === key);
    if (inList) {
      this.items = this.items.filter(p => this.lineKey(p) !== key);
      this.saveToStorage();
      return false;
    }
    this.add(line);
    return true;
  }

  /** Exact line (product id + size) is in wishlist. */
  hasLine(product: Pick<Product, 'id'> & { wishlistSize?: string }): boolean {
    const key = this.lineKey(product);
    return this.items.some(p => this.lineKey(p) === key);
  }

  /** Any wishlist line for this product (for grid heart state). */
  hasProductId(productId: string | number): boolean {
    const id = String(productId ?? '');
    return this.items.some(p => String(p.id) === id);
  }

  /** @deprecated Use hasProductId (listing) or hasLine (details) */
  has(productId: string | number): boolean {
    return this.hasProductId(productId);
  }

  getItems(): Product[] {
    return [...this.items];
  }

  getCount(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
    if (typeof localStorage !== 'undefined') localStorage.removeItem(WISHLIST_STORAGE_KEY);
    this.subject.next(this.items);
  }
}
