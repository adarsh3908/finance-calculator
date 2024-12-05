mport { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { FinancialOverviewComponent } from "./financial-overview/financial-overview.component";
import { FiltersComponent } from './filters/filters.component';
import { TransactionsListComponent } from './transaction-list/transaction-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent, ToolbarComponent, FinancialOverviewComponent, FiltersComponent, TransactionsListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Asee';
  filterData: any = {};

  onFiltersApplied(filters: any): void {
    this.filterData = filters;
  }

  onFiltersCleared(): void {
    this.filterData = {};
  }
}