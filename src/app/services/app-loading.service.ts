import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppLoadingService {
  private states = new Map<string, boolean>();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  readonly loading$ = this.loadingSubject.asObservable();

  setLoading(key: string, value: boolean) {
    this.states.set(key, value);
    const anyLoading = Array.from(this.states.values()).some(v => v);
    this.loadingSubject.next(anyLoading);
  }
}

