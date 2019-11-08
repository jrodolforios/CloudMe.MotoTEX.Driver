import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DiscountOptionsPage } from './discount-options';

@NgModule({
  declarations: [
    DiscountOptionsPage,
  ],
  imports: [
    IonicPageModule.forChild(DiscountOptionsPage),
  ],
})
export class DiscountOptionsPageModule {}
