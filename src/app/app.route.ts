import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login-page/login-page.component';
import { PanelPageComponent } from './panel-page/pane-page.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
	{
		path: 'login',
		component: LoginComponent,
		// outlet: 'main'
	}, {
		path: 'panel',
		component: PanelPageComponent
	}, {
		path: 'map',
		loadChildren: './map-page/map-page.module#MapPageModule'
	}, {
		path: 'edit',
		loadChildren: './edit-page/edit-page.module#EditPageModule'
	}, {
		path: '',
		redirectTo: '/panel',
		pathMatch: 'full'
	}, {
		path: '**',
		component: PageNotFoundComponent,
		outlet: 'root'
	}
];

@NgModule({
	imports: [
		RouterModule.forRoot(
			routes, {
				onSameUrlNavigation: 'reload',
				// enableTracing: true// <-- debugging purposes only
			}
		)
	],
	exports: [RouterModule]
})

export class AppRoutes { }
