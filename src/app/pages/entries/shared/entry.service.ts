import { Injectable, Injector } from '@angular/core';

import { Observable, throwError } from 'rxjs';
import { flatMap, catchError, map } from 'rxjs/operators';

import { BaseResourceService } from 'src/app/shared/service/base-resource.service';
import { CategoryService } from '../../categories/shared/category.service';
import { Entry } from './entry.model';
@Injectable({
  providedIn: 'root'
})
export class EntryService extends BaseResourceService<Entry> {

  constructor(
    protected injector: Injector,
    private categoryService: CategoryService) {
    super("api/entries", injector)
  }

  create(entry: Entry): Observable<Entry> {

    return this.categoryService.getByid(entry.categoryId!).pipe(
      flatMap(category => {
        entry.category = category
        return super.create(entry)
      })
    )
  }

  update(entry: Entry): Observable<Entry> {
    return this.categoryService.getByid(entry.categoryId!).pipe(
      flatMap(category => {
        entry.category = category
        return super.update(entry)
      })
    )
  }

  protected jsonDataToResources(jsonData: any[]): Entry[] {
    const entries: Entry[] = [];
    jsonData.forEach(element => {
      const entry = Object.assign(new Entry(), element);
      entries.push(entry);
    });
    return entries;
  }

  protected jsonDataToResource(jsonData: any): Entry {
    return jsonData as Entry;
  }
}