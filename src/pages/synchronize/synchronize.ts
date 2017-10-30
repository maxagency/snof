import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { LocalDataServiceProvider } from '../../providers/local-data-service/local-data-service';


@Component({
  selector: 'page-synchronize',
  templateUrl: 'synchronize.html'
})

export class SynchronizePage {

  public isSyncing: any;
  public syncStatusMsg: any;
  public hasLocalChanges: any;

  constructor(public navCtrl: NavController,
    private localDataService: LocalDataServiceProvider,
    private toastCtrl: ToastController) {


    this.hasLocalChanges = true;

  }

  loadData(): void{

  }

  ionViewDidEnter(){

    this.loadData();

  }

  doStartSync(){

    this.isSyncing = true;

    var that = this;

    that.syncStatusMsg = "Starting...";
    that.delayOnce(800, function(){

      that.syncStatusMsg = "Uploading Local Objects...";

      that.delayOnce(6000, function(){

        that.syncStatusMsg = "Uploading Local Videos...";

        that.delayOnce(2000, function(){

          that.syncStatusMsg = "Downloading Remote Objects...";


          that.delayOnce(2000, function(){

            that.syncStatusMsg = "Finishing...";


            that.delayOnce(1000, function(){


              that.syncStatusMsg = "";
              that.hasLocalChanges = false;
              that.doStopSync();

            });

          });

        });

      });

    });

  }

  doStopSync(){

    this.isSyncing = false;
  }


  delayOnce(delay, callback){

    var timeout = setInterval(function(){
      try{
        callback();
      }
      catch(e){
        console.error(e);
      }
      clearInterval(timeout);
    }, delay);

  }

  cancel(): void {
    this.navCtrl.pop();
  }

  showToast(message): void {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }

}