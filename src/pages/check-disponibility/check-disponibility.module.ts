import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CheckDisponibilityPage } from './check-disponibility';

@NgModule({
  declarations: [
    CheckDisponibilityPage,
  ],
  imports: [
    IonicPageModule.forChild(CheckDisponibilityPage),
  ],
})
export class CheckDisponibilityPageModule {}
