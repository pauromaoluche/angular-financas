import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  /* loadChildren, carrega o modulo especifico do caminho */
  {
    path: 'categories',
    // loadChildren: './pages/categories/categories.module#CategoriesModule'
    loadChildren: () => import('./pages/categories/categories.module').then(m => m.CategoriesModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
