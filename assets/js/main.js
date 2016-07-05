define(["jquery", "vue", "pouchdb","app/pages","app/db"], function($,Vue,PouchDB,pages,db) {
	var S = {
		db: db,
		pages : pages
	};
	$(function(){
		$("body>center").remove();
		console.log(S.pages._home);
		db.tools.login().then(function(info){
			console.log("We are in !",info)
		})
	})
	return S;
});