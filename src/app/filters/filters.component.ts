import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
  imports: [ FormsModule ],
})
export class FiltersComponent {
  @Output() filtersApplied = new EventEmitter<any>();
  @Output() filtersCleared = new EventEmitter<void>();

  fromDate: string | null = null;
  toDate: string | null = null;
  selectedOptionType: string = '';
  selectedOptionAccount: string = 'all';
  beneficiary: string = '';

  applyFilters(): void {
    const filters = {
      fromDate: this.fromDate,
      toDate: this.toDate,
      selectedOptionType: this.selectedOptionType,
      selectedOptionAccount: this.selectedOptionAccount,
      beneficiary: this.beneficiary,
    };
    this.filtersApplied.emit(filters);
  }

  clearFilters(): void {
    this.fromDate = null;
    this.toDate = null;
    this.selectedOptionType = '';
    this.selectedOptionAccount = 'all';
    this.beneficiary = '';
    this.filtersCleared.emit();
  }
}
