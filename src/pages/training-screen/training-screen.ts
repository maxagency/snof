import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, ModalController, AlertController } from 'ionic-angular';
import { LocalDataServiceProvider } from "../../providers/local-data-service/local-data-service";
import { DrillDetail } from "../drill-detail/drill-detail";
import { AddAthlete } from '../add-athlete/add-athlete';
import { MarkAthleteAbsent } from '../mark-athlete-absent/mark-athlete-absent';
import { EndSession } from "../end-session/end-session";
import { MediaCaptureScreen } from '../media-capture/media-capture';
import { SelectDrill } from '../select-drill/select-drill';


@Component({
    selector: 'page-training-screen',
    templateUrl: 'training-screen.html'
})

export class TrainingScreen {

    // Nav Params
    public session_id: any;
    //
    public isReady: boolean;

    public session: any;
    public session_athletes: any;
    public session_trainers: any;

    public title: string;
    public sessionDuration: string;
    public programDrills: any;
    public curAthlete: any;
    public userThumb: any;

    public timerString: string;
    public timerSeconds: number;
    public timerRunning: boolean;
    public timer: any;

    constructor(public navCtrl: NavController,
        private navParams: NavParams,
        private toastCtrl: ToastController,
        private modalCtrl: ModalController,
        private localDataService: LocalDataServiceProvider,
        private alertCtrl: AlertController) {

        this.session_id = navParams.get("session_id");
        this.isReady = false;

        this.resetTimer();



    }

    ionViewDidEnter() {
        this.loadData();
    }

    loadData() {

        if (!this.session_id) return;
        let that = this;

        this.isReady = false;

        let setScreenData = function (session) {

            that.title = session.location.name + ' - ' + session.phase.name;

            that.sessionDuration = session.duration;

            that.programDrills = (session.program)? session.program.drills: [];

            that.session_athletes = session.session_users.filter(function (item) {
                return item.user && item.user.userType == 'ATHLETE';
            });
            console.log(that.session_athletes);

            that.session_trainers = session.session_users.filter(function (item) {
                return (item.user && item.user.userType == 'COACH') || (item.user && item.user.userType == 'HEAD COACH');
            });

            if (that.session_trainers.length > 0) {
                that.userThumb = that.session_trainers[0].thumbBase64;
            }
            else {
                that.localDataService.getCurUser().then((curUser: any) => {
                    that.userThumb = curUser.thumbBase64;
                });
            }

            that.session = session;
            //if(!that.curAthlete){
            that.selectAthlete(that.session_athletes[0]);
            //}
            //else{
            // refresh current athlete
            //    that.selectAthlete(that.curAthlete);
            //}
            that.isReady = true;

            that.resetTimer();
            that.startTimer();
        }


        this.localDataService.getObject('session', this.session_id).then((session: any) => {

            this.localDataService.getObjects('session_user', session.session_users).then((session_users: any) => {

                session.session_users = session_users;

                // ensure every attendee has a session
                let attendeeInSession = {};
                for(var i=0; i<session.session_users.length; i++){
                    attendeeInSession[session.session_users[i].user_id] = true;
                }
                var attendeesNeedSession = session.attendees.filter(function(attendeeId){
                    return !attendeeInSession[attendeeId];
                });
                let ps = [];

                let doFinish = function(){

                    debugger;
                    that.localDataService.getObject('program', session.program).then((program: any) => {

                        session.program = program;

                        that.localDataService.getObject('location', session.location).then((location: any) => {

                            session.location = location;

                            setScreenData(session);

                        });

                    });

                }

                let addToSession = function(i){

                    debugger;
                    var attendee = attendeesNeedSession[i];
                    if(!attendee){
                        doFinish();
                        return;
                    }
                    that.localDataService.addUserToSession(attendee, that.session_id).then((res: any) => {

                        addToSession(i+1);

                    });
                }
                addToSession(0);

                //
                //

                Promise.all(ps).then((res: any) => {

                });

            });

        });

    }

    startTimer(){

        let that = this;
        that.timerRunning = true;
        if(that.timer){
            return;
        }

        that.timer = setInterval(function(){

            that.timerSeconds++;
            that.sessionDuration = that.toHHMMSS(that.timerSeconds);

            var stop = !that.timerRunning;
            if(stop){
                clearInterval(that.timer);
            }
        }, 1000);

    }

    stopTimer(){

        this.timerRunning = false;

    }

    resetTimer(){

        this.timerSeconds = 0;

    }

    toHHMMSS(totalseconds){

        let sec_num: number = parseInt(totalseconds, 10); // don't forget the second param
        let hours: number   = Math.floor(sec_num / 3600);
        let minutes: number = Math.floor((sec_num - (hours * 3600)) / 60);
        let seconds: number = sec_num - (hours * 3600) - (minutes * 60);

        let HH: string = (hours<10)? "0"+hours: hours.toString();
        let MM: string = (minutes<10)? "0"+minutes: minutes.toString();
        let SS: string = (seconds<10)? "0"+seconds: seconds.toString();

        return HH+':'+MM+':'+SS;

    }

