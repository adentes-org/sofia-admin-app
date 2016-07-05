define(["jquery", "vue", "pouchdb","app/pages","app/db"], function($,Vue,PouchDB,pages,db) {
	var S = {
		db: db,
		pages : pages
	};
	$(function(){
		$("body>.app-loading").remove();
		var base = "<h1>SOFIA - Admin console</h1><menu :current.sync='currentView' ></menu>{{currentView}}"
		for (var id in pages.tabs) {
				base += "<"+id+" :is='currentView' ></"+id+">"
		}
		$("body>.app").html(base);
		S.app = new Vue({
		  el: '.app',
		  data: {
		    currentView: 'memo'
		  },
		  components: pages.components
		})
		console.log(pages.menu);
		/*
		db.tools.login().then(function(info){
			console.log("We are in !",info)
		})
		*/
	})
	return S;
});
