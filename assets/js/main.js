define(["jquery", "vue", "pouchdb","app/config","app/pages","app/db", "trumbowyg"], function($,Vue,PouchDB,config,pages,db) {
	var S = {
		db: db,
		pages : pages
	};
	config.statOnly = window.location.hash.slice(1) === "stat" //Add #stat to only log for stat
	if(config.statOnly){
		S.pages.menu = {"stat": S.pages.menu["stat"]}; // Only stat in menu
	};
	window.S = S;
	$(function(){
		db.init(); //Check if credentials are in cache and try them.
		$("body>.app-loading").remove();
		var base = '<button style="display:none;" class="button-primary float-right" @click="logout" id="admin_user"></button>'+
								"<h1>SOFIA - Admin console</h1><menu :current='view'></menu><component v-ref:page :db='db' :config='config' :is='view'></component>"  //https://vuejs.org/guide/components.html#Dynamic-Components
		$("body>.app").html(base);

		S.app = new Vue({
		  el: '.app',
		  data: {
			view:  (config.statOnly)?'stat':'configuration',
			config: config,
			db: db
		  },
		  components: pages.components,
			events: {
				'change-view': function (id) {
					console.log("Showing page : "+id);
					this.view = id;
					window.setTimeout("S.app.$refs.page.$dispatch('onload')",100);
				}
			},
			methods :{
				logout : function(){
					//Clear all cache
					delete localStorage.SofiaDBVersion
					delete localStorage.SofiaCreds
					delete localStorage.SofiaFicheDBName
					window.location.reload();
				}
			}
		})
		
		db.tools.login({isStatOnly : config.statOnly}).then(function(info){
			console.log("We are in !",info)
			if(!config.statOnly){ // We need to monitor users db if full admin
				db.tools.monitor(db.users,function(change){
					S.app.$refs.page.$dispatch('onchange',change); //Forward change event
				});
			}
			db.tools.monitor(db.fiches,function(change){
				S.app.$refs.page.$dispatch('onchange',change); //Forward change event
			});
			$(".app>button#admin_user").show().html(db.config.creds.username);
			window.setTimeout("S.app.$refs.page.$dispatch('onload')",100);
		});
		
	})
	return S;
});
