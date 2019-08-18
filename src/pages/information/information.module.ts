import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Information } from './information';

@NgModule({
  declarations: [
    Information,
  ],
  imports: [
    IonicPageModule.forChild(Information),
  ],
  exports: [
    Information
  ]
})
export class InformationPageModule {}
