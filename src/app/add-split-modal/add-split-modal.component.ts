import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CategoryService } from '../services/categories.service';
import {
  Category,
  CategoriesResponse,
  Split,
  Transaction,
} from '../../types/interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SplitData {
  selectedMainCategory: string | null;
  selectedSubCategory: string | null;
  subCategories: Category[];
  amount: number;
}

@Component({
  standalone: true,
  selector: 'app-add-split-modal',
  templateUrl: './add-split-modal.component.html',
  styleUrls: ['./add-split-modal.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class AddSplitModalComponent implements OnInit {
  @Input() transaction: Transaction | null = null;
  @Output() splitAdded: EventEmitter<Split[]> = new EventEmitter<Split[]>();
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();
  allCategories: Category[] = [];
  mainCategories: Category[] = [];
  subCategories: Category[] = [];
  splits: SplitData[] = [
    {
      selectedMainCategory: null,
      selectedSubCategory: null,
      subCategories: [],
      amount: 0,
    },
    {
      selectedMainCategory: null,
      selectedSubCategory: null,
      subCategories: [],
      amount: 0,
    },
  ];

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadMainCategories();
  }


  loadMainCategories(): void {
    this.categoryService.fetchCategories({}).subscribe({
      next: (response) => {
        this.allCategories = response.items;
        this.mainCategories = this.allCategories.filter(
          (category) => !category['parent-code']
        );
      },
      error: (error) => {
        console.error('Error loading categories', error);
      },
    });
  }

  updateSubCategories(index: number): void {
    const selectedMainCategory = this.splits[index].selectedMainCategory;
    if (selectedMainCategory) {
      this.splits[index].subCategories = this.allCategories.filter(
        (category) => category['parent-code'] === selectedMainCategory
      );
    }
  }

  addSplit(): void {
    this.splits.push({
      selectedMainCategory: null,
      selectedSubCategory: null,
      subCategories: [],
      amount: 0,
    });
  }

  removeSplit(index: number): void {
    if (this.splits.length > 1) {
      this.splits.splice(index, 1);
    }
  }

  get totalAmount(): number {
    return this.splits.reduce((sum, split) => sum + split.amount, 0);
  }

  get isApplyDisabled(): boolean {
    if (this.splits.length < 1) {
      return true;
    }
    for (const split of this.splits) {
      if (!split.selectedMainCategory || split.amount <= 0) {
        return true;
      }
    }
    return this.totalAmount !== this.transaction?.amount;
  }

  applySplits(): void {
    if (this.isApplyDisabled) {
      alert('Please select a category and amount for each split');
      return;
    }

    const validSplits = this.splits.map((split) => ({
      catcode: split.selectedSubCategory
        ? split.selectedSubCategory
        : split.selectedMainCategory || '',
      amount: split.amount,
    }));
    this.splitAdded.emit(validSplits);
    this.onCloseModal();
  }

  onCloseModal(): void {
    this.closeModal.emit();
  }
}
