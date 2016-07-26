/* global define */

define(["jquery"], function($) {
    return {
        props: ['db'],
        data: function() {
            return {
                fiches: {},
                tests: {
                	viewExistence : {
                		description : "Les indexes sont présent ?",
                		validator : function(db){
                			var test = this;
                			
                			//db.query('index', { include_docs: false }).then({
                			db.get('_design/fiche').then(function () {
                				//TODO test every veiw
                				test.result = true;	
                			}).catch(function (err) {
                				test.result = false;	
						console.log(err);
					});
                		},
                		result : false
                	}
                }
            };
        },
        template:   '<h2>Database</h2>' +
	            '<div id="fiches">' +
		            '<div v-for="(id, fiche) in fiches" class="fiche" id="fiche-{{id}}" style="width : 33%" >' +
		            	'{{id}}' +
		            '</div>' +
	            '</div>' +
	            '<div id="tests">' +
		            '<div v-for="(id, test) in tests" class="tes" id="test-{{id}}">' +
		            	'{{test.description}} : {{test.result}}' +
		            '</div>' +
	            '</div>',
        methods: {
            testViews: function() {
            	var vue = this;
                $.each(vue.tests, function(index, test) {
                	test.validator.call(test, vue.db); //Call in context of test
                });
            },
            getFiches: function() {
                var vue = this;
                var fiches = {};
                return this.db.fiches.allDocs({
                    include_docs: true,
                    conflicts: true,
                    attachments: false
                }).then(function(result) {
                    console.log(result);
                    $.each(result.rows, function(index, obj) {
                        //console.log(obj.doc)
                        if (obj.doc._id.startsWith("_")) {
                            return; //Skipping config file like "_design/sofia-config"
                        }
                        fiches[obj.doc._id] = obj.doc;
                    });
                    vue.fiches = fiches;
                }).catch(function(err) {
                    console.log(err);
                });
            }
        },
        events: {
            onload: function() {
                this.getFiches().then(this.testViews);
            },
            onchange: function() {
                this.getFiches().then(this.testViews);
            }
        }
    };
});
