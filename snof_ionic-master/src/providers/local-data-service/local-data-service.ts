import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Device } from '@ionic-native/device';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ToastController } from 'ionic-angular';
import { DBAdaptorProvider } from '../db-adaptor/db-adaptor';
import { RestApiProvider } from '../rest-api/rest-api';
import { UtilsProvider } from '../utils/utils';
import { AlertController } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { Network } from '@ionic-native/network';

/*
 
 LocalDataServiceProvider
 ========================
 
	* Delivers data to UI views
	
 */
@Injectable()
export class LocalDataServiceProvider {

	//login
	public ENABLE_TOAST = false;
	public settings: any = {};
	public drive_lastRefresh;
	private timeOfLastRefresh: any = '';
	private autoRefreshTimer: any = null;


	private hasChangesToSync: boolean = false;
	private localObjectsToSync: any = {};
	private timeLastSync: any;

	private curUser: any = null;

	constructor(public platform: Platform,
		private storage: Storage,
		private sqlite: SQLite,
		public http: Http,
		private toastCtrl: ToastController,
		public dbAdaptor: DBAdaptorProvider,
		public restApi: RestApiProvider,
		public alertCtrl: AlertController,
		public utils: UtilsProvider,
		public fileApi: File,
		private device: Device,
		private network: Network) {

		this.dbAdaptor = dbAdaptor;
		this.restApi = restApi;
		this.alertCtrl = alertCtrl;

		this.settings = { // APP starts as online to be able to comunicate to the server and get user credentials
			onlineMode: true,
			autoRefresh: false,
			timeOfLastSync: null
		}

		this.startObservingNetwork();
		//this.storage.get('LDS.timeOfLastRefresh').then(res => {
		//	this.timeOfLastRefresh = res;
		//});

	}

