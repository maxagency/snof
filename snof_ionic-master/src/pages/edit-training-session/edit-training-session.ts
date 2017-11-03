import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { LocalDataServiceProvider } from '../../providers/local-data-service/local-data-service';


@Component({
    selector: 'page-edit-training-session',
    templateUrl: 'edit-training-session.html'
})


export class EditTrainingSession {

    public session_id: any;

    public locations: any;
    public phases: any;

    public session: any;
    public attendeeSearchTerm: string;
    public filteredAttendees: any;
    public phase: any;
    public location: string;
    public attendees: any;
    public sessionDate: any;
    public sessionStartTime: any;
    public sessionEndTime: any;
    public description: any;
    public shouldShowSearchCancel: boolean;

    constructor(private navCtrl: NavController,
        private toastCtrl: ToastController,
        private navParams: NavParams,
        private localDataService: LocalDataServiceProvider) {

        this.session_id = navParams.get("session_id");

        this.attendeeSearchTerm = '';
        this.shouldShowSearchCancel = true;
        this.attendees = [];

        this.refreshFilteredAttendees();

    }

    loadData() {

        let that = this;

        let setScreenData = function (session) {

            that.session = session;
            that.attendees = session.attendees;
            that.phase = session.phase.id;
            that.location = session.location;
            that.description = session.description;
            that.sessionDate = session.start_date.toISOString();
            that.sessionStartTime = session.start_date.toISOString();
            that.sessionEndTime = session.end_date.toISOString();

        }

        this.localDataService.queryObjects('location', {}).then(res => {

            this.locations = res;
            this.localDataService.queryObjects('phase', {}).then(res => {
                this.phases = res;

                this.localDataService.getObject('session', this.session_id).then((session: any) => {

                    this.phase = session.phase;

                    // resolve references to attendees & program
                    this.localDataService.getObjects('user', session.attendees).then((users: any) => {

                        session.attendees = users;
                        console.log(session);

                        setScreenData(session);

                    });

                });
            });
        });

    }

    ionViewDidEnter() {

        this.loadData();

    }

    addAttendee(attendee): void {
        // Make sure attendee not already added
        for (let i = 0; i < this.attendees.length; i++) {
            if (this.attendees[i].name === attendee.name) {
                return;
            }
        }
        // Then add attendee if not already added
        this.attendees.push(attendee);
    }

    saveChanges(): void {

        let session_updated = {
            id: this.session.id,
            phase: this.phase,
            program: this.session.program,
            location: this.location,
            description: this.description,
            start_date: new Date(new Date(this.sessionDate).toLocaleDateString() + ' ' + new Date(this.sessionStartTime).toLocaleString("en-US", { hour: 'numeric', minute: 'numeric' })),
            end_date: new Date(new Date(this.sessionDate).toLocaleDateString() + ' ' + new Date(this.sessionEndTime).toLocaleString("en-US", { hour: 'numeric', minute: 'numeric' })),
            attendees: this.attendees,
            duration: '2:14:01' // todo
        }

        this.localDataService.setObject('session', session_updated).then((res: any) => {
            this.showToast("Training Session Saved");
        });
        this.navCtrl.pop();

    }

    refreshFilteredAttendees(): void {
        // copy by value not reference to keep orig data
        let that = this;
        this.localDataService.queryObjects('user', {}).then((users: any) => {
            that.filteredAttendees = users.filter(function (user) {
                let alltext = (user.firstName + ' ' + user.lastName).toLowerCase();
                return alltext.indexOf(that.attendeeSearchTerm.toLowerCase()) !== -1;
            });
            console.log('query: ' + that.attendeeSearchTerm);
            console.log(that.filteredAttendees);
        });
    }

    onSearchCancel(ev) {
        //this.attendeeSearchTerm = '';
        //this.refreshFilteredAttendees();
    }

    removeAttendee(attendee): void {
        for (let i = 0; i < this.attendees.length; i++) {
            if (this.attendees[i].name === attendee.name) {
                this.attendees.splice(i, 1);
                return;
            }
        }
    }

    isValidTrainingSession(): boolean {
        // TODO: move validation to service
        let hasPhase = this.phase !== '' && this.phase !== null;
        let hasLocation = this.location !== '' && this.location !== null;
        let hasDescription = this.description !== '' && this.description !== null;
        let hasAttendees = this.attendees.length > 0;

        return hasPhase && hasLocation && hasDescription && hasAttendees;
    }

    showToast(errorMessage): void {
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

    cancel(): void {
        this.navCtrl.pop();
    }

}