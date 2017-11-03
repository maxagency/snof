import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { LocalDataServiceProvider } from '../../providers/local-data-service/local-data-service';
import { TrainingSessionDetail } from "../training-session-detail/training-session-detail";
import { CreateTrainingSessionPage } from "../create-training-session/create-training-session";
import { SynchronizePage } from "../synchronize/synchronize";
import { Chart } from 'chart.js';

@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html'
})

export class DashboardPage {

  @ViewChild('lineCanvas') lineCanvas;

  public settings: any;
  public isReady: boolean;


  public isOnline: any;
  public isSynchronizing: any;
  public str_timeOfLastSync: any;

  public nextSession: any;
  public curUser: any;
  public stat: any;

  public firstName: string;
  public lastName: string;
  public fullName: string;
  public hasSessions: boolean;
  public str_sessionDate: string;
  public str_sessionTime: string;
  public userData: any;
  public user: any;

  public stat_leaderboard: any;
  public stat_topathletes: any;
  public stat_attendance: any;

  public lineChartConfig: any;
  public lineChart: any;


  constructor(private navCtrl: NavController,
    public modalCtrl: ModalController,
    public localDataService: LocalDataServiceProvider) {

    this.nextSession = null;
    this.curUser = null;
    this.isOnline = false;
    this.isSynchronizing = false;
    this.isReady = false;

  }

  ionViewDidEnter() {
    this.loadData();
  }

  loadData() {

    let that = this;
    that.isReady = false;

    that.localDataService.getSettings().then((settings: any) => {
      that.isOnline = settings.onlineMode;
      that.str_timeOfLastSync = (settings.timeOfLastSync)? settings.timeOfLastSync.toLocaleString(): '';
    });

    let setScreenData = function () {

      that.firstName = that.curUser.firstName;
      that.fullName = that.curUser.firstName + ' ' + that.curUser.lastName;

      if (that.nextSession) {
        that.str_sessionDate = that.nextSession.start_date.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        that.str_sessionTime = that.nextSession.start_date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric' }) + ' - ' + that.nextSession.end_date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric' });
      }

      if (that.stat) {
        that.stat_leaderboard = that.stat['leaderboard'].users.map(function (user, i) {
          switch (i) {
            case 0: user.position = 1; user.css_class = 'first'; user.suffix = 'st'; break;
            case 1: user.position = 2; user.css_class = 'second'; user.suffix = 'nd'; break;
            case 2: user.position = 3; user.css_class = 'third'; user.suffix = 'rd'; break;
          }
          return user;
        });
        that.stat_topathletes = that.stat['top-athletes-this-month'];
        that.stat_attendance = that.stat['attendance'];
      }

      that.isReady = true;

      var timeout = setInterval(function(){
        that.initLineGraph();
        clearInterval(timeout);
      }, 1000);

    }

    this.localDataService.initDatabase().then(res => {

      this.localDataService.getSettings().then(res => {

        this.settings = res;

        this.localDataService.getCurUser().then((user: any) => {

          that.curUser = user;

          this.localDataService.queryObjects('session', {}).then((sessions: any) => {
            let nextSession;

            let nowDate = new Date();
            //nowDate = new Date('Sep 13, 2017');

            sessions.sort(function (a, b) {
              if (a.start_date < b.start_date) return -1;
              if (a.start_date > b.start_date) return 1;
              return 0;
            });

            sessions = sessions.filter(function (session) {
              // future sessions  & only sessions this week 
              let nowDay = nowDate.getDay();
              let sessDay = session.start_date.getDay();
              let daysBetween = session.start_date.getDate() - nowDate.getDate();
              let isFuture = session.end_date > nowDate;
              let isSameWeek = session.start_date.getUTCMonth() == nowDate.getUTCMonth()
                && session.start_date.getUTCFullYear() == nowDate.getUTCFullYear()
                && daysBetween < 7 && daysBetween >= 0 && (sessDay >= nowDay || sessDay == 0);
              //console.log(session.start_date);
              //console.log('daysBetween '+daysBetween);
              //console.log('isFuture '+isFuture);
              //console.log('isSameWeek '+isSameWeek);
              return isFuture && isSameWeek;
            });


            that.nextSession = sessions[0];


            this.localDataService.getObjects('stat', ['leaderboard', 'top-athletes-this-month', 'attendance']).then((stat: any) => {

              let ps = [];

              that.stat = {};
              for (var i = 0; i < stat.length; i++) {
                that.stat[stat[i].id] = stat[i];
              }

              this.localDataService.resolveReferencesForObject(that.stat['leaderboard'], 'users', 'user').then((res: any) => {
                that.stat['leaderboard'] = res;

                this.localDataService.resolveReferencesForObject(that.stat['top-athletes-this-month'], 'users', 'user').then((res: any) => {
                  that.stat['top-athletes-this-month'] = res;
                  setScreenData();
                });

              });

            });

          });

        });


      });

    });


  }

  goOnline(){
    this.localDataService.goOnline();
    this.isOnline = true;
  }

  goOffline(){
    this.localDataService.goOffline();
    this.isOnline = false;
  }

  goToCreateTrainingSession() {
    //this.navCtrl.push(CreateTrainingSessionPage);
    let modal = this.modalCtrl.create(CreateTrainingSessionPage);
    modal.onDidDismiss(data => {
      this.loadData();
    });
    modal.present();
  }

  goToSynchronize() {

    this.isSynchronizing = true;
    this.localDataService.doSynchronize().then((res:any) => {

      this.isSynchronizing = false;
      this.str_timeOfLastSync = res.toLocaleString();
    });

    /*
    //this.navCtrl.push(CreateTrainingSessionPage);
    let modal = this.modalCtrl.create(SynchronizePage);
    modal.onDidDismiss(data => {
      this.loadData();
    });
    modal.present();
    */

  }

  goToTrainingSessionDetail() {
    //this.navCtrl.push(CreateTrainingSessionPage);
    let modal = this.modalCtrl.create(TrainingSessionDetail, {
      session_id: this.nextSession.id
    });
    modal.onDidDismiss(data => {
      this.loadData();
    });
    modal.present();
  }

  initLineGraph(): void {

    // TODO retreive config from server
    const config = {
      type: 'line',
      data: {
        labels: ["NOV", "DEC", "JAN", "FEB", "MAR", "APR", "MAY"],
        datasets: [
          {
            label: "%",
            fill: false,
            lineTension: 0.1,
            backgroundColor: "#FFD133",
            //borderColor: "rgba(75,192,192,1)",
            borderColor: "#FFD133",
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'round',
            pointBorderColor: "#FFD133",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "#FFD133",
            pointHoverBorderColor: "#FFD133",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: [74, 73, 51, 72, 65],
            spanGaps: false,
            yAxisID: 0
          }
        ]
      },
      options: {
        legend: { display: false }
      }

    }

    this.lineChart = new Chart(this.lineCanvas.nativeElement, config);
  }

}