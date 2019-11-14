import { Component, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { AppServiceProvider } from '../../providers/app-service/app-service';

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
  counter: number = 0;
  timerRef;
  public tempo: string = '';
  running: boolean = false;
  startText = 'Start';

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public serviceProvider: AppServiceProvider) {
      this.startTimer();
  }

  startTimer() {
    this.running = !this.running;
    if (this.running) {
      this.startText = 'Stop';
      const startTime = Date.now() - (this.counter || 0);
      this.timerRef = setInterval(() => {
        this.counter = (Date.now() - startTime) / 1000;
        this.tempo = this.serviceProvider.formatedTimeHHMMss(this.counter);
      });
    } else {
      this.startText = 'Resume';
      clearInterval(this.timerRef);
    }
  }

  clearTimer() {
    this.running = false;
    this.startText = 'Start';
    this.counter = undefined;
    clearInterval(this.timerRef);
  }

  dismiss() {
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
