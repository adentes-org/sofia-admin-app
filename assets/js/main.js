define(["jquery", "vue", "pouchdb","app/pages","app/db", "trumbowyg"], function($,Vue,PouchDB,pages,db) {
	var S = {
		db: db,
		pages : pages
	};
	window.S = S;
	$(function(){
		$("body>.app-loading").remove();
		var base = "<h1>SOFIA - Admin console</h1><menu :current='view'></menu><component v-ref:page :db='db' :is='view'></component>"  //https://vuejs.org/guide/components.html#Dynamic-Components
		$("body>.app").html(base);

		S.app = new Vue({
		  el: '.app',
		  data: {
		    view: 'configuration',
			  db: db
		  },
		  components: pages.components,
			events: {
				'change-view': function (id) {
					console.log("Showing page : "+id);
					this.view = id;
					//S.app.$refs.page.$dispatch('onload', "") //To be delayed for the componenet to be update
					window.setTimeout("S.app.$refs.page.$dispatch('onload')",100);
				}
			}
		})
		/*
		db.tools.login().then(function(info){
			console.log("We are in !",info)
			db.tools.monitor(db.users,function(change){
				S.app.$refs.page.$dispatch('onchange',change); //Forward change event
			});
			db.tools.monitor(db.fiches,function(change){
				S.app.$refs.page.$dispatch('onchange',change); //Forward change event
			});
			window.setTimeout("S.app.$refs.page.$dispatch('onload')",100);
		})
		//*/
	})
	return S;
});
