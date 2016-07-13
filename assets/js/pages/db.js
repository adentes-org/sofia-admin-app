define(["jquery"], function($) {
  return {
  		props: ['db'],
			data: function () {
    		return {
    		  fiches : {}
    		}
  		},
  		template: '<h2>Database</h2>'+	              
                '<div id="fiches">'+
                  '<div v-for="(id, fiche) in fiches" class="fiche" id="fiche-{{id}}" style="width : 33%" >'+
                    '{{id}}'+
                  '</div>'+
                '</div>',
			methods:{
			  getFiches : function(){
			    var vue = this;
          var fiches = {};
          return this.db.fiches.allDocs({
            include_docs: true,
            conflicts: true,
            attachments: false
          }).then(function(result){
            console.log(result);
            $.each(result.rows, function (index, obj) {
              //console.log(obj.doc)
              fiches[obj.doc._id] = obj.doc;
            });
            vue.fiches = fiches;
          }).catch(function (err) {
              console.log(err);
          });
			  }
			},
			events: {
        onload : function(){
    	  	    this.getFiches();
        },
        onchange : function(){
    	  	    this.getFiches();
        }
      }
	};
})