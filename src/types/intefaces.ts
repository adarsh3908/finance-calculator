export interface Transaction {
    id: string;
    'beneficiary-name': string;
    date: string;
    direction: 'd' | 'c';
    amount: number;
    description: string;
    currency: string;
    mcc?: number;
    kind: string;
    catcode: string;
    category?: Category; 
    splits: Split[];
  }
  
  export interface Split {
    catcode: string; 
    amount: number; 
    category?: Category;
  }
  
  export interface TransactionsResponse {
    items: Transaction[];
    page: number;
    'page-size': number;
    'sort-by': string;
    'sort-order': string;
    'total-count': number;
  }
  
  export interface TransactionFilters {
    [key: string]: string | number | undefined;
    transactionKind?: string;
    startDate?: string;
    endDate?: string;
    page: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
  }
  
  export interface Category {
    code: string;
    name: string;
    'parent-code': string;
  }
  
  export interface CategoriesResponse {
    items: Category[];
  }