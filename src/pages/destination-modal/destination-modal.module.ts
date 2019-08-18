import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DestinationModal } from './destination-modal';

@NgModule({
  declarations: [
    DestinationModal,
  ],
  imports: [
    IonicPageModule.forChild(DestinationModal),
  ],
  exports: [
    DestinationModal
  ]
})
export class DistensionModalPageModule {}
