import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LocalDataServiceProvider } from '../../providers/local-data-service/local-data-service';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { RestApiProvider } from '../../providers/rest-api/rest-api';
import { TabsRacing } from '../tabs/tabs-racing';
import { LoginPage } from "../login/login";
import { TrainingScreen } from "../../pages/training-screen/training-screen";
import { TrainingSessionDetail } from "../../pages/training-session-detail/training-session-detail";
import { MediaCaptureScreen } from "../../pages/media-capture/media-capture";
import { DrillDetail } from "../../pages/drill-detail/drill-detail";
import { AttachVideo } from "../../pages/attach-video/attach-video";
import { MarkAthleteAbsent } from '../mark-athlete-absent/mark-athlete-absent';
import { EndSession } from "../end-session/end-session";

// ***** for progress bar plugin
//import {NgProgressService} from 'ngx-progressbar';

@Component({
  selector: 'page-dev',
  templateUrl: 'dev.html'
 
})

export class DevPage {

  public isDatabaseReady: boolean;
  public settings: any;
  public notifications: any;
  public myCPQDriveSummary: any;

  constructor(public navCtrl: NavController,
              private alertCtrl: AlertController,
              private toastCtrl: ToastController,
              public localDataService: LocalDataServiceProvider,
              public restApi: RestApiProvider
              ) {

    this.isDatabaseReady = null;

    this.restApi = restApi;
    this.localDataService.initDatabase().then(res => {

      this.localDataService.getSettings().then(res => {

        this.settings= res;
        this.isDatabaseReady = true;
      });
    
    });


  }

  goHomePage(){

    this.navCtrl.push(TabsRacing, {

    });
  }

  goOnline(){
    this.localDataService.setSettings({ onlineMode: true });
  }

  goOffline(){
    this.localDataService.setSettings({ onlineMode: false });
  }

  goLoginPage(){

    this.navCtrl.push(LoginPage, {

    });

  }

  doUploadSampleObjects(){

    this.localDataService.uploadAllSampleData();

  }

  doUploadSampleUsers(){
    this.localDataService.uploadSampleUsers();
  }

  doLogin(){

    this.localDataService.loginUser('test@snofolio.com', 'snowisgood');

  }

  testMarkAbsent(){

    let session_user_id = 'session-1a:athlete-3';
    this.navCtrl.push(MarkAthleteAbsent, {
      session_user_id: session_user_id
    });
  
  }

  testEndSession(){

    let session_user_id = 'session-1a:athlete-3';
    this.navCtrl.push(EndSession, {
      session_user_id: session_user_id
    });
  
  }


  testAttachVideo(){

    let session_id = 'session-1a';
    let drill_id = 'drill-1';
    let video_id = 'video-1';
    this.navCtrl.push(AttachVideo, {
      session_id: session_id,
      drill_id: drill_id,
      video_id: video_id
    });
  
  }

  testMediaCapture(){

    let session_id = 'session-1a';
    let drill_id = 'drill-1';
    this.navCtrl.push(MediaCaptureScreen, {
      session_id: session_id,
      drill_id: drill_id
    });

  }

  testTrainingScreen(){

    let session_id = 'session-1a';
    this.navCtrl.push(TrainingScreen, {
      session_id: session_id
    });


  }
  testTrainingSessionDetail(){

    let session_id = 'session-1a';
    this.navCtrl.push(TrainingSessionDetail, {
      session_id: session_id
    });


  }

  testNewDrill(){

    let user_id = 'athlete-1';
    let drill_id = 'drill-1';
    let session_id = 'session-1a';

    this.navCtrl.push(DrillDetail, {
      session_id: session_id,
      user_id: user_id,
      drill_id: drill_id
    });

  }

  testEditDrill(){

    let session_id = 'session-1a';
    let user_drill_id = 'athlete-1:drill-1';

    this.navCtrl.push(DrillDetail, {
      session_id: session_id,
      user_drill_id: user_drill_id
    });

  }


  testRefreshAll(){

    this.localDataService.refreshAll();

  }

  testQuery(){

    this.restApi.queryObjects('session', {

    }).then((res: any) => {

      console.log(res);
      debugger;

    })

  }

