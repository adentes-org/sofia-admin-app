define(["jquery","qrcode","app/tool"], function($,QRCode,tool) {
  return {
  	props: ['db'],
	data: function () {
    		return {
    			users : [],
          passwords: {},
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
		                      '<p v-show="passwords[user._id]">Password: <span>{{passwords[user._id]}}</span></p>'+
		                    '</div>'+
	                      '<div class="column column-{{100-style.column}}"><div id="qrcode-user-{{i}}"></div></div>'+
	                    '</div>'+
			              '</div>'+
                  '</div>',
	methods:{
		getUsers : tool.debounce(function(){
		        var vue = this;
		        var users = []; //Empty array of users
		        //Filling user table
		        return this.db.users.allDocs({ include_docs: true }).then(function (result) {
		          console.log("Nb user (+ _design docs) : "+result.rows.length);
		          $.each(result.rows, function (index, value) {
		            var user = value.doc;
		            if (user.type != 'user')
		              return; //Ex _design doc
		            //console.log(user);
		            users.push(user);
		          });
		          vue.users=users; //Apply to vue el
              vue.generateUsersQRCode()
		        }).catch(function (err) {
		          //TODO handle err
		          console.log(err);
			      });
		}, 250),
		generateUsersQRCode : tool.debounce(function(){
			    var vue = this;
		     	$(this.users).each(function (index, user) {
		        	var el = $("#user-"+index);
		        	var elQRCode = $("#qrcode-user-"+index);

		        	var url = vue.db.config.url.replace("://","://"+user.name+"@") + "/" + vue.db.config.dbname.fiche;
		          var size=elQRCode.parent().width()-10;
              if(vue.passwords[user._id]){
                url = url.replace("@", ":"+el.find(".column:first p:last span").text()+"@")
              }
              console.log(size,url);

			        elQRCode.html(""); //Remove old QRCode
			        new QRCode("qrcode-user-"+index, {
			            text : url,
			            width: size,
			            height: size
			        });

		     	});
		}, 250),
		resetAllUsersPassword : function(){
			    var vue = this;
          var passwords = {};
          var users = [];
		     	$(this.users).each(function (index, user) {
              	  console.log('Reseting user pass ...', user);
              	  user.password = tool.getRandomPass();
                  passwords[user._id] = user.password;
                  users.push(user);
          });
          vue.passwords = passwords;
          vue.db.users.bulkDocs(users).then(function (response) {
            console.log(response);
            //vue.getUsers(); //not necessayer (trigger by onchange)
          }).catch(function (err) {
            console.log(err);
            alert(err.message);
          });
		}
	},
	events: {
	  	  onload : function(){
	  	    this.getUsers();
	  	  },
	  	  onchange : function(change){
	  	    this.getUsers();
	  	  }
	}
  };
})
