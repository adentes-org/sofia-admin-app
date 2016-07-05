define(["pouchdb"], function(PouchDB) { //Load all page JS scripts
	//Base object
	var db = {
		tools : {
			login : function() {
				return db.users.info().then(function (info) {
					//We are logged in
					return info;
				}).catch(function (error) {
					//We are not logged in
					console.log('Error detected', error);
					db.tools.askCredential();
					return db.tools.login();
				})
			},
			setUrl : function() {
				db.users = new PouchDB(db.config.url + '/' + db.config.dbname.user, {
					auth : db.config.creds
				});
				//db.fiches = new PouchDB(db.config.url + db.config.dbname.fiche, { //TODO not use prompt
				//*
				db.fiches = new PouchDB(db.config.url + '/' + prompt('DB Name :', db.config.dbname.fiche), {
					auth : db.config.creds
				});
				//*/
			},
			askCredential : function() {
				//TODO don't use prompt
				db.config.creds = {
					username: prompt('Admin username :', db.config.creds.username),
					password: prompt('Admin password :', db.config.creds.password),
				};
				db.tools.setUrl(); //re-generate PouchDb object;
				return db.config.creds;
			},
			bckpConfig : function() {
				localStorage.SofiaDBVersion = '1';
				localStorage.SofiaCreds = JSON.stringify(db.config.creds);
			}
		},
		config : {
			url: window.location.protocol + '//' + window.location.host,
			dbname : {
				user: '_users',
				fiche: 'sofia-fiches', //Default value
			},
			creds : {
				username : "couchdb", //Default value
				password : "couchdb" //Default value
			}
		},
		users : {},
		fiches : {}
	}

	//We load config in cache (localstorage)
	if (localStorage.SofiaDBVersion && localStorage.SofiaDBVersion != 'undefined' && localStorage.SofiaDBVersion != '1') { //Check if data in localStorage is compatible
		if (localStorage.SofiaCreds && localStorage.SofiaCreds != 'undefined') { //We have credentials in cache
			db.config.creds = JSON.parse(localStorage.SofiaCreds)
		}
		/* Not necessary sync we use it in from DB (same url)
		if (localStorage.SofiaDBURL && localStorage.SofiaDBURL != 'undefined') { //We have url in cache
			db.config.url = localStorage.SofiaDBURL
		}
		*/
		if (localStorage.SofiaDBName && localStorage.SofiaDBName != 'undefined') { //We have FicheDBName in cache
			db.config.dbname.user = localStorage.SofiaFicheDBName
		}
		//db.tools.setUrl(); //re-generate PouchDb object; //Call by login already
	}else{
		//db.tools.askCredential(); //Call by login already
	}

	return db;
});
