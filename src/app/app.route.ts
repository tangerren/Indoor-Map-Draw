import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PanelPageComponent } from './panel-page/pane-page.component';
import { MapComponent } from './map-page/map-page.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
	{ path: 'panel', component: PanelPageComponent, runGuardsAndResolvers: 'always' },
	{
		path: 'map',
		loadChildren: './map-page/map-page.moudle#MapPageModule',
	},
	{
		path: 'edit',
		loadChildren: './edit-page/edit-page.module#EditPageModule',
	},
	{ path: '', redirectTo: '/panel', pathMatch: 'full' },
	{ path: '**', component: PageNotFoundComponent }
];

@NgModule({
	imports: [
		RouterModule.forRoot(
			routes, { onSameUrlNavigation: 'reload' }
			// { enableTracing: true }// <-- debugging purposes only
		)
	],
	exports: [RouterModule]
})

export class AppRoutes { }
