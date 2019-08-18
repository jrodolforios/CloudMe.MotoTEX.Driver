import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MessageModal } from './message-modal';

@NgModule({
  declarations: [
    MessageModal,
  ],
  imports: [
    IonicPageModule.forChild(MessageModal),
  ],
  exports: [
    MessageModal
  ]
})
export class MessageModalPageModule {}