  testCreateObject(){

    let object = {
      id: 'event-3',
      //parent_id: 0,
      objectType: 'event',
      dataJson: JSON.stringify({ id: 1, firstName: 'tom', lastName: 'pospisil' }),
      timeCreated: 12
    };
    this.restApi.createObject('event', object).then((res:any)=> {
      console.log(res);
      debugger;
    })

  }

  testGetObject(){

      debugger;
    this.restApi.getObject('session', 'session-3a').then((res:any)=> {
      console.log(res);
      debugger;
    })

  }

  testUpdateObject(){

      debugger;
    let object = {
      timerStarted: 'tom',
      timeModified: 14
    };
    this.restApi.updateObject('session', 'session-3a', object).then((res:any)=> {
      console.log(res);
      debugger;
    })

  }


  testUserQuery(){

    this.restApi.queryUsers({

    }).then((res: any) => {

      console.log(res);
      debugger;

    })

  }

  testCreateUser(){

    let object = {
      id: 'user-1',
      userType: 'ATHLETE',
      email: 'tompos@gmail.com',
      firstName: 'tom', 
      lastName: 'pospisil',
      password: 'tennis'
    };
    this.restApi.createUser(object).then((res:any)=> {
      console.log(res);
      debugger;
    });

  }

  testGetUser(){

      debugger;
    this.restApi.getUser('user-1').then((res:any)=> {
      console.log(res);
      debugger;
    })

  }

  testUpdateUser(){

      debugger;
    let object = {
      id: 'user-1',
      firstName: 'tom-b'
    };
    this.restApi.updateUser(object.id, object).then((res:any)=> {
      console.log(res);
      debugger;
    })

  }

  testLoginUserA(){

    let params = {
      username: 'test@snofolio.com',
      password: 'snowisgood'
    };
    this.localDataService.loginUser(params.username, params.password).then(data => {
       let res: any = data;
      if(res.success){
        // success
        this.showToast('success', res.message);
      }
      else{
        // error
        this.showToast('error', res.message);
      }

    });

  }
  testLoginUserB(){

    let params = {
      username: 'coach1@snofolio.com',
      password: 'snowisgood'
    };
    this.localDataService.loginUser(params.username, params.password).then(data => {
       let res: any = data;
      if(res.success){
        // success
        this.showToast('success', res.message);
      }
      else{
        // error
        this.showToast('error', res.message);
      }

    });

  }

  testCreateEvent(){


    let event = {

      id: 'event-'+Math.random().toString().substr(2,8),
      phase: 'Phase A',
      location: 'Whistler',
      description: "Test Event",
      start_date: new Date("2017-09-12 4:00"),
      end_date: new Date("2017-09-12 4:00"),
      attendees: [
        "athlete-1", "trainer-1"
      ]
    }
    
    let session = {

      id: 'session-'+Math.random().toString().substr(2,8),
      phase: event.phase,
      location: event.location,
      description: event.description,
      dates: [event.start_date],
      times: [{
        from: '4:00AM',
        to: '4:00AM'
      }],
      attendees: event.attendees

    }

    this.localDataService.setObject('event', event).then((res:any) => {
      this.localDataService.setObject('session', session).then((res:any) => {

        debugger;

      })
    });
    
  }

  //
  // TOASTS & DIALOGS
  //
  //=====================

  doShowActionReport(params){

    let alert = this.alertCtrl.create();
    alert.setTitle(params.title);
    alert.setSubTitle(params.subTitle);
    alert.setCssClass('action-report');
    if(params.items){
      for(var i=0; i<params.items.length; i++){
        alert.addInput({ type: 'radio', label: params.items[i].text, value: params.items[i].id, disabled: true, checked: false });
      }
    }
    alert.addButton({
      text: 'OK'
    });
    alert.present();

  }


  showToast(type, message) {

    if(!type){
      type = 'info';
    }

    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top',
      cssClass: type
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }

  _doConfirmAction(params){

    let confirm = this.alertCtrl.create({
      title: 'Confirm Action',
      message: 'Are you sure you want to '+params.actionText+'?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'OK',
          handler: () => {
            console.log('OK clicked');
            params['actionFn']();
          }
        }
      ]
    });
    confirm.present();

  }

  //
  //
  //



  presentConfirm() {
  
    let alert = this.alertCtrl.create({
      title: 'Confirm Sync',
      message: 'Are you sure you want to sync?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Sync',
          handler: () => {
            console.log('Sync clicked');
          }
        }
      ]
    });
    alert.present();

  }

}
