
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Category, CategoriesResponse } from '../../types/interfaces';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoriesSubject = new BehaviorSubject<CategoriesResponse | null>(null);
  categories$ = this.categoriesSubject.asObservable();

  private apiUrl = 'http://127.0.0.1:4010/categories';

  constructor(private http: HttpClient) { }

  fetchCategories(filters: any): Observable<CategoriesResponse> {
    let params = new HttpParams();
    Object.keys(filters).forEach((key) => {
      params = params.append(key, filters[key]);
    });

    return this.http.get<CategoriesResponse>(this.apiUrl, { params }).pipe(
      tap((response: CategoriesResponse) => this.updateCategories(response)),
      catchError((error) => {
        console.error('Error in fetchCategories:', error);
        return throwError(() => new Error('Error fetching categories'));
      })
    );
  }

  updateCategories(categories: CategoriesResponse): void {
    this.categoriesSubject.next(categories);
  }
}
