define(["jquery","vue","app/pages/memo"], function($,Vue,memo) { //Load all page JS scripts
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
					  //console.log(e,$(e.srcElement).attr("id"));
						this.current = $(e.srcElement).attr("id");
				}
			}
	});

  //Pages components
	for (var id in pages.tabs) {
	  pages.components[id] = Vue.extend(pages.tabs[id]);
	}

	return pages;
});
