import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RatingPage } from './rating';
import { IonicRatingModule } from 'ionic-rating';
@NgModule({
  declarations: [
    RatingPage,
  ],
  imports: [
    IonicPageModule.forChild(RatingPage),
    IonicRatingModule
  ],
})
export class RatingPageModule {}
