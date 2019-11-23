import { Component, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { AppServiceProvider } from '../../providers/app-service/app-service';
import { CorridaService } from '../../core/api/to_de_taxi/services';

/**
 * Generated class for the PauseCorridaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pause-corrida',
  templateUrl: 'pause-corrida.html',
})
export class PauseCorridaPage implements OnDestroy {
  timerRef;
  public tempo: string = '';
  //running: boolean = false;
  startText = 'Start';

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public serviceProvider: AppServiceProvider,
    public corridaService: CorridaService) {
    this.startTimer();
  }

  async startTimer() {
    var tempo: number = 0;
    await this.corridaService.ApiV1CorridaPausarCorridaByIdPost(this.serviceProvider.corridaEmQuestao.id).toPromise()
      .then(x => {
        if (x.success) {
          tempo = +x.data;
        }
      })

    //this.running = !this.running;
    // if (this.running) {
    this.startText = 'Stop';
    var startTime: Date = new Date();
    this.timerRef = setInterval(() => {
      var counter = (new Date().getTime() - (startTime.getTime() - (tempo * 1000))) / 1000;
      this.tempo = this.serviceProvider.formatedTimeHHMMss(counter);
    });
    // } else {
    //   this.startText = 'Resume';
    //   clearInterval(this.timerRef);
    // }
  }

  clearTimer() {
    //this.running = false;
    this.startText = 'Start';
    clearInterval(this.timerRef);
  }

  dismiss() {
    this.corridaService.ApiV1CorridaRetomarCorridaByIdPost(this.serviceProvider.corridaEmQuestao.id).toPromise()
      .then(x => {
        console.log(JSON.stringify(x));
      })
    this.clearTimer();
    clearInterval(this.timerRef);
    this.viewCtrl.dismiss();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PauseCorridaPage');
  }

  ngOnDestroy() {
    clearInterval(this.timerRef);
  }

}
