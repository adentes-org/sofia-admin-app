define(["jquery","app/pages/memo"], function($,memo) { //Load all page JS scripts
	var pages =  {
		home: memo,
		menu: {
			"configuration" : "Configuration",
			"memo" : "Memo",
			"team" : "Teams",
			"export" : "Export",
			"conflict" : "Conflict",
			"stat": "Stats"
		},
		tabs : {
			memo : memo,
		},
		components : {

		}
	}
	//*
	pages.components.menu = Vue.extend({
  		template: '<div id="menu"><a v-for="(id, txt) in menu" id="{{ id }}" >{{ txt }}</a></div>'
	});
	for (var id in pages.tabs) {
	  pages.components[id] = Vue.extend(pages.tabs[id]);
	}

	return pages;
});
