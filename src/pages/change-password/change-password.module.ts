import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChangePasswordPage } from './change-password';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ChangePasswordPage,
  ],
  imports: [
    IonicPageModule.forChild(ChangePasswordPage),
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class ChangePasswordPageModule {}
