define(["objectdiff","jquery"], function(objectDiff,$) {
  return {
  		props: ["db"],
			data: function () {
    		return {
          conflicts : {},
          current : {
            src : {},
            conflict : {},
            result : "",
            diff : ""
          }
        }
  		},
  		template: '<button v-show="mergeButton" class="button-primary float-right" @click="validateMerge">Validate Merge</button>'+
                '<h2>Conflict</h2>'+
	              '<div id="editor-header" class="row" style="width: calc(100% - 2.2em);">'+
                  '<div class="column column-33">Source</div>'+
                  '<div class="column column-33">Conflict</div>'+
                  '<div class="column column-33">Result (editable) <div class="float-right"><button class="button button-small" @click="showRaw" disabled="disabled">raw</button> / <button @click="showDiff" class="button button-small">diff</button></div></div>'+
                '</div>'+
          	    '<div id="editor" class="row" style="width: calc(100% - 2.2em);">'+
                  '<div id="src" class="column column-33">{{current.src | json}}</div>'+
                  '<div id="conflict" class="column column-33">{{current.conflict | json}}</div>'+
                  '<div id="result" class="column column-33">'+
                    '<textarea class="raw" v-model="current.result"></textarea>'+
                    '<pre class="diff-box" style="display:none">{{{current.diff}}}</pre>'+
                  '</div>'+
                '</div>'+
                '<hr>'+
	              '<div id="conflicts">'+
                  '<div v-for="(id, cflics) in conflicts" class="fiche" id="fiche-{{id}}" style="width : 33%" >'+
                    '{{id}}<p><a class="button button-small" @click="resolveConflict" data-fiche="{{id}}" data-conflict="{{conflict}}" v-for="conflict in cflics">{{conflict}}</a></p>'+
                  '</div>'+
                '</div>',
      computed : {
        mergeButton : function(){
          try {
    		    var resultObj = JSON.parse(this.current.result);
            if(typeof resultObj._id === "undefined" || typeof resultObj._rev === "undefined"){
              return false
            }
          } catch (e) {
            return false
          }
          return true
        }
      },
			methods:{
        getConflicts : function(){
          var vue = this;
          var conflicts = {};
          return this.db.fiches.allDocs({
            include_docs: true,
            conflicts: true,
            attachments: true
          }).then(function(result){
            console.log(result);
            $.each(result.rows, function (index, obj) {
              //console.log(obj.doc)
              if(typeof obj.doc["_conflicts"] !== "undefined" && obj.doc["_conflicts"].length > 0 ){
                //We got conflict
                console.log("Conflict !" , obj.doc);
                conflicts[obj.doc._id] = obj.doc._conflicts;
              }
            });
            vue.conflicts = conflicts;
            //TODO check if the current conflict is still present
          }).catch(function (err) {
              console.log(err);
          });
        },
        resolveConflict :  function(event){
          var vue = this;
          var el = $(event.target);
          var fiche = el.attr("data-fiche");
          var conflict = el.attr("data-conflict");
          console.log(el,fiche,conflict);
          console.log("conflict getting doc:",fiche,conflict);
          vue.db.fiches.get(fiche).then(function(doc) {
            vue.db.fiches.get(fiche, {rev: conflict}).then(function (conflict) {
              // do something with the doc
                console.log("conflict resolution:",doc,conflict);
                vue.current.src=doc;
                vue.current.conflict=conflict;
                if(doc.events[doc.events.length-1].timestamp>conflict.events[conflict.events.length-1].timestamp){
                  vue.current.result=JSON.stringify(vue.mergeConflict(conflict,doc,doc._rev)); //The doc in DB is more recent that the conflict
                }else {
                  vue.current.result=JSON.stringify(vue.mergeConflict(doc,conflict,doc._rev)); //The conflict in DB is more recent that the conflict
                }
                vue.showRaw();
                /*
                $('#conflict>button').removeAttr('disabled').attr("data-id",id).attr("data-rev",rev)
                */
            }).catch(function (err) {
              // handle any errors
              alert(err.message)
            });
          }).catch(function (err) {
            // handle any errors
            alert(err.message)
          });

        },
        mergeConflict : function(o,n,rev){ // o : obj in db, n: obj to commit
           /* This will merge and keep a maximum of information (things deleted previously could be added) */
           var ret = $.extend({},o,{
             close_context : n.close_context,
             deleted : n.deleted,
             closed : n.closed,
             patient : n.patient,
             origin : n.origin,
             owner_id : n.owner_id,
             primaryAffection : n.primaryAffection,
             uid : n.uid
           }); //Close and overwrite some parts that can be directly
           $.each(n.pathologys, function(id,val){
             if ($.inArray(val,ret.pathologys) === -1) { //Not found
               ret.pathologys.push(val);
             }
           });
           $.each(n.events, function(id,val){
               var found = false;
               var searching = JSON.stringify(val);
               $.each(ret.events, function(i,v){
                 if(!found && JSON.stringify(v) === searching ){
                   found = true;
                 }
               });
               if(!found){
                 ret.events.push(val);
               }
           });
           ret.events.sort(function(x, y){ //Order
             return x.timestamp - y.timestamp;
           });
           ret._rev=rev;
           return ret;
        },
        getDiffConflict : function(o,n){
          return objectDiff.diff($.extend({}, o, {events : []}), $.extend({}, n, {events : []})) //Create a shallow clone and overwrite events parts to not be big in term of data
        },
        validateMerge : function(){
          var vue = this;
          $('#conflict>button').attr('disabled', 'disabled').text('Sending ...').blur();
          var obj = JSON.parse(vue.current.result);
          obj.events.push({
                    type : "action",
                    action : "AdminMergeConflict",
                    message : "Conflict detected and merged by admin!",
                    /* This take to much space
                    diff : objectDiff.diff(JSON.parse($(".page#conflict>#editor>#src").html()),obj),
                    conflict : JSON.parse($(".page#conflict>#editor>#conflict").html()),
                    */
                    diff: vue.getDiffConflict(vue.current.src,obj),
                    timestamp : Date.now(),
                    user :  vue.db.users.__opts.auth.username
          });
          vue.db.fiches.put(obj).then(function () {
            $('#conflict>button').text('Removing conflict ...').blur();
            vue.db.fiches.remove(vue.current.conflict._id, vue.current.conflict._rev).then(function () {
              $('#conflict>button').removeAttr('disabled').text('Finish !').css('background-color', 'green');
              //getConflicts(); //update conflict list done by monitoring changes
              window.setTimeout('$("#conflict>button").text("Validate Merge").css("background-color", "#9b4dca")', 1000);
              vue.current.src={};vue.current.conflict={};
              vue.current.result="";vue.current.diff="";
              vue.showRaw();
              // yay, we're done
            }).catch(function (err) {
                // handle any errors
                console.log(err);
                alert(err.message);
            });
          }).catch(function (err) {
            console.log(err);
            alert(err.message);
          });
        },
        showRaw : function(){
            console.log("Showing raw")
            $("button:contains('raw')").attr('disabled', 'disabled');
            $("button:contains('diff')").removeAttr('disabled');
            $(".page#conflict>#editor>#result>.diff-box").hide()
            $(".page#conflict>#editor>#result>.raw").show()
            window.setTimeout(function(){
              $(".page#conflict>#editor>#result>.raw")[0].style.height = "5px";
              $(".page#conflict>#editor>#result>.raw")[0].style.height = ($(".page#conflict>#editor>#result>.raw")[0].scrollHeight+5)+"px";
            },100);
        },
        showDiff : function(){
            console.log("Showing diff")
            var diff = objectDiff.diffOwnProperties(this.current.src,JSON.parse(this.current.result));
            console.log(diff);
            this.current.diff = objectDiff.convertToXMLString(diff)
            $("button:contains('raw')").removeAttr('disabled');
            $("button:contains('diff')").attr('disabled', 'disabled');
            $(".page#conflict>#editor>#result>.diff-box").show()
            $(".page#conflict>#editor>#result>.raw").hide()
        }
			},
    	events: {
    	  	  onload : function(){
    	  	    this.getConflicts();
    	  	  },
    	  	  onchange : function(change){
    	  	    this.getConflicts();
    	  	  }
    	}
	};
})
