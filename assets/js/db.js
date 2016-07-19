define(["pouchdb"], function(PouchDB) { //Load all Db related code
	//Base object
	var db = {
		isLoggued : false,
		tools : {
			monitor : function(data,onchange) {
				data.changes({
				  since: 'now',
				  live: true,
				  include_docs: false,
				  timeout: false,
				  heartbeat: 5000
				}).on('change', function(change) {
				  // handle change
				  onchange(change);
				}).on('complete', function(info) {
				  // changes() was canceled
				  // We reload monitor and fire change (since db has maybe change)
				  onchange(info);
				  db.tools.monitor(data,onchange);
				}).on('error', function (err) {
				  onchange(err);
				  db.tools.monitor(data,onchange);
				  console.log(err);
				});
			},
			createSecurity : function(db,dbname) {
				return db.request({
				      method: "PUT",
				      url: '_security',
				      body: {
					  "admins":{"names":[],"roles":[]},
					  "members":{"names":[],"roles":["equipier","equipier-"+dbname]} //TODO remove  common equipier role after complete migration
					}
				});
			},
			createConfig : function(db) {
				var attachment = new Blob(["<h2>Hello World</h2>"], { type: 'text/html' });
				return db.request({
				      method: "PUT",
				      url: '_design/sofia-config',
				      body: {
				      	token : Math.floor((1 + Math.random()) * 0x1000000000000000000).toString(34), //Token generate at creation to dectect new DB with same name as old one
				      	users : [],
				      	config : {
				      		global : {
				      			max_open : 10	
				      		},
				      		ownerToShow : []
				      	},
				      }
				}).then(function(doc){
					return db.get('_design/sofia-config').then(function(doc) {
						return db.putAttachment('_design/sofia-config', 'memo.html', doc._rev, attachment, 'text/html');
					});
				});
			},
			createFicheDB : function(dbname) {
				db.config.dbname.fiche = dbname;
				urls = db.tools.getUrl(true);

				db.fiches = new PouchDB(urls.fiche, {
					auth : db.config.creds,
					ajax: {timeout: 20000},
					skip_setup: false
				}); //Create DB
				
				//Apply secu
				db.tools.createSecurity(db.fiches,dbname).then(function (result) {
				  return db.tools.createConfig(db.fiches)
				}).then(function (result) {
				  return db.fiches.compact() //Compacting $DB
				}).catch(function (err) {
				  console.log(err);
				  alert(err); //TODO better handle
				});
			},
			login : function(params) {
				//Check-up of params
				if(typeof params === "undefined" || typeof params.isStatOnly === "undefined" ){
					params = {isStatOnly: false};
				}
				
				var d = (params.isStatOnly)?'fiches':'users';
				if(typeof db[d].info !== "function"){
					db.tools.askCredential();
				}

				return db[d].info().then(function (info) {
					//We are logged in
					db.isLoggued = true;
					db.tools.bckpConfig();
					if(!params.isStatOnly){
						//Check fiche db access if in admin mode.
						return db['fiches'].info().then(function (info) {
							//DB  exist
							db.tools.bckpConfig();
							//TODO still check-up _security and config design
							return info;
						}).catch(function (error) {
							//DB fiche don't exist
							console.log('Error detected', error);
							if (confirm("DB '"+db.config.dbname.fiche+"' don't exist create it ?")) {
								//Create DB
								return db.tools.createFicheDB(db.config.dbname.fiche);
							} else {
								//ask for another name and url if needed
								db.tools.setUrl(); //re-generate PouchDb object (only re-ask for DB fiche name)
								return db.tools.login(params);
							}
						})	
					}else{
						return info; //We are in stat only mode
					}
				}).catch(function (error) {
					//We are not logged in
					console.log('Error detected', error);
					db.tools.askCredential();
					return db.tools.login(params);
				})
				
			},
			getUrl : function(keepConfig) {
				if(db.config.url === window.location.protocol + '//' + window.location.host ){ //If default value
					if(!window.location.pathname.contains("/_design/")){ //If don't contains /_design/ we are not in hosted in DB
						db.config.url = prompt('DB URL :', db.config.url); //We ask for URL //TODO not use prompt
					}
				}else{ //The value has beene changed before.
					if(!keepConfig){ //If we are ask to keep config (like for creation of DB) don't go there
						db.config.url = prompt('DB URL :', db.config.url); //We ask for URL //TODO not use prompt
					}	
				}
				//TODO check if it a good couchdb 
				return {
					user : db.config.url + '/' + db.config.dbname.user,
					fiche : db.config.url + '/' + db.config.dbname.fiche
				}
			},
			setUrl : function() {
				db.config.dbname.fiche = prompt('DB Name :', db.config.dbname.fiche);//TODO not use prompt
				urls = db.tools.getUrl();
				db.users = new PouchDB(urls.user, {
					auth : db.config.creds,
					ajax: {timeout: 20000},
					skip_setup: true
				});
				db.fiches = new PouchDB(urls.fiche, {
					auth : db.config.creds,
					ajax: {timeout: 20000},
					skip_setup: true
				});
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
				localStorage.SofiaDBURL = db.config.url;
				localStorage.SofiaFicheDBName = db.config.dbname.fiche;
			},
			init : function() {
				//We load config in cache (localstorage)
				if (localStorage.SofiaDBVersion && localStorage.SofiaDBVersion !== 'undefined' && localStorage.SofiaDBVersion === '1') { //Check if data in localStorage is compatible
					if (localStorage.SofiaCreds && localStorage.SofiaCreds != 'undefined') { //We have credentials in cache
						db.config.creds = JSON.parse(localStorage.SofiaCreds)
					}
					
					if (localStorage.SofiaDBURL && localStorage.SofiaDBURL != 'undefined') { //We have url in cache
						db.config.url = localStorage.SofiaDBURL
					}
					
					if (localStorage.SofiaFicheDBName && localStorage.SofiaFicheDBName != 'undefined') { //We have FicheDBName in cache
						db.config.dbname.fiche = localStorage.SofiaFicheDBName
					}
					db.tools.setUrl();
				}else{
					//db.tools.askCredential(); //ask in login
				}
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
	return db;
});
