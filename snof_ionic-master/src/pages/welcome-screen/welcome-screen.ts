import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { TabsRacing } from '../tabs/tabs-racing';
import { TabsAdmin } from '../tabs/tabs-admin';
import { LocalDataServiceProvider } from "../../providers/local-data-service/local-data-service";
import { LoginPage } from '../login/login';
import { DevPage } from '../dev/dev';

@Component({
    selector: 'page-welcome-screen',
    templateUrl: 'welcome-screen.html'
})

export class WelcomeScreenPage {


    constructor(private navCtrl: NavController,
        private navParams: NavParams,
        private localDataService: LocalDataServiceProvider,
        private toastCtrl: ToastController) {

    }


    getStarted(): void {
        
        this.doStartRacingApp();
    }

    doStartRacingApp(){

        this.localDataService.getCurUser().then((curUser: any) => {

          if(curUser){
            // login success
            this.navCtrl.push(TabsRacing);
          }
          else{
            // no login
            this.navCtrl.push(LoginPage);
          }

        }, error => {
          // error
            this.navCtrl.push(LoginPage);

        });

    }

    doStartAdminApp(){

        this.localDataService.getCurUser().then((curUser: any) => {

          if(curUser){
            // login success
            this.navCtrl.push(TabsAdmin);
          }
          else{
            // no login
            this.navCtrl.push(LoginPage);
          }

        }, error => {
          // error
            this.navCtrl.push(LoginPage);

        });

    }

    doStartDevPage(){

        this.localDataService.getCurUser().then((curUser: any) => {

          if(curUser){
            // login success
            this.navCtrl.push(DevPage);
          }
          else{
            // no login
            this.navCtrl.push(LoginPage);
          }

        }, error => {
          // error
            this.navCtrl.push(LoginPage);

        });

    }




}