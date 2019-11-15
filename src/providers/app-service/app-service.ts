import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TaxistaSummary, SolicitacaoCorridaSummary, CorridaSummary } from '../../core/api/to_de_taxi/models';
import { ToastController, NavController } from 'ionic-angular';
import { Vibration } from '@ionic-native/vibration/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { SolicitacaoCorridaService } from '../../core/api/to_de_taxi/services';


/*
  Generated class for the AppServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable({
  providedIn: 'root'
})
export class AppServiceProvider {

  taxistLat: any;
  Taxistlng: any;
  
  //Para uso na modal
  textoOrigem:string = '';
  textoDestino:string = '';

  descDistanciaViagem:string = '';
  descTempoViagem:string = '';
  descValorCorrida:string = '';

  solicitacaoCorridaEmQuestao: SolicitacaoCorridaSummary
  corridaEmQuestao: CorridaSummary;
  fotoTaxista: string;

  taxistaLogado: TaxistaSummary;

  constructor(public http: HttpClient,
    public toastCtrl: ToastController,
    private vibration: Vibration,
    private nativeAudio: NativeAudio,
    private solicitacaoCorridaService: SolicitacaoCorridaService, ) {

  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000
    });
    return toast;
  }

  discartViagem() {
    this.solicitacaoCorridaEmQuestao = undefined;
  }

  async encontrarCorrida() {
    var encontrou: boolean = false;

    await this.solicitacaoCorridaService.ApiV1SolicitacaoCorridaGet().toPromise().then(x => {
      if (x.success) {
        x.data.forEach(data => {
          if (data.situacao == 1) {
            encontrou = true;
            this.solicitacaoCorridaEmQuestao = data;
          }
        })
      }
    });

    if (this.solicitacaoCorridaEmQuestao && this.solicitacaoCorridaEmQuestao != null && this.solicitacaoCorridaEmQuestao.situacao == 1) {
      this.callNotification();
    }

    return encontrou;
  }

  async callNotification() {
    this.vibration.vibrate([2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000]);
    this.nativeAudio.play('todetaximotoristaruncomming').then().catch();
  }

  async endNotification() {
    this.vibration.vibrate(0);
    this.nativeAudio.stop('todetaximotoristaruncomming')
  }

  formatedTimeHHMMss(timeInSeconds: number) {
    var sec_num = timeInSeconds // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    var fHours, fMinutes, fSecconds: string;    

    if (hours   < 10) {fHours   = "0"+hours;} else {fHours   = ""+hours;}
    if (minutes < 10) {fMinutes = "0"+minutes;} else {fMinutes = ""+minutes;}
    if (seconds < 10) {fSecconds = "0"+seconds.toFixed(0);} else {fSecconds = seconds.toFixed(0);}
    
    return fHours + 'h ' + fMinutes + 'min ' + fSecconds + 'seg'; 
  }

  formatedTimeHHMM(timeInSeconds: number) {
    var sec_num = timeInSeconds// don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);

    var fHours, fMinutes, fSecconds: string;

    if (hours < 10) { fHours = "0" + hours; } else { fHours = ''+hours }
    if (minutes < 10) { fMinutes = "0" + minutes; } else { fMinutes = ''+minutes }
    return fHours + 'h ' + fMinutes + 'min'
  }

  getTipoViagem(tipoAtendimento?: 0 | 1 | 2 | 3) {
    var descriçãoTipoViagem: string = '';
    switch (tipoAtendimento) {
      case 0:
        descriçãoTipoViagem = 'Indefinido';
        break;
      case 1:
        descriçãoTipoViagem = 'Normal';
        break;
      case 2:
        descriçãoTipoViagem = 'Agendado';
        break;
      case 3:
        descriçãoTipoViagem = 'Flex';
        break;
    }

    return descriçãoTipoViagem;
  }

  formatData(d: Date) {
    var strData =
      ("00" + d.getDate()).slice(-2) + '/' +
      ("00" + (d.getMonth() + 1)).slice(-2) + "/" +
      d.getFullYear() + " " +
      ("00" + d.getHours()).slice(-2) + ":" +
      ("00" + d.getMinutes()).slice(-2) + ":" +
      ("00" + d.getSeconds()).slice(-2);

    return strData;
  }

  getStatusCorrida(status: 0 | 1 | 2 | 3 | 4 | 5 | 6){
    switch(status){
      case 0:
        return 'Indefinido';
      case 1:
        return 'Agendado';
      case 2:
        return 'solicitado';
      case 3:
        return 'Em curso';
      case 4:
        return 'Espera';
      case 5:
        return 'Cancelada';
      case 6:
        return 'Concluída';
    }
  }

}
