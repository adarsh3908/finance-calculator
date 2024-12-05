import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CategoryService } from '../services/categories.service';
import { Category, Transaction } from '../../types/interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-add-category-modal',
  templateUrl: './add-category-modal.component.html',
  styleUrls: ['./add-category-modal.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class AddCategoryModalComponent implements OnInit, OnChanges {
  @Input() transactionIds: string[] = [];
  @Input() transaction: Transaction | null = null; // New input for single transaction
  @Output() categoryAdded = new EventEmitter<{ categoryCode: string; subCategoryCode: string | null }>();
  @Output() closeModal = new EventEmitter<void>();

  allCategories: Category[] = [];
  mainCategories: Category[] = [];
  subCategories: Category[] = [];
  selectedMainCategory: string | null = null;
  selectedSubCategory: string | null = null;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transaction']) {
      this.setInitialCategories();
    }
  }

  loadCategories(): void {
    this.categoryService.fetchCategories({}).subscribe({
      next: (response) => {
        this.allCategories = response.items;
        this.mainCategories = this.allCategories.filter(category => !category['parent-code']);
        this.setInitialCategories();
      },
      error: (error) => {
        console.error('Error loading categories', error);
      }
    });
  }

  setInitialCategories(): void {
    if (this.transaction) {
      const selectedCategory = this.allCategories.find(
        (category) => category.code === this.transaction?.catcode
      );
  
      if (selectedCategory) {
        if (selectedCategory['parent-code']) {
          // The selected category is a subcategory
          this.selectedMainCategory = selectedCategory['parent-code'];
          this.selectedSubCategory = selectedCategory.code;
        } else {
          // The selected category is a main category
          this.selectedMainCategory = selectedCategory.code;
          this.selectedSubCategory = null;
        }
  
        // Update subcategories after setting the main category
        this.updateSubCategories();
      }
    }
  }
  

  updateSubCategories(): void {
    if (this.selectedMainCategory) {
      this.subCategories = this.allCategories.filter(category => category['parent-code'] === this.selectedMainCategory);
      if (!this.subCategories.find(sub => sub.code === this.selectedSubCategory)) {
        this.selectedSubCategory = null;
      }
    } else {
      this.subCategories = [];
      this.selectedSubCategory = null;
    }
  }

  addCategory(): void {
    if (this.selectedMainCategory) {
      this.categoryAdded.emit({ 
        categoryCode: this.selectedSubCategory || this.selectedMainCategory, 
        subCategoryCode: this.selectedSubCategory 
      });
      this.onCloseModal();
    }
  }

  onCloseModal(): void {
    this.closeModal.emit();
  }
}
