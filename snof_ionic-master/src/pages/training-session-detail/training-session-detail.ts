import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, NavParams, ToastController } from 'ionic-angular';
import { TrainingScreen } from "../training-screen/training-screen";
import { EditTrainingSession } from "../edit-training-session/edit-training-session";
import { LocalDataServiceProvider } from '../../providers/local-data-service/local-data-service';


@Component({
    selector: 'page-training-session-detail',
    templateUrl: 'training-session-detail.html'
})

export class TrainingSessionDetail implements OnInit {

    // Nav Params
    public session_id: any;
    //

    public isReady: boolean;

    public curUser: any;
    public userThumb: any;
    public session: any;
    public phase: any;
    public attendees: any;
    public focus: string;
    public dates: any;
    public times: any;
    public athletes: any;
    public trainers: any;
    public head_trainers: any;
    public title: string;
    public locationName: string;
    public phaseName: string;
    public sister_sessions: any;
    public str_buttonGoTraining: any;

    constructor(public navCtrl: NavController,
        private toastCtrl: ToastController,
        private navParams: NavParams,
        public modalCtrl: ModalController,
        public localDataService: LocalDataServiceProvider) {

        this.session_id = navParams.get("session_id");
        this.isReady = false;


    }

    ionViewDidEnter() {

        this.loadData();
    }

    loadData() {


        if (!this.session_id) return;
        let that = this;

        this.isReady = false;

        let setScreenData = function (session) {

            that.title = session.phase;
            that.locationName = (session.location) ? session.location.name : '';
            that.phaseName = (session.phase) ? session.phase.name : '';

            that.focus = session.description;

            that.str_buttonGoTraining = (session.isCompleted) ? 'Continue Training' : 'Begin Training';

            that.sister_sessions = session.sister_sessions;

            that.athletes = session.attendees.filter(function (item) {
                return item.userType == 'ATHLETE';
            });

            that.trainers = session.attendees.filter(function (item) {
                return item.userType == 'COACH' || item.userType == 'HEAD COACH';
            });

            that.head_trainers = session.attendees.filter(function (item) {
                return item.userType == 'HEAD COACH';
            });

            // set header thumbnail in precedence: HEAD COACH > COACH > Current ATHLETE
            if (that.head_trainers.length > 0) {
                that.userThumb = that.head_trainers[0].thumbBase64;
            }
            else if (that.trainers.length > 0) {
                that.userThumb = that.trainers[0].thumbBase64;
            }
            else {
                that.localDataService.getCurUser().then((curUser: any) => {
                    that.userThumb = curUser.thumbBase64;
                });
            }

            that.session = session;
            that.isReady = true;

        }

        this.localDataService.getCurUser().then((curUser: any) => {

            that.curUser = curUser;

            this.localDataService.getObject('session', this.session_id).then((session: any) => {

                // resolve references to attendees & program
                this.localDataService.getObjects('user', session.attendees).then((users: any) => {

                    session.attendees = users.map(function (attendee) {
                        attendee.isCurUser = (attendee.id == that.curUser.id);
                        attendee.isHeadCoach = (attendee.userType == 'HEAD COACH');
                        return attendee;
                    });

                    this.localDataService.getObject('location', session.location).then((location: any) => {

                        session.location = location;

                        // get sister sessions
                        this.localDataService.getObject('program', session.program).then((program: any) => {

                            if(!program){
                                setScreenData(session);
                                return;
                            }

                            this.localDataService.getObjects('session', program.sessions).then((sessions: any) => {

                                sessions.sort(function (a, b) {
                                    if (a.start_date > b.start_date) return 1;
                                    if (b.start_date < a.start_date) return -1;
                                    return 0;
                                });

                                sessions.map(function (item) {
                                    if (item.start_date < session.start_date) {
                                        item.css_class = 'past';
                                    }
                                    else if (item.id == session.id) {
                                        item.css_class = 'current';
                                    }
                                    else {
                                        item.css_class = 'future';
                                    }
                                });

                                for (var i = 0; i < sessions.length; i++) {

                                    sessions[i].str_date = sessions[i].start_date.toLocaleString("en-US", {
                                        weekday: 'short',          // narrow, short, long
                                        year: 'numeric',          // numeric, 2-digit
                                        month: 'long',            // numeric, 2-digit, narrow, short, long
                                        day: 'numeric',           // numeric, 2-digit
                                    });
                                    sessions[i].str_startTime = sessions[i].start_date.toLocaleString("en-US", {
                                        hour: 'numeric',           // numeric, 2-digit
                                        minute: 'numeric',           // numeric, 2-digit
                                    });
                                    sessions[i].str_endTime = sessions[i].end_date.toLocaleString("en-US", {
                                        hour: 'numeric',           // numeric, 2-digit
                                        minute: 'numeric',           // numeric, 2-digit
                                    });
                                }

                                session.sister_sessions = sessions;

                                setScreenData(session);



                            });

                        });

                    });

                });

            });
        });


    }

    ngOnInit() {
    }

    exit(): void {
        this.navCtrl.pop();
    }

    showErrorToast(errorMessage) {
        let toast = this.toastCtrl.create({
            message: errorMessage,
            duration: 2000,
            position: 'bottom'
        });

        toast.onDidDismiss(() => {
            console.log('Dismissed toast');
        });

        toast.present();
    }

    editEvent() {

        let modal = this.modalCtrl.create(EditTrainingSession, {
            session_id: this.session.id
        });
        modal.present();
    }

    goToTrainingScreen() {
        this.navCtrl.push(TrainingScreen, {
            session_id: this.session.id
        });
    }


}