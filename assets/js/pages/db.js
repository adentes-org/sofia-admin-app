/* global define */
define(["jquery"], function($) {
    return {
        props: ['db'],
        data: function() {
            return {
                fiches: {},
                tests: {
                    viewExistence: {
                        description: "Les indexes sont présent ?",
                        validator: function(db) {
                            var test = this;

                            //db.query('index', { include_docs: false }).then({
                            db.fiches.get('_design/fiche').then(function() {
                                //TODO test every veiw
                                test.result = true;
                            }).catch(function(err) {
                                test.result = false;
                                console.log(err);
                            });
                        },
                        result: false
                    }
                }
            };
        },
        template: '<h2>Database</h2>' +
            '<div id="actions" class="float-right">' +
            	'<button class="button-primary" @click="applyView">(Re-)Generate View/Index</button>'+
            '</div>' +
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
            applyView: function() {
                var vue = this;

                // create a design doc
                var index = {
                    _id: '_design/fiche',
                    views: {
                        by_owner: {
                            map: function(doc) {
                                if (doc.owner_id) {
                                    emit(doc.owner_id);
                                }
                            }.toString()
                        },
                        by_uid: {
                            map: function(doc) {
                                if (doc.uid) {
                                    emit(doc.uid);
                                }
                            }.toString()
                        }
                    }
                };

                // save the design doc
                vue.db.fiches.put(index).catch(function(err) {
                    if (err.name !== 'conflict') {
                        // if doc already exists erase and retry
                        return vue.db.fiches.get(index._id).then(function(doc) {
                            return vue.db.fiches.remove(doc);
                        }).catch(function(err) {
                            console.log(err);
                            alert(err.message);
                        }).then(function(result) {
                            // Regenerate 
                            return vue.applyView();
                        });
                    } else {
                        //Other error are to be logged
                        console.log(err);
                        alert(err.message);
                    }
                });
            },
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
