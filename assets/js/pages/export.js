define(["jquery","qrcode","jspdf","app/tool"], function($,QRCode,jsPDF,tool) {
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
                  '<button class="button-primary float-right" @click="generatePDF" style="margin-right: 1rem;">Generate PDF</button>'+
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
		generatePDF : function(){
			var vue = this;
			/* Constants */
			var larg = 100
			var haut = 40
			var marg = (210-larg*2)/3;
			
			console.log("Collecting data ..."); //TODO maybe
			console.log("Generating PDF");
			var doc = new jsPDF();
			doc.setFontSize(12);
			var position = {x:0,y:0};
			$.each(this.users, function (i, user) {
				position.x = (i%2==1)?marg*2+larg:marg; 
				position.y += (i%2==1)?0:marg;
				
				doc.rect(position.x, position.y, larg, haut); 
				doc.rect(position.x+larg-haut, position.y, haut, haut); 
				
				doc.text(position.x+marg, position.y+marg*2, 'URL :');
				doc.text(position.x+marg, position.y+marg*2+haut/5, vue.db.config.url);
				doc.text(position.x+marg, position.y+marg*2+2*haut/5, "Database Name : "+vue.db.config.dbname.fiche); //TODO align dbname text to right (same for the others) 
				doc.text(position.x+marg, position.y+marg*2+3*haut/5, "Pseudo : "+user.name); 
				if(vue.passwords[user._id]){
					doc.text(position.x+marg, position.y+marg+4*haut/5, "Password : "+vue.passwords[user._id]);
        			}
				
				var elQRCode = $("#qrcode-user-"+i);
				imgData = elQRCode.find("img[src^='data']").attr('src'); //data:image/png;base64
				doc.addImage(imgData, 'PNG', position.x+larg-haut, position.y, haut, haut);
				
				position.y += (i%2==1)?haut:0; //Saut de ligne
			});
			console.log("Going PDF view");
			doc.save();
		},
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
                //url = url.replace("@", ":"+el.find(".column:first p:last span").text()+"@")
                url = url.replace("@", ":"+vue.passwords[user._id]+"@")
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
