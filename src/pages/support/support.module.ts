import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SupportPage } from './support';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    SupportPage,
  ],
  imports: [
    IonicPageModule.forChild(SupportPage),
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class SupportPageModule {}
