import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { LocalDataServiceProvider } from '../../providers/local-data-service/local-data-service';
import { CreateTrainingSessionPage } from "../create-training-session/create-training-session";
import { TrainingSessionDetail } from "../training-session-detail/training-session-detail";
import { DrillDetail } from "../drill-detail/drill-detail";

@Component({
  selector: 'page-events',
  templateUrl: 'events.html'
})

export class EventsPage {

  public nowDate: any;
  public selectedMonth: any;
  public str_selectedMonth: string;

  // sessions
  public sessions: any;
  public sessionsByYMD: any;

  // used for rendering
  public monthTable: any;

  constructor(public navCtrl: NavController,
    public modalCtrl: ModalController,
    public localDataService: LocalDataServiceProvider) {

    this.sessionsByYMD = {};
    this.doSelectToday();
    this.initSelectedMonth();

  }

  ionViewDidEnter() {

    this.loadData();

  }

  loadData() {

    this.localDataService.queryObjects('session', {}).then(res => {

      this.sessions = res;

      /*
       * sessions organized by MonthDay
       * 
       */

      this.sessionsByYMD = {};
      var ymd, session;
      for (var i = 0; i < this.sessions.length; i++) {

        session = this.sessions[i];
        ymd = session.start_date.getUTCFullYear() + '-' + session.start_date.getUTCMonth() + '-' + session.start_date.getUTCDate();

        session.css_color = 'green'; // yellow

        if (!this.sessionsByYMD[ymd]) {
          this.sessionsByYMD[ymd] = [];
        }
        this.sessionsByYMD[ymd].push(session);

      }
      this.initSelectedMonth();

    });

  }

  goToCreateTrainingSession() {
    //this.navCtrl.push(CreateTrainingSessionPage);
    let modal = this.modalCtrl.create(CreateTrainingSessionPage, {}, { enableBackdropDismiss: false });
    modal.onDidDismiss(data => {
      this.loadData();
    });
    modal.present();
  }

  goToTrainingSessionDetail(session) {
    //this.navCtrl.push(TrainingSessionDetail, {
    //  sessionId: session.id
    //});
    let modal = this.modalCtrl.create(TrainingSessionDetail,
      {
        session_id: session.id
      },
      {
        enableBackdropDismiss: false
      });

    modal.onDidDismiss(data => {
      this.loadData();
    });
    modal.present();
  }

  goToDrillDetail() {
    this.navCtrl.push(DrillDetail);
    //let modal = this.modalCtrl.create(DrillDetail);
    //modal.present();
  }




  initSelectedMonth() {

    this.nowDate = new Date();

    // get string month
    var monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    this.str_selectedMonth = monthNames[this.selectedMonth.getUTCMonth()] + ' ' + this.selectedMonth.getUTCFullYear();

    // initial day on calendar
    let iDay: any = new Date();
    iDay.setTime(this.selectedMonth.getTime() - this.selectedMonth.getDay() * 24 * 3600000);
    let i = 0;

    let isSelectedMonth;
    let isToday;
    let ymd;

    let monthTable = [];
    let iDay_clone: any;

    // week rows
    for (var w = 0; w < 6; w++) {

      if (!monthTable[w]) monthTable[w] = [];

      // day columns
      for (var d = 0; d < 7; d++) {

        isSelectedMonth = (iDay.getUTCMonth() == this.selectedMonth.getUTCMonth());
        isToday = (iDay.getUTCMonth() == this.nowDate.getUTCMonth() && iDay.getUTCDate() == this.nowDate.getUTCDate());

        iDay_clone = new Date(iDay);

        ymd = iDay_clone.getUTCFullYear() + '-' + iDay_clone.getUTCMonth() + '-' + iDay_clone.getUTCDate();

        monthTable[w][d] = {
          date: iDay_clone,
          utc_date: iDay_clone.getUTCDate(),
          // day falls on currently selected month
          css_isSelectedMonth: (isSelectedMonth) ? 'is-selected-month' : '',
          // day is today
          css_isToday: (isToday) ? 'is-today' : '',
          sessions: this.sessionsByYMD[ymd]
        };


        // increment curDay
        i++;
        iDay.setTime(iDay.getTime() + 24 * 3600000);

      }

    }

    this.monthTable = monthTable;

  }

  doSelectNextMonth() {

    var nextMonth = this.selectedMonth;
    nextMonth.setDate(1);
    nextMonth.setMonth(this.selectedMonth.getMonth() + 1);
    this.selectedMonth = nextMonth;
    this.initSelectedMonth();

  }

  doSelectPrevMonth() {

    var nextMonth = this.selectedMonth;
    nextMonth.setDate(1);
    nextMonth.setMonth(this.selectedMonth.getMonth() - 1);
    this.selectedMonth = nextMonth;
    this.initSelectedMonth();
  }

  doSelectToday() {

    var nextMonth = new Date();
    nextMonth.setDate(1);
    this.selectedMonth = nextMonth;
    this.initSelectedMonth();
  }

}