import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CreateOrderRequest {
  product_id: string | number;
  product_name: string;
  quantity: number;
  amount_paise: number;
  size?: string;
  color?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  receipt?: string;
}

export interface RazorpayPaymentSuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private base = `${environment.apiBaseUrl}/payment`;
  private scriptLoaded = false;

  constructor(private http: HttpClient) {}

  createOrder(req: CreateOrderRequest): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(`${this.base}/create-order`, req).pipe(
      catchError(err => {
        console.error('Payment createOrder failed', err);
        throw err;
      })
    );
  }

  loadRazorpayScript(): Observable<void> {
    if (this.scriptLoaded && window.Razorpay) {
      return of(undefined);
    }
    return from(
      new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = RAZORPAY_SCRIPT;
        script.async = true;
        script.onload = () => {
          this.scriptLoaded = true;
          resolve();
        };
        script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'));
        document.body.appendChild(script);
      })
    );
  }

  openRazorpayCheckout(options: {
    keyId: string;
    orderId: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    prefill?: { name?: string; email?: string; contact?: string };
    handler: (response: RazorpayPaymentSuccess) => void;
    onClose?: () => void;
  }): void {
    this.loadRazorpayScript().subscribe({
      next: () => {
        const rzpOptions: any = {
          key: options.keyId,
          amount: options.amount,
          currency: options.currency,
          name: options.name,
          description: options.description || 'Purchase from Legado & Co',
          order_id: options.orderId,
          prefill: options.prefill || {},
          theme: { color: '#1a1a1a' },
          modal: { ondismiss: options.onClose },
          handler: options.handler,
          method: {
            upi: true,
            card: true,
            netbanking: true,
            wallet: true,
          },
        };
        const rzp = new window.Razorpay(rzpOptions);
        rzp.open();
      },
      error: err => {
        console.error('Razorpay script load failed', err);
        if (options.onClose) options.onClose();
      },
    });
  }
}
