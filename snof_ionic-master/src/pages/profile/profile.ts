import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, ToastController } from 'ionic-angular';
import { LocalDataServiceProvider } from '../../providers/local-data-service/local-data-service';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})

export class Profile {

  // nav params
  public user_id: any;

  constructor(public navCtrl: NavController,
    private toastCtrl: ToastController,
    public modalCtrl: ModalController,
    private navParams: NavParams,
    public localDataService: LocalDataServiceProvider) {

   
    this.user_id = navParams.get('user_id');


    // TODO _ determine if the profile is ATHLETE or COACH, and display appropriate tab options
    /*

		COACH TABS

		* Training Logs
		* About


		ATHLETE TABS
		* Performance
		* About

	*/

    this.loadData();


  }

  ionViewDidEnter() {

    this.loadData();

  }

  loadData() {


  }


  doSaveProfile() {
    //this.navCtrl.push(DrillDetail);
    //let modal = this.modalCtrl.create(DrillDetail);
    //modal.present();
  }

}