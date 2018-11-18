import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PanelPageComponent } from './panel-page/pane-page.component';
import { MapComponent } from './map-page/map-page.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
	{ path: 'panel', component: PanelPageComponent },
	{ path: 'map', component: MapComponent },
	{
		path: 'edit',
		loadChildren: './edit-page/edit.page.module#EditPageModule',
	},
	{ path: '', redirectTo: '/panel', pathMatch: 'full' },
	{ path: '**', component: PageNotFoundComponent }
];

@NgModule({
	imports: [
		RouterModule.forRoot(
			routes,
			// { enableTracing: true }// <-- debugging purposes only
		)
	],
	exports: [RouterModule]
})

export class AppRoutes { }