	startObservingNetwork(){

		let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
		  console.log('network was disconnected :-(');
		});

		// stop disconnect watch
		//disconnectSubscription.unsubscribe();

		// watch network for a connection
		let connectSubscription = this.network.onConnect().subscribe(() => {
		  console.log('network connected!');
		  console.log('network type: '+this.network.type);
		  // We just got a connection but we need to wait briefly
		   // before we determine the connection type. Might need to wait.
		  // prior to doing any api requests as well.
		  setTimeout(() => {
		    if (this.network.type === 'wifi') {
		      console.log('we got a wifi connection, woohoo!');
		    }
		  }, 3000);
		});

		// stop connect watch
		//connectSubscription.unsubscribe();

	}

	initDatabase() {

		return new Promise(resolve => {

			this.initSettings().then(res => {

				this.dbAdaptor.initDatabase().then(res => {

					if(this.restApi.STUB_MODE){
						this.storage.get('didInitDB').then((res: any) => {

							if(res){
								resolve(this.settings);
								return;
							}
							else{
								this.loadAllSampleObjects().then(res => {
									//this.startAutoRefresh();
									resolve(this.settings);

									this.storage.set('didInitDB', true);
								});
							}

						});
					}
					else{


						this.storage.get('localObjectsToSync').then((res: any) => {

							this.localObjectsToSync = (res)? res: {};


							if(!this.settings.timeOfLastSync){

								this.doSynchronize().then((res: any) => {
									this.storage.set('didInitDB', true);
									resolve(this.settings);

								});
							}
							else{
								resolve(this.settings);
								this.storage.set('didInitDB', true);

							}

						//});
						});
					}

				});

			});
		});

	}


	//
	// SYNCHRONIZE
	//

	doSynchronize(){

		let ps = [];
		let that = this;


		return new Promise((resolve, reject) => {

			let that = this;
			let object;
			if(!that.isOnline()){

				reject("Must be online to synchronize data");
				return;
			}

			//
			// push locally changed objects
			//
	    	//if(that.localObjectsToSync.length>1){
	    	//	for(var i=0; i<that.localObjectsToSync.length; i++){
	    	for(let id in that.localObjectsToSync){

    			object = that.localObjectsToSync[id];
    			if(object.isNew){
    				delete object.isNew;
    				ps.push(that.restApi.createObject(object.objectType, object));
    			}
    			else{
    				ps.push(that.restApi.updateObject(object.objectType, object.id, object));
    			}

    		}
	    	//}

			Promise.all(ps).then((localObjects: any) => {

				//
				// download remotely changed objects
				//
				let timeOfLastSync = that.settings.timeOfLastSync;

				// timeOfLastSync will be updated after successful sync completed
				let timeOfLastSyncOnSuccess = new Date().toISOString();

				that.restApi.getRemoteModifiedObjects({ modifiedSince: timeOfLastSync}).then((remoteObjects: any) => {

					// process remote synchronized items
					// replace local objects with remote objects,
					// preserving in-briefcase state 
					let ps: any = [];
					let remoteObject;
					let objectTypesHandled: any = {};

					for (var i = 0; i < remoteObjects.length; i++) {

						remoteObject = remoteObjects[i];
						objectTypesHandled[remoteObject.objectType] = true;

						// save remote object to local
						ps.push(that.dbAdaptor.saveItemToLocal(remoteObject.objectType, remoteObject.id, remoteObject));

					}

					Promise.all(ps).then(res => {
						let ps2 = [];
						for(let objectType in objectTypesHandled){
							if(!objectTypesHandled.hasOwnProperty(objectType)) continue;

							ps2.push(this.dbAdaptor.updateIndexesForObjectType(objectType));
						}

						Promise.all(ps2).then(res => {
							that.settings.timeOfLastSync = timeOfLastSyncOnSuccess;
							that.localObjectsToSync = {};
							that.storage.set('localObjectsToSync', {});
							resolve(timeOfLastSyncOnSuccess);
						});

					});


				});

			});

	    });

	}


	loginUser(username, password){

		var that = this;
		return new Promise((resolve, reject) => {

			that.restApi.loginUser({
				username: username,
				password: password
			}).then((res: any) => {

				that.curUser = res.user;
				// cache in local storage
				that.storage.set('userCache', {
					username: username,
					password: password
				}).then(res => {
					resolve(that.curUser);
				});

			}, err => {
				that.curUser = null;
				reject("Invalid username or password. Please try again");
			});


		});


		/*

		return new Promise((resolve, reject) => {
			// temporary stub
			this.queryObjects('user', {}).then((users: any) => {

				users = users.filter(function(user){
					return user.email==username && user.password==password;
				});

				if(users.length>0){
					this.curUser = users[0];

					// cache in local storage
					this.storage.set('userCache', {
						username: username,
						password: password
					}).then(res => {
						resolve(this.curUser);
					});
				}
				else{
					this.curUser = null;
					reject("Invalid username or password. Please try again");
				}

			});

		});
		*/

	}

	logoutUser(){

		return new Promise((resolve, reject) => {
			this.storage.remove('userCache').then((res: any) => {

				this.curUser = null;
				resolve(true);

			});
		});

	}

	getCurUser() {

		return new Promise((resolve, reject) => {

			if(this.curUser){
				resolve(this.curUser);
			}
			else{

				// attempt to login with cached user
				this.storage.get('userCache').then((userCache: any) => {

					if(!userCache){
						resolve(null);
					}
					else{
						this.loginUser(userCache.username, userCache.password).then((curUser: any) => {
							resolve(curUser);
						});
					}
				});
			}

		});

	}

	refreshAll() {


		let that = this;
		let ps = [];
    	return new Promise(resolve => {

			ps.push(this.refreshObjects('program'));
			ps.push(this.refreshObjects('user'));
			ps.push(this.refreshObjects('session'));
			ps.push(this.refreshObjects('location'));
			ps.push(this.refreshObjects('image'));
			ps.push(this.refreshObjects('stat'));
			ps.push(this.refreshObjects('phase'));
			ps.push(this.refreshObjects('drill'));
			ps.push(this.refreshObjects('video'));

			// 
			ps.push(this.refreshObjects('session_user'));
			ps.push(this.refreshObjects('user_drill'));

			Promise.all(ps).then((res:any) => {

				let ps2 = [];
		    	ps2.push(that.dbAdaptor.updateIndexesForObjectType('user_drill'));
		    	ps2.push(that.dbAdaptor.updateIndexesForObjectType('session_user'));

		    	Promise.all(ps2).then(res => {
		    		resolve(true);
		    	})
			});

		});

	}

	refreshObjects(objectType) {

		return new Promise(resolve => {
			this.downloadObjects(objectType).then((res: any) => {

				let ps = [], object, objects = [];
				for (var i = 0; i < res.length; i++) {
					object = res[i];
					objects.push(object);
					ps.push(this.dbAdaptor.saveItemToLocal(objectType, object.id, object));
				}
				Promise.all(ps).then(res => {
					this.dbAdaptor.updateIndexesForObjectType(objectType).then(res => {
						resolve(objects);
					});
				});
			});
		});

	}


	loadAllSampleObjects(){

		let that = this;
		let ps = [];
    	return new Promise(resolve => {

			ps.push(this.loadSampleObjects('program'));
			ps.push(this.loadSampleObjects('user'));
			ps.push(this.loadSampleObjects('session'));
			ps.push(this.loadSampleObjects('location'));
			ps.push(this.loadSampleObjects('image'));
			ps.push(this.loadSampleObjects('stat'));
			ps.push(this.loadSampleObjects('phase'));
			ps.push(this.loadSampleObjects('drill'));
			ps.push(this.loadSampleObjects('video'));

			// 
			ps.push(this.loadSampleObjects('session_user'));
			ps.push(this.loadSampleObjects('user_drill'));

			Promise.all(ps).then((res:any) => {

				let ps2 = [];
		    	ps2.push(that.dbAdaptor.updateIndexesForObjectType('user_drill'));
		    	ps2.push(that.dbAdaptor.updateIndexesForObjectType('session_user'));

		    	Promise.all(ps2).then(res => {
		    		resolve(true);
		    	})
			});

		});

	}

	loadSampleObjects(objectType){

		return new Promise(resolve => {
			this.restApi.getSampleObjects(objectType, {}).then((res: any) => {
				for(var i=0; i<res.length; i++){
					this.unpackObject(objectType, res[i]);
				}
				resolve(res);
			});

		});
	}

	//
	// Seed Initial Data in Google Cloud SQL DB
	// 

	uploadAllSampleData(){

		let that = this;
		let ps = [];
    	return new Promise(resolve => {

			ps.push(this.uploadSampleObjects('program'));
			//ps.push(this.uploadSampleObjects('user'));
			ps.push(this.uploadSampleObjects('session'));
			ps.push(this.uploadSampleObjects('location'));
			ps.push(this.uploadSampleObjects('image'));
			ps.push(this.uploadSampleObjects('stat'));
			ps.push(this.uploadSampleObjects('phase'));
			ps.push(this.uploadSampleObjects('drill'));
			ps.push(this.uploadSampleObjects('video'));

			// 
			ps.push(this.uploadSampleObjects('session_user'));
			ps.push(this.uploadSampleObjects('user_drill'));

			Promise.all(ps).then((res:any) => {
		    	resolve(true);
		    });
		});

	}

	uploadSampleObjects(objectType){

		return new Promise(resolve => {
			this.restApi.getSampleObjects(objectType, {}).then((res: any) => {
				for(var i=0; i<res.length; i++){
					this.restApi.createObject(objectType, res[i]);
				}
				resolve(res);
			});

		});

	}

	uploadSampleUsers(){

		return new Promise(resolve => {
			this.restApi.getSampleObjects('user', {}).then((res: any) => {
				for(var i=0; i<res.length; i++){
					this.restApi.createUser(res[i]);
				}
				resolve(res);
			});

		});

	}


    readFileAsBase64(fileName){

        return new Promise(resolve => {


        	if(this.platform.is('core') || this.platform.is('mobileweb')){
        		resolve(false);
        		return;
        	}
            //console.log('file.applicationDirectory: '+this.fileApi.applicationDirectory);
            //console.log('file.applicationStorageDirectory: '+this.fileApi.applicationStorageDirectory);
            //console.log('file.dataDirectory: '+this.fileApi.dataDirectory);
            //console.log('file.cacheDirectory: '+this.fileApi.cacheDirectory);
//
            //console.log('file.tempDirectory: '+this.fileApi.tempDirectory);
            //console.log('file.cacheDirectory: '+this.fileApi.cacheDirectory);
            //console.log('file.syncedDataDirectory: '+this.fileApi.syncedDataDirectory);
            //console.log('file.documentsDirectory: '+this.fileApi.documentsDirectory);

            this.fileApi.readAsDataURL(this.fileApi.dataDirectory, fileName).then((base64: string) => {

                resolve(base64);

            });

        });
    }

	/**
	 * return an array of objects
	 *
	 *	@param	objectType		program, session, user
	 *	@param	options
	 *				id			(string) optional - specify the object id
	 *				query		(string) optional - specify the search query
	 *				filter		(array of filter functions)
	 *					[0] = function(item){
	 *								let cutoffDate = new Date(new Date().setDate(new Date().getDate()-1)).toISOString().split('.')[0]+"Z";
	 * 								return item.LastModifiedDate>= cutoffDate;
	 *							}
	 *				sort	= function(a,b) {
	 *						  if (a.LastModifiedDate < b.LastModifiedDate)
	 *							return -1;
	 *						  if (a.LastModifiedDate > b.LastModifiedDate)
	 *							return 1;
	 *						  return 0;
	 *
	 */

	queryObjects(objectType, options: any, localOnly = false) {

		let that = this;
		let curUserId = this.restApi.getUserId();
		return new Promise(resolve => {

			let params: any = {};

			if (options && options.id) {
				params = {
					keywordIndex: 'keyword-' + objectType,
					keywordQuery: options.id
				}
			}
			if (options && options.query) {
				params = {
					keywordIndex: 'keyword-' + objectType,
					keywordQuery: options.query
				}
			}

			let queryLocal = function () {

				that.dbAdaptor.queryItems(objectType, params).then(results => {

					let rows: any[] = results;
					if(rows.length<1){
						resolve(rows);
					}

					if (options) {

						if (options.filter) {
							for (var i = 0; i < options.filter.length; i++) {
								rows = rows.filter(options.filter[i]);
							}
						}
						if (options.sort) {
							rows.sort(options.sort)
						}
					}
					let ps = [];
					for (var i = 0; i < rows.length; i++) {
						ps.push(that.unpackObject(objectType, rows[i]));
					}
					Promise.all(ps).then((unpacked_rows: any) => {
						resolve(unpacked_rows);
					});

				});

			}

			if (this.isOnline() && !localOnly && !this.hasChangesToSync) {
				this.downloadRemoteToLocalForObjectType(objectType, params).then(res => {
					queryLocal();
				});
			}
			else {
				queryLocal();
			}

		});
	}

	getObjects(objectType, ids) {

		let that = this;
		return new Promise(resolve => {

			let ps = [];
			if(!ids){
				resolve([]);
				return;
			}
			for (var i = 0; i < ids.length; i++) {
				ps.push(this.dbAdaptor.loadItemFromLocal(objectType, ids[i]));
			}
			Promise.all(ps).then((rows: any) => {

				rows = rows.filter(function(item){
					return item != null;
				});

				let ps = [];
				for (var i = 0; i < rows.length; i++) {
					ps.push(that.unpackObject(objectType, rows[i]));
				}
				Promise.all(ps).then((unpacked_rows: any) => {
					resolve(unpacked_rows);
				});

			});

		});


	}

	getObject(objectType, id) {

		return new Promise(resolve => {
			if(!id){
				resolve(null);
				return;
			}
			console.log('getObject '+objectType+' '+id);
			this.dbAdaptor.loadItemFromLocal(objectType, id).then((res: any) => {
				this.unpackObject(objectType, res).then((unpacked_object: any) => {
					resolve(unpacked_object);
				});
			})

		});

	}

	setObject(objectType, object) {

		console.log('setObject '+objectType);
		console.log(object);
		debugger;
		var that = this;
		var newObject = false;
		if(!object.id || object.isNew){
			// new object
			object.id = (object.id)? object.id: 'loc-'+Math.round(Math.random()*100000000);
			newObject = true;
			object.timeCreated = new Date().toISOString();
		}
		else{
			object.timeModified = new Date().toISOString();
		}

		return new Promise(resolve => {
			that.packObject(objectType, object).then((packed_object: any) => {

				if(!that.isOnline()){
					debugger;
					packed_object.objectType = objectType;
					packed_object.isNew = newObject;
					that.localObjectsToSync[packed_object.id] = packed_object;
					that.storage.set('localObjectsToSync', that.localObjectsToSync);
				}

				that.dbAdaptor.saveItemToLocal(objectType, packed_object.id, packed_object, true).then(res => {

					if(that.isOnline()){
						// push changes to rest api
						if(newObject){
							that.restApi.createObject(objectType, object);
						}
						else{
							that.restApi.updateObject(objectType, object.id, object);
						}
					}
					resolve(res);
					
				});
			});

		});

	}

	resolveReferencesForObject(object, referenceAttr, referenceObjectType) {

		return new Promise(resolve => {

			let references: any = object[referenceAttr];

			if (typeof references == 'object') {

				// get array
				let ps = [];
				for (var i = 0; i < references.length; i++) {
					ps.push(this.getObject(referenceObjectType, object[referenceAttr][i]));
				}
				Promise.all(ps).then((refObjects: any) => {

					refObjects = refObjects.filter(function(item){
						return item != null;
					});

					object[referenceAttr] = refObjects;
					resolve(object);

				});

			}
			else {

				this.getObject(referenceObjectType, object[referenceAttr]).then((refObject: any) => {

					object[referenceAttr] = refObject;
					resolve(object);

				});

			}

		});

	}



	//
	//
	//

	downloadObjects(objectType) {

		return new Promise(resolve => {
			this.restApi.queryObjects(objectType, {}).then((res: any) => {
				for(var i=0; i<res.length; i++){
					this.unpackObject(objectType, res[i]);
				}
				resolve(res);
			});

		});

	}

	unpackObject(objectType, item) {

		var fnName = '_unpack' + this.utils.ucFirst(objectType);
		if (this[fnName]) {
			return this[fnName](item);
		}

		return new Promise(resolve => {

			if (!item) {
				resolve(item);
				return;
			}
			
			resolve(item);
		});

	}

	packObject(objectType, item) {

		var fnName = '_pack' + this.utils.ucFirst(objectType);
		if (this[fnName]) {
			return this[fnName](item);
		}

		return new Promise(resolve => {
			resolve(item);
		});

	}


	//
	// Object-specific Pack/Unpack methods
	//

	_unpackUser(item) {

		return new Promise(resolve => {
			if (!item || typeof item.thumb == 'object') {
				resolve(item);
				return;
			}
			this.getObject('image', item.thumb).then((image: any) => {

				if (image) {
					item.thumb = image;
					item.thumbBase64 = image.base64;
				}
				resolve(item);

			});
		});

	}

	_unpackProgram(item) {


		return new Promise(resolve => {

			if(!item){
				resolve(item);
				return;
			}

			this.getObjects('drill', item.drills).then((drills: any) => {

				if (drills) {
					item.drills = drills;
				}
				resolve(item);

			});

		});

	}

	_packProgram(item) {

		return new Promise(resolve => {

			if (!item) {
				resolve(item);
				return;
			}

			if(!item.attendees) item.attendees = [];
			item.attendees = item.attendees.map(function (obj) {
				if (typeof obj == 'object') {
					return obj.id;
				}
				else {
					return obj;
				}
			});

			if(!item.sessions) item.sessions = [];
			item.sessions = item.sessions.map(function (obj) {
				if (typeof obj == 'object') {
					return obj.id;
				}
				else {
					return obj;
				}
			});

			if(!item.drills) item.drills = [];
			item.drills = item.drills.map(function (obj) {
				if (typeof obj == 'object') {
					return obj.id;
				}
				else {
					return obj;
				}
			});

			item.location = (typeof item.location == 'object') ? item.location.id : item.location;
			resolve(item);
		});

	}

	_unpackSession(item) {

		return new Promise(resolve => {

			if (!item) {
				resolve(item);
				return;
			}

			item.start_date = new Date(item.start_date);
			item.end_date = new Date(item.end_date);

			if(typeof item.phase != 'object'){
				this.getObject('phase', item.phase).then((phase: any) => {

					if (phase) {
						item.phase = phase;
					}

					resolve(item);

				});
			}
			else{
				resolve(item);
			}

		});

	}

	_packSession(item) {

		return new Promise(resolve => {

			if (!item) {
				resolve(item);
				return;
			}

			item.start_date = (item.start_date) ? item.start_date.toISOString() : '';
			item.end_date = (item.end_date) ? item.end_date.toISOString() : '';

			if(item.attendees){
				item.attendees = item.attendees.map(function (obj) {
					if (typeof obj == 'object') {
						return obj.id;
					}
					else {
						return obj;
					}
				});
			}
			if(item.session_users){
				item.session_users = item.session_users.map(function (obj) {
					if (typeof obj == 'object') {
						return obj.id;
					}
					else {
						return obj;
					}
				});
			}

			item.location = (typeof item.location == 'object') ? item.location.id : item.location;
			item.program = (typeof item.program == 'object') ? item.program.id : item.program;
			item.phase = (typeof item.phase == 'object') ? item.phase.id : item.phase;
			resolve(item);
		});

	}

	_unpackUser_drill(item){

		return new Promise(resolve => {

			if (!item) {
				resolve(item);
				return;
			}

			this.getObject('drill', item.drill_id).then((drill: any) => {

				if (drill) {
					item.drill = drill;
				}
				resolve(item);

			});

		});
	}

	_packUser_drill(item){

		return new Promise(resolve => {

			delete item.drill;
			delete item.user;
			resolve(item);

		});
	}

	_unpackSession_user(item){

		return new Promise(resolve => {

			if (!item) {
				resolve(item);
				return;
			}

			this.getObject('user', item.user_id).then((user: any) => {

				if (user) {
					item.user = user;
				}
			
				this.getObjects('user_drill', item.user_drills).then((user_drills: any) => {

					if (user_drills){
						item.user_drills = user_drills;
					}
					resolve(item);

				});


			});



		});

	}

	_packSession_user(item){

		return new Promise(resolve => {
			item.user_drills = item.user_drills.map(function (obj) {
				if (typeof obj == 'object') {
					return obj.id;
				}
				else {
					return obj;
				}
			});
			delete item.user;
			resolve(item);

		});
	}




	//
	//
	//

	downloadRemoteToLocalForObjectType(objectType, queryParams) {

		return new Promise(resolve => {
			let objectApiParam: any = null;
			let queryParams: any = {};
			let ObjectType = this.utils.ucFirst(objectType);

			this.dbAdaptor.queryItems(objectType, queryParams).then(res_local => {

				let localObjects: any = res_local;
				let localObject: any;
				let localObjectsById: any = {};

				// map local objects
				for (var i = 0; i < localObjects.length; i++) {
					localObject = localObjects[i];
					localObject.Id = (localObject.id) ? localObject.id : localObject.Id;
					localObjectsById[localObject.Id] = localObject;
				}

				// load remote objects
				//this.restApi[objectApiRequest](objectApiParam).then((res_remote: any) => {
				this.refreshObjects(objectType).then((remoteObjects: any) => {

					let ps: any = [];

					// replace local objects with remote objects,
					// preserving in-briefcase state 
					let remoteObject;
					for (var i = 0; i < remoteObjects.length; i++) {

						remoteObject = remoteObjects[i];

						localObject = localObjectsById[remoteObject.id];
						if (localObject) {
							// handle local object - preserve vars etc.
						}
						// save remote object to local
						ps.push(this.dbAdaptor.saveItemToLocal(objectType, remoteObject.id, remoteObject));

					}

					Promise.all(ps).then(res => {
						this.dbAdaptor.updateIndexesForObjectType(objectType).then(res => {
							resolve(remoteObjects);
						});
					});


				});

			});

		});

	}

	/*
	refreshObjectsOfType(objectType, objectId=null){

		//if(!this.isOnline()){
		//	return this.error_notOnline();
		//}
		// TODO - ONLINE ONLY

		let ObjectType = this.utils.ucFirst(objectType);
		let ObjectTypePlural = ObjectType+'s';

		//let restApiRequest = (objectId)? 'get'+ObjectType: 'get'+ObjectTypePlural;
		//let restApiRequest = 'getObjects';

		let unpackMethod = '_unpack'+ObjectType;

		return new Promise(resolve => {

			// load from server
			this.restApi.queryObjects(objectType).then(res => {

				let data: any = res;
				let promises = [];
				let objectItem;

				// unpack & save
				if(data.records){
					for(var i=0; i<data.records.length; i++){
						promises.push(this[unpackMethod](data.records[i]));
					}
				}
				else{
					promises.push(this[unpackMethod](data));
				}

				Promise.all(promises).then(objectItems => {

					let promises_save = [];
					let promises_alt = [];

					for(var i=0; i<objectItems.length; i++){

						// save to local & add to index[all-{objectType}]
						objectItem = objectItems[i];
						objectItem.Id = (objectItem.id)? objectItem.id: objectItem.Id;
						promises_save.push(this.dbAdaptor.saveItemToLocal(objectType, objectItem.Id, objectItem));

					}

					Promise.all(promises_alt).then(result => {

						Promise.all(promises_save).then(result => {
							
							console.log('...saved '+result.length+' '+ObjectTypePlural);
								
							let ps = [];
							ps.push(this.dbAdaptor.saveIndex('all-'+objectType));
							ps.push(this.dbAdaptor.updateIndexesForObjectType(objectType));

							Promise.all(ps).then(res => {
								
								console.log('... updated indexes for '+objectType);
								
								resolve({
									success: true,
									items: result,
									message: "Successfully refreshed "+result.length+" "+ObjectTypePlural
								});

							});

						});

					});

				});


			});

		});

	}

	*/

	//
	//
	//

	attachUserDrillToSessionUser(user_drill, session_user){

		let this_session: any;
		let found: boolean;

		return new Promise(resolve => {
			this.getObject('session_user', session_user.id).then((session_user: any) => {


				found = false;
				for(var i=0; i<session_user.user_drills.length; i++){
					if(session_user.user_drills[i].id == user_drill.id){
						found = true;
					}
				}

				if(!found){
					session_user.user_drills.push(user_drill);
					this.setObject('session_user', session_user).then((res: any) => {
						resolve(true);
					})

				}
				else{
					resolve(true);
				}



			});

		});


	}


	addUserToSession(user_id, session_id){

		let this_session: any;
		let this_user: any;

		return new Promise(resolve => {

			this.getObject('session', session_id).then((session: any) => {

				debugger;
				let session_user = {
					user_id: user_id,
					session_id: session_id,
					user_drills: [],
					isAbsent: false,
					absentReason: null,
					isEnded: false,
					overallComment: null
				};

				this.setObject('session_user', session_user).then((session_user: any) => {

					debugger;

					if(!session.session_users) session.session_users = [];
					// update session to add to session_users
					session.session_users.push(session_user.id);

					this.setObject('session', session).then((res: any) => {
						resolve(res);
					});

				});

			});


		});

	}


	getProgram(id) {

		return this.getObject('program', id);
	}

	getNextTrainingSession() {

		return this.getObject('session', 'session-1');

	}

	getTrainingSession(id) {

		return this.getObject('session', 'session-1');
	}

	getTrainingSessionDetail(id) {

		return this.getObject('session', 'session-1');

	}

	getTrainingDrillDetail(id) {

		return new Promise(resolve => {

			let res: any = {};
			res = {
				id: 'run-8',
				session_id: 'session-1',
				user_id: 'athlete-1',

				video_id: 'video-1',
				turn_shape: "",
				snow_quality: "Packed",
				technique: "07",
				rubrics: {
					balance: "03",
					rotary: "02",
					edging: "04",
					pressure: "01"
				},
				feedback: "Some feedback for this athlete on this run"
			};
			resolve(res);
		});

	}

	getUsers() {

		return this.queryObjects('user', {});

	}

	getVideo(id) {

		return new Promise(resolve => {

			let res: any = {};
			res = {
				id: 'video-1',
				src: 'https://www.youtube.com/watch?v=0gogZ6T1sPU'
			};
			resolve(res);
		});

	}

	getUser(id) {

		return this.getObject('user', id);

	}

	getDrillReference(id) {

		return new Promise(resolve => {

			let res: any = {};
			res = {
				id: 'drill-1',
				video_id: 'video-1',
				description: "The skier enters the track at GS speed",
				objectives: "Using flextion and extension of the lower body",
				terrain: "Beginner slope",
				variations: "Whatever stuff goes here"
			};
			resolve(res);
		});

	}

	goOnline(){

    	this.setSettings({ onlineMode: true});
    	this.doSynchronize();

	}

	goOffline(){

    	this.setSettings({ onlineMode: false});

	}









	//
	// SETTINGS
	//

	initSettings() {

		return new Promise(resolve => {

			this.storage.get('settings').then(res => {
				let settings: any = res;
				if (!settings) {
					settings = {
						onlineMode: true,
						autoRefresh: false,
						timeOfLastSync: null
					}
				}

				this.settings = settings;
				resolve(true);
			}).catch(err => {
				console.warn('Error caught in LDS.initSettings');
			});

		});

	}

	getSettings() {

		return new Promise(resolve => {

			let res = this.settings;
			if (!res) {
				res = {
					onlineMode: true,
					autoRefresh: false,
					timeOfLastSync: null
				}
			}
			return resolve(res);

		});

	}

	setSettings(settings) {

		return new Promise(resolve => {

			for (let key in settings) {
				this.settings[key] = settings[key];
			}

			if (this.settings.autoRefresh) {
				//this.startAutoRefresh();
			}

			this.saveSettings().then(res => {
				resolve(true);
			})

		});
	}

	saveSettings() {

		return new Promise(resolve => {

			this.storage.set('settings', this.settings).then(res => {
				resolve(true);
			});

		});

	}

	isOnline() {
		return (this.settings && this.settings.onlineMode);
	}

	isAuthenticated() {
		return this.restApi.isAuthenticated();
	}

	error_notOnline() {

		return new Promise(resolve => {
			resolve({
				success: false,
				message: "Must be in Online Mode to perform this action"
			});
		});

	}

	error_notAuthenticated() {

		return new Promise(resolve => {
			resolve({
				success: false,
				message: "Must be in Logged In to perform this action"
			});
		});

	}


	showToast(type, message) {

		if (!this.ENABLE_TOAST) {
			return false;
		}

		if (!type) {
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

	getUserId() {

		return this.restApi.getUserId();

	}

}