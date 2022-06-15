import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
/* Importamos as rotas para identificar quando estamos criando ou editando as rotas referentes */
import { ActivatedRoute, Router } from '@angular/router';

import { Entry } from '../shared/entry.model';
import { EntryService } from '../shared/entry.service';

/* importamos o switchMap para poder manipular a rota enquanto trabalhamos com ActivatedRoute */
import { switchMap } from 'rxjs';

import * as toastr from 'toastr';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.scss']
})
export class EntryFormComponent implements OnInit {

  currentAction!: String;
  entryForm!: FormGroup;
  pageTitle!: String;
  /* Caputa os erros do servidor */
  serverErrorMessages!: string[];

  /* Desativa o submit apos enviar */
  submittingForm: boolean = false;
  entry: Entry = new Entry();

  constructor(
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    /* Definando metodos executados */

    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  /* private methodos */

  private setCurrentAction() {
    if (this.route.snapshot.url[0].path == "new")
      this.currentAction = 'new';
    else
      this.currentAction = 'edit';
  }

  private buildEntryForm() {
    this.entryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(5)]],
      description: [null, [Validators.minLength(5)]],
      type: [null, [Validators.required]],
      amount: [null, [Validators.required]],
      date: [null, [Validators.required]],
      paid: [null, [Validators.required]],
      categoryId: [null, [Validators.required]]

    })
  }

  private loadEntry() {
    if (this.currentAction == 'edit') {

      this.route.paramMap.pipe(
        switchMap(params => this.entryService.getByid(+params.get('id')!))
      ).subscribe(
        (entry) => {
          this.entry = entry;
          this.entryForm.patchValue(entry) // binds loaded entry data to EntryForm
        },
        (error) => alert('Ocorreu um erro no servidor, tente mais tarde.')
      )
    }
  }

  private setPageTitle() {
    if (this.currentAction == 'new') {
      this.pageTitle = 'Cadastro de novo Lançamento!';
    } else {
      const entryName = this.entry.name || '';
      this.pageTitle = "Editando Lançamento: " + entryName;
    }
  }

  submitForm() {
    this.submittingForm = true;

    if (this.currentAction == 'new') {
      this.createEntry();
    } else {
      this.updateEntry();
    }
  }

  private createEntry() {
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);

    this.entryService.create(entry).subscribe(
      entry => this.actionsForSuccess(entry),
      error => this.actionsForError(error)
    )
  }

  private updateEntry() {
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);
    /* o id ja esta vindo dentro de entry entao nao precisamos passar o id da entry aqui, duvidas só consultar o 
    entry.service.ts */
    this.entryService.update(entry).subscribe(
      entry => this.actionsForSuccess(entry),
      error => this.actionsForError(error)
    )
  }

  private actionsForSuccess(entry: Entry) {
    toastr.success("Solicitação processada com sucesso!");

    /* skipLocationChange, faz com que não adiciona a url no historico do navegador */
    this.router.navigateByUrl('entries', { skipLocationChange: true }).then(
      () => this.router.navigate(["entries", entry.id, "edit"])
    )
  }

  private actionsForError(error: any) {
    toastr.error("Ocorreu um erro ao processar sua solicitação");
    this.submittingForm = false;

    if (error.status === 422) {
      this.serverErrorMessages = JSON.parse(error._body).errors
    } else {
      this.serverErrorMessages = ['Falha na comunicação com o servidor. Por favor, tenta mais tarde!.']
    }

  }
}