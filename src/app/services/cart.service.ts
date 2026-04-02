import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, Product, maxQuantityForCartLine } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>(this.cartItems);
  public cart$ = this.cartSubject.asObservable();

  constructor() {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage(): void {
    const stored = localStorage.getItem('legado_cart');
    if (stored) {
      try {
        this.cartItems = JSON.parse(stored);
        this.cartSubject.next(this.cartItems);
      } catch (e) {
        console.error('Error loading cart from storage', e);
      }
    }
  }

  private saveCartToStorage(): void {
    localStorage.setItem('legado_cart', JSON.stringify(this.cartItems));
  }

  addToCart(product: Product, quantity: number = 1, selectedSize?: string, selectedColor?: string): void {
    const existingItem = this.cartItems.find(item => 
      item.product.id === product.id &&
      item.selectedSize === selectedSize &&
      item.selectedColor === selectedColor
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({
        product,
        quantity,
        selectedSize,
        selectedColor
      });
    }

    this.cartSubject.next(this.cartItems);
    this.saveCartToStorage();
  }

  removeFromCart(itemId: string, selectedSize?: string, selectedColor?: string): void {
    this.cartItems = this.cartItems.filter(
      item =>
        !(
          item.product.id === itemId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
        )
    );
    this.cartSubject.next(this.cartItems);
    this.saveCartToStorage();
  }

  updateQuantity(itemId: string, quantity: number, selectedSize?: string, selectedColor?: string): void {
    const item = this.cartItems.find(
      i =>
        i.product.id === itemId &&
        i.selectedSize === selectedSize &&
        i.selectedColor === selectedColor
    );
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(itemId, selectedSize, selectedColor);
      } else {
        const maxQ = maxQuantityForCartLine(item.product, item.selectedSize);
        item.quantity = maxQ > 0 ? Math.min(quantity, maxQ) : quantity;
        this.cartSubject.next(this.cartItems);
        this.saveCartToStorage();
      }
    }
  }

  clearCart(): void {
    this.cartItems = [];
    this.cartSubject.next(this.cartItems);
    localStorage.removeItem('legado_cart');
  }

  getCartItems(): CartItem[] {
    return this.cartItems;
  }

  getCartCount(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getCartTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  getCartSubtotal(): number {
    return this.getCartTotal();
  }

  getEstimatedTax(): number {
    // Assuming 8% tax rate
    return this.getCartSubtotal() * 0.08;
  }

  getCartTotalWithTax(): number {
    return this.getCartSubtotal() + this.getEstimatedTax();
  }
}
