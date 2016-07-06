define(["jquery", "trumbowyg"], function($) {
  return {
  	props: ['db'],
	data: function () {
	        return {
	          rev : "",
	          memo : ""
	        };
  	},
  	template: '<h2>Memo edition</h2><textarea v-model="memo" data-rev="{{rev}}"></textarea><button class="button-primary" @click="updateMemo" style="float: right;">Valider</button>',
	methods:{
	        getMemo : function(){
	        	var data = this.data
		        this.db.fiches.get('_design/sofia-config', { attachments: true, binary: true }).then(function (doc) {
		          // handle result
		          console.log("Get memo",doc)
		          data.rev = doc._rev;
		
		          var reader = new FileReader();
		          reader.onload = function (event) {
		            console.log("Memo result : ",reader.result)
		            data.memo = reader.result;
		            $('#memo textarea').val(data.memo);
		          };
		          reader.readAsText(doc._attachments['memo.html'].data);
		        }).catch(function (err) {
		          console.log(err);
		        });
	        },
	        updateMemo : function(){
	          var obj = this;
	          console.log(this,this.memo,this.rev);
	          //var memo = this.memo;
	          var memo = $('#memo textarea').val(); this.memo = memo;
	
	          var attachment = new Blob([memo], { type: 'text/html' });
	
	          $('#memo>button').attr('disabled', 'disabled').text('Sending ...').blur();
	          console.log('Updating memo ...', attachment, this.rev);
	          //*
	          obj.db.fiches.get('_design/sofia-config').then(function(doc) {
	            return obj.db.fiches.putAttachment('_design/sofia-config', 'memo.html',  doc._rev, attachment, 'text/html');
	          }).then(function (result) {
	            // handle result
	            console.log(result);
	            obj.rev = result.rev;
	            $('#memo>button').removeAttr('disabled').text('Sauvegardé !').css('background-color', 'green');
	            window.setTimeout('$("#memo>button").text("Valider").css("background-color", "#9b4dca")', 3000);
	          }).catch(function (err) {
	            console.log(err);
	            alert(err.message);
	          });
	        }
	},
	events: {
	        onload : function(){
	          //$('#memo textarea').val(this.memo);
	          $('#memo textarea').trumbowyg();
	          this.getMemo();
	        },
	        onchange : function(change){
	          this.getMemo();
	        }
      }
	};
})
