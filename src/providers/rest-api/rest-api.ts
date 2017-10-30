import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Device } from '@ionic-native/device';
import { Headers } from '@angular/http';
import { RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
//import {Md5} from 'ts-md5/dist/md5';
/*

  RestApiProvider
 ===================

  Endpoint Documentation
  https://docs.google.com/document/d/1LCuTjA7APZKDOhTxNDJkL717jDDchBgMnbeB-3JGR18/edit#heading=h.vqkpzodrluon

*/
@Injectable()
export class RestApiProvider {


  private host;    // 

  public STUB_MODE;

  private userId;  // currently logged in user
  private token;    
  private user;
  private deviceId; // UUID of this device

  private timeOfLastAuthentication;
  private TIME_BETWEEN_REAUTH;

  constructor(public platform: Platform,
              private storage: Storage,
              private sqlite: SQLite,
              private device: Device,
              public http: Http) {

    this.http = http;
    //this.host = 'http://localhost:8081/';
    this.host = 'https://snofolioresort.appspot.com/';
    
    this.deviceId = this.device.uuid;

    // re-authenticate every N seconds
    // should be set shorter to server timeout
    this.TIME_BETWEEN_REAUTH = 300;

    //
    // STUB MODE - no communication with the server
    //
    this.STUB_MODE = false;

  }


  getUserId()
  {
    return this.userId;
  }

  isAuthenticated()
  {

    // not authenticated
    if(!this.userId) return false;

    // internal timeout (should occur before server timeout)
    let curTime = new Date();
    let secsBetween = curTime.getTime()/1000 - this.timeOfLastAuthentication.getTime()/1000;
    if(secsBetween > this.TIME_BETWEEN_REAUTH){
      return false;
    }

    // authenticated
    return true;

  }

  authenticateBeforeRequest(skipPreAuth=false){

    return new Promise(resolve => {

      if(skipPreAuth || this.isAuthenticated()){
        resolve(true);
        return;
      }

      this.attemptAutoLogin().then(data => {

        let res: any = data;
        if(res.success){
          resolve(true);
        }
        else{
          resolve(false);
        }

      });

    });

  }

  attemptAutoLogin(){

    return new Promise(resolve => {
      this.storage.get('userCache').then(res => {

        let user: any = res;

        if(!user){
          // No User ONLINE or OFFLINE
          resolve({
            success: false,
            message: "Auto login not available"
          });
        }
        else if(user && this.isOnline()){
          // Has User ONLINE - re-submit login
          this.loginUser(user).then(data => {

            resolve({
              success: true,
              message: "Successfully Logged in"
            });
          })
        }
        else if(user){
          // Has User OFFLINE
          // todo - check if Offline session timeout exceeded
          resolve({
              success: true,
              message: "Successfully Logged in Offline"
            });
          
        }

      });
    });

  }

  //
  //
  //
  //  USERS & AUTHENTICATION
  //
  //
  //=======================================================================================

  /*

    Login

    * Authenticate user with Snofolio Rest API

    @params    {
      username: (string) - username
      password: (string) - password
    }

    @returns    {
                    success: true,
                    message: {string} success message
                }

                on error
                {
                    success: false,
                    message: {string} error message
                }


    Documentation
    
  */
  loginUser(params){

    let uri = 'loginUser';
    let body = {
      username: params.username,//'tomp@appnovation.com',
      password: params.password, //'test12345',
      device: this.deviceId
    };

    // TODO _ md5 password
    body.password = '30160b85563e084494404f074c57029b';

    return new Promise((resolve, reject) => {

      this._post_request(uri, body, true).then(res => {

        let data: any = res;
        if(data.user){

          this.userId = data.user.id;
          this.user = data.user;
          this.token = data.token;

          // mark logged in time
          this.timeOfLastAuthentication = new Date();

          this.storage.set('userCache', body).then(res => {
            resolve({
              success: true,
              user: data.user,
              message: "Logged in Successfully"
            })
          });

        }
        else{
          reject({
            success: false,
            message: data.error
          })
        }

      }, err => {
        reject({
            success: false,
            message: err
          });
      });

    });

  }


  // http://knexjs.org/#Builder-where

  /**
   * run a query

    @params.where      (string) where expression
                        "id=1"
                        "lastName>10"
    @params.orderBy    ['column', 'asc|desc']

    @params.limit      {
                          offset: 0,      // starting from Nth record
                          results: 3      // limit to number of records
                        }

    @params.resolveReferences  
                        null    - default - result will contain IDs for referenced objects

                        N       (int) - result will contain referenced objects, to a maximum depth of N
                                {                                 {
                                    id: 'user-1',         =>         id: 'user-1',
                                    thumb: 'image-1',                thumb: {
                                    firstName: 'Tom'                    id: 'image-id',
                                }                                       base64: '98fa8..9183'
                                                                     },

                                                                  }

  */
  queryUsers(params){

    if(this.STUB_MODE){
      // poc_data/catalogs-query.json
      let uri = 'user-query.json';
      return this._stub_request_json(uri);
    }

    
    let body: any = {
    };

    if(params.limit){
      body.limit = params.limit.results,
      body.offset = params.limit.offset
    }

    if(params.where){
      body.where = params.where;
    }
    
    if(params.orderBy){
      body.orderBy = params.orderBy
    }

    body.resolveReferences = (params.resolveReferences)? params.resolveReferences: null;
    
    let uri = 'queryUsers';
    return this._post_request(uri, body, true);


  }

  /* 

    let object = {
      id: 'user-1',                   // id field required - use md5 to generate unique UUID
      
      firstName: 'tom',               
      lastName: 'pospisil',
      password: 'plain-text-password',  

      timeCreated: new Date().toISOString() // optional - if not set, server will assign timeCreated 
      timeModified: null,                   // optional - if not set, server will assign timeModified
      timeDeleted: null                     // optional - is set, the object will be considered deleted
    };
    this.restApi.createUser(object).then((res:any)=> {
      console.log(res);
    });

  */

  createUser(userData){

    if(this.STUB_MODE){
      console.warn('No STUB for restApi.createUser(userData)');
      return;
    }

    let uri = 'createUser';
    let body = userData;
    return this._post_request(uri, body, true);

  }


  /* 

    this.restApi.getUser('user-1').then((res:any)=> {
      console.log(res);
    });
  */

  getUser(id, resolveReferences=null){

    if(this.STUB_MODE){
      console.warn('No STUB for restApi.getUser(id)');
      return;
    }

    let uri = 'getUser';
    let body = {
      id: id,
      resolveReferences: resolveReferences
    };
    return this._post_request(uri, body, true);

  }



  /* 

    this.restApi.getUsers(['user-1','user-2','user-3']).then((res:any)=> {
      console.log(res);
    });
  */
  getUsers(ids, resolveReferences=null){

    if(this.STUB_MODE){
      console.warn('No STUB for restApi.getUsers(userData)');
      return;
    }

    let uri = 'getUsers';
    let body = {
      ids: ids,
      resolveReferences: resolveReferences
    };
    return this._post_request(uri, body, true);

  }

  /*

    let object = {
      id: 'user-1',                   // id field required - use md5 to generate unique UUID
      
      firstName: 'tom',                   // server will only update parameters that are present, and ignore the rest
      lastName: 'pospisil',
      password: 'plain-text-password',  

      timeCreated: new Date().toISOString() // optional - if not set, server will assign timeCreated 
      timeModified: null,                   // optional - if not set, server will assign timeModified
      timeDeleted: null                     // optional - is set, the object will be considered deleted
    };
    this.restApi.updateUser(object.id, object).then((res:any)=> {
      console.log(res);
    })
  */

  updateUser(userId, userData){

    if(this.STUB_MODE){
      console.warn('No STUB for restApi.updateUser(userId, userData)');
      return;
    }

    let uri = 'updateUser';
    let body = userData;
    body.id = userId;
    return this._post_request(uri, body, true);
  }



  //
  //
  // OBJECTS
  //
  //=======================================================================================


  getSampleObjects(objectType, params){

    // poc_data/catalogs-query.json
    let uri = objectType+'-query.json';
    return this._stub_request_json(uri);

  }


  // http://knexjs.org/#Builder-where

  /**
   * run a query

    @params.where      (string) where expression
                        "id=1"
                        "lastName>10"
                        
    @params.orderBy    ['column', 'asc|desc']

    @params.limit      {
                          offset: 0,      // starting from Nth record
                          results: 3      // limit to number of records
                        }

    @resolveReferences  null    - default - result will contain IDs for referenced objects

                        N       (int) - result will contain referenced objects, to a maximum depth of N
                                {                                 {
                                    id: 'user-1',         =>         id: 'user-1',
                                    thumb: 'image-1',                thumb: {
                                    firstName: 'Tom'                    id: 'image-id',
                                }                                       base64: '98fa8..9183'
                                                                     },

                                                                  }
  */
  queryObjects(objectType, params){

    if(this.STUB_MODE){
      // poc_data/catalogs-query.json
      let uri = objectType+'-query.json';
      return this._stub_request_json(uri);
    }

    
    let body: any = {
      'objectType': objectType,
      //'where': 'id=3',
      //'orderBy': ['timeUpdated', 'desc'],
    };

    body.resolveReferences = (params.resolveReferences)? params.resolveReferences: null;

    if(params.limit){
      body.limit = params.limit.results,
      body.offset = params.limit.offset
    }

    if(params.where){
      body.where = params.where;
    }
    
    if(params.orderBy){
      body.orderBy = params.orderBy
    }

    let uri = 'queryObjects';
    return this._post_request(uri, body, true);
    //return this._get_request('getObjects', true);


  }

  createObject(objectType, objectData){

    if(this.STUB_MODE){
      console.warn('No STUB for restApi.createObject(ObjectType, objectData)');
      return;
    }

    let uri = 'createObject';
    let body = objectData;
    body.objectType = objectType;
    return this._post_request(uri, body, true);

  }


  /**

    get a single object

    @objectType         "user"  (string) the object model
    @id                         (int) primary key

    @resolveReferences  null    - default - result will contain IDs for referenced objects

                        N       (int) - result will contain referenced objects, to a maximum depth of N
                                {                                 {
                                    id: 'user-1',         =>         id: 'user-1',
                                    thumb: 'image-1',                thumb: {
                                    firstName: 'Tom'                    id: 'image-id',
                                }                                       base64: '98fa8..9183'
                                                                     },

                                                                  }
  */

  getObject(objectType, id, resolveReferences=null){

    if(this.STUB_MODE){
      console.warn('No STUB for restApi.getObject(ObjectType, id)');
      return;
    }

    let uri = 'getObject';
    let body: any = {
      objectType: objectType,
      id: id,
      resolveReferences: resolveReferences
    };

    return this._post_request(uri, body, true);

  }

  getObjects(objectType, ids, resolveReferences=null){

    if(this.STUB_MODE){
      console.warn('No STUB for restApi.getObject(ObjectType, objectData)');
      return;
    }

    let uri = 'getObjects';
    let body = {
      objectType: objectType,
      ids: ids,
      resolveReferences: resolveReferences
    };
    return this._post_request(uri, body, true);

  }

  updateObject(objectType, objectId, objectData){

    if(this.STUB_MODE){
      console.warn('No STUB for restApi.updateObject(id, objectData)');
      return;
    }

    let uri = 'updateObject';
    let body = objectData;
    body.objectType = objectType;
    body.id = objectId;
    return this._post_request(uri, body, true);
  }





  //
  //
  // SYNCHRONIZE
  //
  //

  getRemoteModifiedObjects(params){

    let uri = 'getRemoteModifiedObjects';
    let body = {
      modifiedSince: params.modifiedSince
    };
    return this._post_request(uri, body, true);

  }

  //
  //
  //

  //getEvents(){
//
  //  if(this.STUB_MODE){
  //    // poc_data/catalogs-query.json
  //    let uri = 'events-query.json';
  //    return this._stub_request_json(uri);
  //  }
//
  //  let uri = 'mobile/objects?search';
  //  return this._get_request(uri);
//
//
  //}



  //
  //
  //
  //  INTERNAL PRIVATE METHODS
  //
  //
  //=======================================================================================

  _post_request(uri, body, skipPreAuth=false){

    let url = this.host + uri;

    return new Promise((resolve, reject) => {

      this.authenticateBeforeRequest(skipPreAuth).then((dat: any) => {

        if(!dat){
          resolve({
                  success: false,
                  message: "Authentication Required",
                  errors: "Auth",
                });
          return;
        }

        let headers = new Headers();
        headers.append('Content-Type', 'application/json;charset=UTF-8');
        //let options = new RequestOptions({ headers: headers, withCredentials: true  });
        let options = new RequestOptions({ headers: headers });

        this.http.post(url, body, options)
          //.map(res => res.json())
          .subscribe(res => {
            let res_json: any = res.json();
            if(res_json.success){
              resolve(res_json.body);
            }
            else{
              reject(res_json.error);
            }
          }, err => {
            try{
              let err_json: any = err.json();
              reject(err_json.error);
            }
            catch(e){
              reject(err);
            }
          });

      });


    });

  }

  _get_request(uri, skipPreAuth=false){

    let url = this.host + uri;

    
    return new Promise((resolve, reject) => {

      this.authenticateBeforeRequest(skipPreAuth).then((res: any) => {

        if(!res){
          resolve({
                  success: false,
                  message: "Authentication Required",
                  errors: "Auth",
                });
          return;
        }
          
        let headers = new Headers();
        headers.append('Content-Type', 'application/json;charset=UTF-8');
        //let options = new RequestOptions({ headers: headers, withCredentials: true  });
        let options = new RequestOptions({ headers: headers });

        this.http.get(url, options)
          //.map(res => res.json()) .subscribe(res => {
          .subscribe(res => {

            let res_json: any = res.json();
            if(res_json.success){
              resolve(res_json.body);
            }
            else{
              reject(res_json.error);
            }
          }, err => {
            try{
              let err_json: any = err.json();
              reject(err_json.error);
            }
            catch(e){
              reject(err);
            }
          });

        });

    });

  }

  _put_request(uri, body){

    let url = this.host + uri;

    return new Promise((resolve, reject) => {

      this.authenticateBeforeRequest().then((res: any) => {

        if(!res){
          resolve({
                  success: false,
                  message: "Authentication Required",
                  errors: "Auth",
                });
          return;
        }
          
        let headers = new Headers();
        headers.append('Content-Type', 'application/json;charset=UTF-8');
        let options = new RequestOptions({ headers: headers, withCredentials: true  });

        this.http.put(url, body, options)
          .subscribe(res => {

            let res_json: any = res.json();
            if(res_json.success){
              resolve(res_json.body);
            }
            else{
              reject(res_json.error);
            }
          }, err => {
            try{
              let err_json: any = err.json();
              reject(err_json.error);
            }
            catch(e){
              reject(err);
            }
          });

        });

    });

  }

  _stub_request_json(uri){

    return new Promise((resolve, reject) => {

      this.http.get('assets/poc_data/'+uri)
        .subscribe((res: any) => {

          //console.log(res);
          let data: any = res.json();
          resolve(data);

        }, err => {
          //console.log(err);
          resolve({
            success: false,
            message: JSON.parse(err._body)[0].context.error,
            error: JSON.parse(err._body)[0] 
          });    
        });
    });

  }

  _stub_request(uri){

    return new Promise(resolve => {

      this.http.get('assets/poc_data/'+uri)
        .subscribe((res: any) => {

          resolve(res);

        });
    });

  }


  isOnline(){
    return true;
  }

  error_notOnline(){

    return new Promise(resolve => {
      resolve({
        success: false,
        message: "Must be in Online Mode to perform this action"
      });
    });

  }

  error_notAuthenticated(){

    return new Promise(resolve => {
      resolve({
        success: false,
        message: "Must be in Logged In to perform this action"
      });
    });

  }

}