
LOADING & SAVING OBJECTS

----

UNPACK method (called when object is loaded from DB or REST API):
* LocalDataServiceProvider._unpackUser
-
PACK method (called before object is saved to DB or REST API):
* LocalDataServiceProvider._packUser



LOAD OBJECT BY ID
--------
    // get user by id
    this.restApi.getObject('user', this.user_id).then((user: any) => {
  
      console.log(user);


    })



SAVE OBJECT BY ID
--------
    // save user
    this.restApi.updateObject('user', this.user.id, this.user);

    // 

