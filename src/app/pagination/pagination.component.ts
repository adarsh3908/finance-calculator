import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() currentPage: number = 1;
  @Output() pageChanged = new EventEmitter<number>();
  @Output() itemsPerPageChanged = new EventEmitter<number>();

  totalPages: number = 0;
  pages: number[] = [];

  ngOnInit(): void {
    this.calculateTotalPages();
    this.generatePagesArray();
  }

  ngOnChanges(): void {
    this.calculateTotalPages();
    this.generatePagesArray();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  }

  generatePagesArray(): void {
    this.pages = Array.from({ length: this.totalPages }, (v, k) => k + 1);
  }

  selectPage(page: number): void {
    this.currentPage = page;
    this.pageChanged.emit(this.currentPage);
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.selectPage(this.currentPage - 1);
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.selectPage(this.currentPage + 1);
    }
  }

  onItemsPerPageChange(): void {
    this.itemsPerPageChanged.emit(this.itemsPerPage);
    this.calculateTotalPages();
    this.selectPage(1); // Reset to first page when items per page change
  }
}