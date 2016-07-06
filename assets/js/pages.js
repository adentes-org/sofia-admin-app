define(["jquery","vue","app/pages/memo","app/pages/configuration","app/pages/team","app/pages/export","app/pages/conflict","app/pages/stat"], function($,Vue,memo,configuration,team,exp,conflict,stat) { //Load all page JS scripts
	var pages =  {
		menu: {
			"configuration" : "Configuration",
			"memo" : "Memo",
			"team" : "Teams",
			"export" : "Export",
			"conflict" : "Conflict",
			"stat": "Stats"
		},
		tabs : {
			configuration : configuration,
			memo : memo,
			team : team,
			export : exp,
			conflict : conflict,
			stat : stat,
		},
		components : {}
	}

	//Menu components
	pages.components.menu = Vue.extend({
  		props: ['current'],
			data: function () {
    		return { menu: pages.menu	}
  		},
  		template: '<div id="menu"><a v-on:click="changeView" class="button {{ current !== id ? \'button-outline\' : \'\'}}" v-for="(id, txt) in menu" id="{{ id }}" >{{ txt }}</a></div>',
			methods:{
				changeView : function(e){
        		this.$dispatch('change-view', $(e.target).attr("id"))
				}
			}
	});

  //Pages components
	for (var id in pages.tabs) {
		//console.log(pages.tabs[id].template);
		pages.tabs[id].template = '<div class="page" id="'+id+'">' + pages.tabs[id].template + '</div>'; //Force wrap around page element
	  pages.components[id] = Vue.extend(pages.tabs[id]);
	}

	return pages;
});