    exit(): void {
        this.navCtrl.pop();
    }

    goToRecordRuns() {
        this.navCtrl.push(SelectDrill, {
            session_id: this.session.id
        });
    }


    finishLesson(): void {

        // First check if there are any runs left to evaluate
        let numVideosToBeEvaluated = 0;
        for (let i = 0; i < this.session_athletes.length; i++) {
            if (this.session_athletes[i].drillsToBeEvaluated === undefined) {
                console.log("Attribute 'drillsToBeEvaluated' does not exist on this object");
                continue;
            }
            numVideosToBeEvaluated += this.session_athletes[i].drillsToBeEvaluated.length;
        }

        console.log(numVideosToBeEvaluated);

        // For debugging, reassign 'numVideosToBeEvaluated' to 0
        numVideosToBeEvaluated = 0;

        let confirm: any = {};

        if (numVideosToBeEvaluated > 0) {
            // If there are still videos to be evaluated, do not allow the 
            // coach to finish the lesson
            confirm = this.alertCtrl.create({
                title: 'You must complete any remaining evaluations to finish this session.',
                //message: 'Complete this session?',
                buttons: [
                    {
                        text: 'OK',
                        handler: () => {
                            console.log('OK clicked');
                        }
                    }
                ]
            });
        } else {
            // If there are no videos left to be evaluated, present a confirm
            // dialogue allowing the coach to finish the lesson of cancel
            confirm = this.alertCtrl.create({
                title: 'Complete this session?',
                //message: 'Complete this session?',
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
                            this.exit();
                            // TODO: make send user to history page

                        }
                    }
                ]
            });

        }

        // Now present message
        confirm.present();

    }

    addAthlete(): void {
        this.navCtrl.push(AddAthlete, {
            session_id: this.session_id
        });
    }

    selectAthlete(session_athlete): void {

        let that = this;
        if(!session_athlete){
            return;
        }

        that.curAthlete = session_athlete;
        that.curAthlete.drillsToBeEvaluated = (that.session.program)? that.session.program.drills: [];
        that.curAthlete.drillsEvaluated = session_athlete.user_drills;
        that.curAthlete.session_user_id = session_athlete.id;

        // remove from drillsToBeEvaluated, all evalutated drills
        let drillsToBeEvaluated = that.curAthlete.drillsToBeEvaluated;

        that.curAthlete.drillsToBeEvaluated = that.curAthlete.drillsToBeEvaluated.filter(function (item) {

            for (var i = 0; i < that.curAthlete.drillsEvaluated.length; i++) {
                if (that.curAthlete.drillsEvaluated[i].drill_id == item.id) return false;
            }
            return true;

        });

    }

    endSession(session_user_id): void {
        let athlete = (this.session_athletes.filter(x => x.id === session_user_id))[0];
        console.log(athlete);

        // Check if athlete has runs to be evaluated
        // if there still are do not allow session to be ended
        let numDrillsToBeEvaluated = athlete.drillsToBeEvaluated.length;
        console.log(numDrillsToBeEvaluated);
        
        numDrillsToBeEvaluated = 0; // for debuging. commment/uncomment accordingly

        let confirm: any = {};

        if (numDrillsToBeEvaluated === 0) {
            confirm = this.alertCtrl.create({
                title: 'Complete this session?',
                //message: 'Complete this session?',
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
                            let modal = this.modalCtrl.create(EndSession, {
                                session_user_id: session_user_id
                            });
                            modal.onDidDismiss(data => {
                                this.loadData();
                            });
                            modal.present();
                        }
                    }
                ]
            });
        } else {
            confirm = this.alertCtrl.create({
                title: 'You must complete any remaining evaluations to finish this session.',
                //message: 'Complete this session?',
                buttons: [
                    {
                        text: 'OK',
                        handler: () => {
                            console.log('OK clicked');
                        }
                    }
                ]
            });
        }

        confirm.present();




    }

    markAbsent(session_user_id): void {
        let modal = this.modalCtrl.create(MarkAthleteAbsent, {
            session_user_id: session_user_id
        });
        modal.onDidDismiss(data => {
            this.loadData();
        });
        modal.present();
    }

    doEditUserDrill(user_drill) {
        this.navCtrl.push(DrillDetail, {
            session_id: this.session_id,
            session_user_id: this.curAthlete.session_user_id,
            user_drill_id: user_drill.id
        });
    }

    doNewUserDrill(drill) {

        this.navCtrl.push(DrillDetail, {
            session_id: this.session_id,
            session_user_id: this.curAthlete.session_user_id,
            user_id: this.curAthlete.user.id,
            drill_id: drill.id
        });

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

    isSelectedAttendee(attendee: any): boolean {
        // return selectedAthlete === attendeeName;
        return this.curAthlete.id === attendee.id;
    }

}