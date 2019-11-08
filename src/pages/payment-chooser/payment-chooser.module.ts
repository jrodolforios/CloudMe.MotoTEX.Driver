import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PaymentChooserPage } from './payment-chooser';

@NgModule({
  declarations: [
    PaymentChooserPage,
  ],
  imports: [
    IonicPageModule.forChild(PaymentChooserPage),
  ],
})
export class PaymentChooserPageModule {}
