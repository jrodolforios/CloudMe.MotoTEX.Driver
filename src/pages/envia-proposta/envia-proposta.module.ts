import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EnviaPropostaPage } from './envia-proposta';
import { BrMaskerModule } from 'br-mask';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    EnviaPropostaPage,
  ],
  imports: [
    IonicPageModule.forChild(EnviaPropostaPage),
    BrMaskerModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class EnviaPropostaPageModule {}
