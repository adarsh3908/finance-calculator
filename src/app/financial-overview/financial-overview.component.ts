import { Component } from '@angular/core';
import { TransactionsListComponent } from '../transaction-list/transaction-list.component';

@Component({
  selector: 'app-financial-overview',
  standalone: true,
  imports: [ TransactionsListComponent],
  templateUrl: './financial-overview.component.html',
  styleUrl: './financial-overview.component.scss'
})
export class FinancialOverviewComponent {

}
