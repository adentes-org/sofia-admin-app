define(["jquery","qrcode"], function($,QRCode) {
  return {
  	props: ['db'],
	data: function () {
    		return {
    			users : [],
    			style : {
			      row_count : 2,
			      column : 60
			}
  		}
  	},
  	template: '<button class="button-primary float-right" @click="generateUsersQRCode">Generate QR-Codes</button>'+
                  '<button class="button-primary float-right" @click="resetAllUsersPassword" style="margin-right: 1rem;">Reset all password</button>'+
  	          '<h2>Export</h2>'+
                  '<div id="table">'+
	                  '<div v-for="(i, user) in users" id="user-{{i}}" class="user" style="width : {{100/style.row_count}}%" >'+
	                    '<div class="row">'+
		                    '<div class="column column-{{style.column}}">'+
		                      '<p>URL: <span>{{db.config.url}}</span></p>'+
		                      '<p>Database Name: <span>{{db.config.dbname.fiche}}</span></p>'+
		                      '<p>Pseudo: <span>{{user.name}}</span></p>'+
		                      '<p style="display:none">Password: <span></span></p>'+
		                    '</div>'+
	                            '<div class="column column-{{100-style.column}}"><div id="qrcode-user-{{i}}"></div>'+
	                    '</div>'+
			  '</div>'+
                  '</div>',
	methods:{
		getUsers : function(){
		        var vue = this;
		        var users = []; //Empty array of users
		        //Filling user table
		        return this.db.users.allDocs({ include_docs: true }).then(function (result) {
		          console.log("Nb user (+ _design docs) : "+result.rows.length);
		          $.each(result.rows, function (index, value) {
		            var user = value.doc;
		            if (user.type != 'user')
		              return; //Ex _design doc
		            console.log(user);
		            users.push(user);
		          });
		          vue.users=users; //Apply to vue el
		        }).catch(function (err) {
		          //TODO handle err
		          console.log(err);
			});	
		},
		generateUsersQRCode : function(){
			var vue = this;
		     	$(this.users).each(function (index, user) {
		        	var el = $("user-"+index);
		        	var elQRCode = $("qrcode-user-"+index);
		        	
		        	var url = vue.db.config.url.replace("://","://"+user.name+"@") + "/" + vue.db.config.dbname.fiche;
		                var size=elQRCode.parent().width()-10;
		                
			        if(el.find(".column:first p:last").is(":visible")){
			            //console.log("We have a password : " +  el.find(".column:first p:last span").text())
			            url = url.replace("@", ":"+el.find(".column:first p:last span").text()+"@")
			        }
			        elQRCode.html(""); //Remove old QRCode
			        new QRCode(elQRCode[0], {
			            text : url,
			            width: size,
			            height: size
			        });
		     	});
		},
		resetAllUsersPassword : function(){
			//TODO
		}
	},
	events: {
	  	  onload : function(){
	  	    this.getUsers().then(this.generateUsersQRCode);
	  	  },
	  	  onchange : function(change){
	  	    this.getUsers().then(this.generateUsersQRCode);
	  	  }
	}
  };
})
