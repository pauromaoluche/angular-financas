import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
/* Importamos as rotas para identificar quando estamos criando ou editando as rotas referentes */
import { ActivatedRoute, Router } from '@angular/router';

import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';

/* importamos o switchMap para poder manipular a rota enquanto trabalhamos com ActivatedRoute */
import { switchMap } from 'rxjs';

import * as toastr from 'toastr';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit {

  /* Definira se estamos salvando ou editando uma categoria */
  currentAction!: String;
  categoryForm!: FormGroup;
  pageTitle!: String;
  /* Caputa os erros do servidor */
  serverErrorMessages!: string[];

  /* Desativa o submit apos enviar */
  submittingForm: boolean = false;
  category: Category = new Category();

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    /* Definando metodos executados */

    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  /* private methodos */

  private setCurrentAction() {
    /* varifica o primeiro path da url categories/(path), exemplo, categories/new ou
    categories/(24)/edit */
    if (this.route.snapshot.url[0].path == "new")
      this.currentAction = 'new';
    else
      this.currentAction = 'edit';
  }

  /* Constroi o formulario da categoria */
  private buildCategoryForm() {
    this.categoryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(5)]],
      description: [null, [Validators.required, Validators.minLength(5)]]
    })
  }

  private loadCategory() {
    if (this.currentAction == 'edit') {

      this.route.paramMap.pipe(
        switchMap(params => this.categoryService.getByid(+params.get('id')!))
      ).subscribe(
        (category) => {
          this.category = category;
          this.categoryForm.patchValue(category) // binds loaded category data to CategoryForm
        },
        (error) => alert('Ocorreu um erro no servidor, tente mais tarde.')
      )
    }
  }

  private setPageTitle() {
    if (this.currentAction == 'new') {
      this.pageTitle = 'Cadastro de nova categoria!';
    } else {
      /* verifica o nome da categoria, se nao tiver, ele passa ' ' */
      const categoryName = this.category.name || '';
      this.pageTitle = "Editando Categoria: " + categoryName;
    }
  }

  submitForm() {
    this.submittingForm = true;

    if (this.currentAction == 'new') {
      this.createCategory();
    } else {
      this.updateCategory();
    }
  }

  private createCategory() {
    const category: Category = Object.assign(new Category(), this.categoryForm.value);

    this.categoryService.create(category).subscribe(
      category => this.actionsForSuccess(category),
      error => this.actionsForError(error)
    )
  }

  private updateCategory() {
    const category: Category = Object.assign(new Category(), this.categoryForm.value);
    /* o id ja esta vindo dentro de category entao nao precisamos passar o id da category aqui, duvidas só consultar o 
    category.service.ts */
    this.categoryService.update(category).subscribe(
      category => this.actionsForSuccess(category),
      error => this.actionsForError(error)
    )
  }

  private actionsForSuccess(category: Category) {
    toastr.success("Solicitação processada com sucesso!");

    /* skipLocationChange, faz com que não adiciona a url no historico do navegador */
    this.router.navigateByUrl('categories', { skipLocationChange: true }).then(
      /* primeiro ele rediciona para o /categories, e depois manda para categories/id/edit */
      () => this.router.navigate(["categories", category.id, "edit"])
    )
  }

  private actionsForError(error: any){
    toastr.error("Ocorreu um erro ao processar sua solicitação");
    this.submittingForm = false;

    if(error.status === 422){
      this.serverErrorMessages = JSON.parse(error._body).errors
    }else{
      this.serverErrorMessages = ['Falha na comunicação com o servidor. Por favor, tenta mais tarde!.']
    }

  }
}