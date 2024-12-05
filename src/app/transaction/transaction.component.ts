import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Transaction, Category } from '../../types/interfaces';
import { CommonModule } from '@angular/common';
import { Split } from '../../types/interfaces';
import { AddSplitModalComponent } from '../add-split-modal/add-split-modal.component';
import { TransactionService } from '../services/transaction.service';
import { CategoryService } from '../services/categories.service';

@Component({
  standalone: true,
  imports: [CommonModule, AddSplitModalComponent],
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
})
export class TransactionComponent implements OnInit {
  @Input() transaction: Transaction | null = null;
  @Output() openCategoryModal = new EventEmitter<string>();
  @Input() isSelecting: boolean = false;
  @Input() isSelected: boolean = false;
  @Output() transactionSelected = new EventEmitter<string>();
  @Output() splitsAdded = new EventEmitter<Transaction>();

  showSplitModal: boolean = false;
  showSplits: boolean = false;
  editingSplits: Split[] = [];
  categories: Category[] = [];

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  toggleSelection(): void {
    this.transactionSelected.emit(this.transaction?.id);
  }

  openSplitTransactionModal(): void {
    this.showSplitModal = true;
  }

  closeSplitModal(): void {
    this.showSplitModal = false;
  }

  toggleShowSplits(): void {
    this.showSplits = !this.showSplits;
  }

  handleSplitsAdded(splits: Split[]): void {
    if (this.transaction) {
      this.transaction.splits = this.assignCategoriesToSplits(splits);
      this.transactionService.splitTransaction(this.transaction)
    }
    this.closeSplitModal();
  }

  loadCategories(): void {
    this.categoryService.fetchCategories({}).subscribe({
      next: (response) => {
        this.categories = response.items;
        if (this.transaction) {
          this.transaction = this.assignCategoriesToTransaction(
            this.transaction
          );
        }
      },
      error: (error) => {
        console.error('Error loading categories', error);
      },
    });
  }

  assignCategoriesToTransaction(transaction: Transaction): Transaction {
    const categoryMap = new Map(this.categories.map((cat) => [cat.code, cat]));
    return {
      ...transaction,
      category: categoryMap.get(transaction.catcode) || undefined,
      splits:
        transaction.splits?.map((split) => ({
          ...split,
          category: categoryMap.get(split.catcode) || undefined,
        })) || [],
    };
  }

  assignCategoriesToSplits(splits: Split[]): Split[] {
    const categoryMap = new Map(this.categories.map((cat) => [cat.code, cat]));
    return splits.map((split) => ({
      ...split,
      category: categoryMap.get(split.catcode) || undefined,
    }));
  }
  getTransactionKindLabel(kind: string): string {
    switch (kind) {
      case 'pmt':
        return 'Payment';
      case 'dep':
        return 'Deposit';
      case 'fee':
        return 'Fee';
      default:
        return 'Unknown';
    }
  }
}
