import { Component, OnInit, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { TransactionService } from '../services/transaction.service';
import { CategoryService } from '../services/categories.service';
import { TransactionsResponse, Transaction, Category, CategoriesResponse } from '../../types/interfaces';
import { CommonModule } from '@angular/common';
import { TransactionComponent } from '../transaction/transaction.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AddCategoryModalComponent } from '../add-category-modal/add-category-modal.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TransactionComponent,
    PaginationComponent,
    FormsModule,
    AddCategoryModalComponent,
  ],
  selector: 'app-transactions-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss'],
})
export class TransactionsListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() filterData: any = {};
  transactions: TransactionsResponse | null = null;
  categories: Category[] = [];
  currentPage: number = 1;
  pageSize: number = 3; // Set the default page size
  private transactionsSub: Subscription | null = null;
  showCategoryModal: boolean = false;
  selectedTransactionIds: string[] = [];
  isSelecting: boolean = false;
  singleTransaction: Transaction | null = null; // New property for single transaction

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
    this.loadCategories();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filterData']) {
      this.loadTransactions();
    }
  }

  ngOnDestroy(): void {
    if (this.transactionsSub) {
      this.transactionsSub.unsubscribe();
    }
  }

  loadCategories(): void {
    this.categoryService.fetchCategories({}).subscribe({
      next: (response: CategoriesResponse) => {
        this.categories = response.items;
        this.loadTransactions();
      },
      error: (error: any) => {
        console.error('Error loading categories', error);
      },
    });
  }

  loadTransactions(): void {
    if (this.transactionsSub) {
      this.transactionsSub.unsubscribe();
    }

    this.transactionService.getTransactions(
      this.currentPage,
      this.pageSize,
      this.filterData
    );
    this.transactionsSub = this.transactionService.transactions$.subscribe({
      next: (data: TransactionsResponse | null) => {
        if (data) {
          const sortedItems = data.items.sort((a, b) => {
            const dateComparison =
              new Date(b.date).getTime() - new Date(a.date).getTime();
            if (dateComparison !== 0) return dateComparison;

            if (a.catcode === undefined && b.catcode !== undefined) return 1;
            if (a.catcode !== undefined && b.catcode === undefined) return -1;
            if (a.catcode === undefined && b.catcode === undefined) return 0;
            return a.catcode.localeCompare(b.catcode);
          });

          this.transactions = {
            ...data,
            items: this.assignCategoriesToTransactions(sortedItems),
          };
        }
      },
      error: (error: any) => {
        console.error('Error loading transactions', error);
      },
    });
  }

  assignCategoriesToTransactions(transactions: Transaction[]): Transaction[] {
    const categoryMap = new Map(this.categories.map((cat) => [cat.code, cat]));
    return transactions.map((transaction) => ({
      ...transaction,
      category: categoryMap.get(transaction.catcode) || undefined,
    }));
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.loadTransactions();
  }

  onItemsPerPageChanged(itemsPerPage: number): void {
    this.pageSize = itemsPerPage;
    this.currentPage = 1; // Reset to first page when items per page change
    this.loadTransactions();
  }

  onTransactionModified(transaction: Transaction): void {

    
    if (transaction.id) {
      this.transactionService.modifyTransaction(transaction);
      this.loadTransactions();
    }
  }

  onSplitsAdded(transaction: Transaction): void {
    console.log('onSplitsAdded - Transaction:', transaction);
    this.transactionService.modifyTransaction(transaction);
    this.loadTransactions();
  }

  toggleSelect(transactionId: string): void {
    const index = this.selectedTransactionIds.indexOf(transactionId);
    if (index > -1) {
      this.selectedTransactionIds.splice(index, 1);
    } else {
      this.selectedTransactionIds.push(transactionId);
    }
  }

  confirmSelection(): void {
    if (this.selectedTransactionIds.length > 0) {
      this.openCategoryModal();
    }
  }

  openCategoryModal(transaction: Transaction | null = null): void {
    this.singleTransaction = transaction;
    this.showCategoryModal = true;
  }

  handleCategoryAdded(event: { categoryCode: string; subCategoryCode: string | null }): void {
    if (this.singleTransaction) {
      this.singleTransaction.catcode = event.categoryCode;
      this.onTransactionModified(this.singleTransaction);
    } else {
      this.selectedTransactionIds.forEach((id) => {
        const transaction = this.transactions?.items.find((t) => t.id === id);
        if (transaction) {
          transaction.catcode = event.categoryCode;
          this.onTransactionModified(transaction);
        }
      });
    }
    this.cancelSelection();
    this.closeCategoryModal();
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
    this.selectedTransactionIds = [];
    this.singleTransaction = null;
  }

  onTransactionSelected(transactionId: string): void {
    this.toggleSelect(transactionId);
  }

  startSelecting(): void {
    this.isSelecting = true;
  }

  cancelSelection(): void {
    this.isSelecting = false;
    this.selectedTransactionIds = [];
  }
}
