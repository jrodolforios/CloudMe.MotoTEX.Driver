import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { AppServiceProvider } from '../../providers/app-service/app-service';
import { CorridaService, SolicitacaoCorridaService } from '../../core/api/to_de_taxi/services';
import { CorridaSummary, SolicitacaoCorridaSummary } from '../../core/api/to_de_taxi/models';

/**
 * Generated class for the RatingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-rating',
  templateUrl: 'rating.html',
})
export class RatingPage implements OnInit {
  public corridaParaClassificar: CorridaSummary
  public solicitacaoCorridaParaClassificar: SolicitacaoCorridaSummary

  public valorCorrida: string = '';
  public starsCount: 0 | 1 | 2 | 3 | 4 | 5;
  async ngOnInit() {

    await this.corridaService.ApiV1CorridaByIdGet(this.serviceProvider.IdCorridaParaClassificacao).toPromise()
      .then(x => {
        if (x.success) {
          this.corridaParaClassificar = x.data;
        }
      });

    await this.solicitacaoCorridaService.ApiV1SolicitacaoCorridaByIdGet(this.corridaParaClassificar.idSolicitacao).toPromise()
      .then(x => {
        if (x.success) {
          this.solicitacaoCorridaParaClassificar = x.data;
        }
      });


    this.valorCorrida = this.solicitacaoCorridaParaClassificar.valorProposto ? this.solicitacaoCorridaParaClassificar.valorProposto.toFixed(2) : this.solicitacaoCorridaParaClassificar.valorEstimado.toFixed(2);
  }

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public serviceProvider: AppServiceProvider,
    private corridaService: CorridaService,
    public viewCtrl: ViewController,
    private solicitacaoCorridaService: SolicitacaoCorridaService) {
      this.ngOnInit();
  }

  cliclou(valor: 0 | 1 | 2 | 3 | 4 | 5){
    this.starsCount = valor;
  }

  onRateChange(event) {
    this.starsCount = event;
  }

  salvarClassificacao() {
    this.corridaParaClassificar.avaliacaoPassageiro = this.starsCount;

    this.corridaService.ApiV1CorridaPut(this.corridaParaClassificar)
    .toPromise().then(x => console.log(JSON.stringify(x)));

    this.serviceProvider.IdCorridaParaClassificacao = undefined;
    this.dismiss();
  }

  async dismiss() {
    this.viewCtrl.dismiss();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RatingPage');
  }

}
