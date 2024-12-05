import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Transaction, TransactionsResponse } from '../../types/interfaces';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private transactionsSubject =
    new BehaviorSubject<TransactionsResponse | null>(null);
  transactions$ = this.transactionsSubject.asObservable();

  private apiUrl = 'http://127.0.0.1:4010/transactions';
  private localStorageKey = 'transactions';

  private currentPage = 1;
  private currentPageSize = 3;

  constructor(private http: HttpClient) {
    this.initializeTransactions();
  }

  private initializeTransactions(): void {
    const storedTransactions = this.getStoredTransactions();
    if (storedTransactions.length === 0) {
      this.fetchTransactionsFromApi().subscribe();
    } else {
      this.updateTransactions();
    }
  }

  fetchTransactionsFromApi(): Observable<TransactionsResponse> {
    return this.http.get<TransactionsResponse>(this.apiUrl).pipe(
      tap((response: TransactionsResponse) => {
        this.storeTransactions(response.items);
        this.updateTransactions();
      }),
      catchError((error) => {
        console.error('Error fetching transactions from API:', error);
        return throwError(() => new Error('Error fetching transactions'));
      })
    );
  }

  private storeTransactions(transactions: Transaction[]): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(transactions));
  }

  private getStoredTransactions(): Transaction[] {
    const storedTransactions = localStorage.getItem(this.localStorageKey);
    return storedTransactions ? JSON.parse(storedTransactions) : [];
  }

  private sortTransactions(transactions: Transaction[]): Transaction[] {
    return transactions.sort((a, b) => {
      const dateComparison =
        new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison !== 0) return dateComparison;

      if (a.catcode === undefined && b.catcode !== undefined) return 1;
      if (a.catcode !== undefined && b.catcode === undefined) return -1;
      if (a.catcode === undefined && b.catcode === undefined) return 0;
      return a.catcode.localeCompare(b.catcode);
    });
  }

  updateTransactions(): void {
    let storedTransactions = this.getStoredTransactions();
    storedTransactions = this.sortTransactions(storedTransactions);
    const paginatedTransactions = storedTransactions.slice(
      (this.currentPage - 1) * this.currentPageSize,
      this.currentPage * this.currentPageSize
    );
    const transactionsResponse: TransactionsResponse = {
      items: paginatedTransactions,
      ['total-count']: storedTransactions.length,
      page: this.currentPage,
      'page-size': this.currentPageSize,
      'sort-by': '',
      'sort-order': '',
    };
    this.transactionsSubject.next(transactionsResponse);
  }

  getTransactions(page: number, pageSize: number, filters: any = {}): void {
    this.currentPage = page;
    this.currentPageSize = pageSize;
    let storedTransactions = this.getStoredTransactions();

    // Apply filters
    if (filters.selectedOptionType) {
      storedTransactions = storedTransactions.filter(
        (transaction) => transaction.kind === filters.selectedOptionType
      );
    }

    if (filters.fromDate) {
      storedTransactions = storedTransactions.filter(
        (transaction) =>
          new Date(transaction.date) >= new Date(filters.fromDate)
      );
    }

    if (filters.toDate) {
      storedTransactions = storedTransactions.filter(
        (transaction) => new Date(transaction.date) <= new Date(filters.toDate)
      );
    }

    if (filters.beneficiary) {
      storedTransactions = storedTransactions.filter((transaction) =>
        transaction['beneficiary-name'].includes(filters.beneficiary)
      );
    }

    storedTransactions = this.sortTransactions(storedTransactions);

    const paginatedTransactions = storedTransactions.slice(
      (page - 1) * pageSize,
      page * pageSize
    );
    const transactionsResponse: TransactionsResponse = {
      items: paginatedTransactions,
      ['total-count']: storedTransactions.length,
      page: page,
      'page-size': pageSize,
      'sort-by': '',
      'sort-order': '',
    };
    this.transactionsSubject.next(transactionsResponse);
  }

  modifyTransaction(transaction: Transaction): void {
    let storedTransactions = this.getStoredTransactions();
    const index = storedTransactions.findIndex((t) => t.id === transaction.id);
    this.http
      .post(`http://127.0.0.1:4010/transaction/${transaction.id}/categorize`, {
        catcode: transaction.catcode,
      })
      .subscribe({
        next: () => {
          console.log('Transaction modified API call successful');
        },
        error: (error) => {
          console.error('Error modifying transaction', error);
        },
      });
    if (index !== -1) {
      storedTransactions[index] = transaction;
      this.storeTransactions(storedTransactions);
      this.updateTransactions();
    }
  }

  splitTransaction(transaction: Transaction): void {
    let storedTransactions = this.getStoredTransactions();
    const index = storedTransactions.findIndex((t) => t.id === transaction.id);
    this.http
      .post(`http://127.0.0.1:4010/transaction/${transaction.id}/split`, {
        splits: transaction.splits,
      })
      .subscribe({
        next: () => {
          console.log('Transaction Splited API Call successful');
        },
        error: (error) => {
          console.error('Error splitting transaction', error);
        },
      });
    if (index !== -1) {
      storedTransactions[index] = transaction;
      this.storeTransactions(storedTransactions);
      this.updateTransactions();
    }
  }
}
