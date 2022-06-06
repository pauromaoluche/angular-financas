import { Component, OnInit } from '@angular/core';

import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {

  categories: Category[] = [];

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(
      categories => this.categories = categories,
      error => alert('Erro ao carregar a lista')
    )
  }

  deleteCategory(category: any) {
    /* confirmador de delete */
    const mustDelte = confirm("Deseja realment excluir este item ?");

    if (mustDelte) {
      this.categoryService.delete(category.id).subscribe(
        /* renderiza as categorias novamente, mas sem a que foi excluida */
        () => this.categories = this.categories.filter(element => element != category),
        () => alert("Erro ao tentar excluir")
      )
    }
  }
}
