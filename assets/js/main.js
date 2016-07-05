define(["jquery", "vue", "pouchdb","app/pages","app/db"], function($,Vue,PouchDB,pages,db) {
	var S = {
		db: db,
		pages : pages
	};
	$(function(){
		$("body>.app-loading").remove();
		$("body>.app").html("<menu></menu>");
		S.app = new Vue({
		  el: '.app',
		  data: {
				menu: S.pages.menu,
		    currentView: 'memo'
		  },
		  components: S.pages.components
		})
		/*
		db.tools.login().then(function(info){
			console.log("We are in !",info)
		})
		*/
	})
	return S;
});
