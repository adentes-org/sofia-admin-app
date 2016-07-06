define(["jquery"], function($) {
  return {
    props: ['db'],
    data: function () {
  	return {users : []};
    },
    template: '<h2>Team Management</h2>'+
              '<table>'+
                '<thead><tr><th>Name</th><th>Password</th><th>Roles</th><th>Action</th></tr></thead>'+
                '<tbody>'+
                	'<tr id="add-user"><td><input type="text" id="name" placeholder="username" style="width: 240px;"></td><td><input type="text" id="password" placeholder="password" style="width: 240px;"></td><td></td><td><button class="button-primary" @click="addUser">Ajouter</button></td></tr>'+
                	'<tr v-for="(i, user) in users" data-i="{{i}}" data-name="{{user.name}}" data-id="{{user._id}}" data-rev="{{user._rev}}"><td>{{user.name}}</td><td><button class="button button-outline" @click="resetPass">Reset</button></td><td>{{user.roles|json}}</td><td><button class="button button-outline" @click="delUser">Delete</button></td></tr>'+
                '</tbody>'+
              '</table>',
    methods:{
      getUsers : function(){
        var vue = this;
        var users = []; //Empty array of users
        //Filling user table
        this.db.users.allDocs({ include_docs: true }).then(function (result) {
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
    	getRandomPass: function(event){
    	  return Math.random().toString(36).substr(2, 5)
    	},
    	resetPass: function(event){
    	  var vue = this;
    	  var el = $(event.target).parent().parent(); //Get tr el
        var user = this.users[el.attr('data-i')];
        
    	  console.log('Reseting user pass ...', user);
    	  user.password = prompt('Choose a password :', vue.getRandomPass());
        this.db.users.put(user).then(function (response) {
          console.log(response);
  	      //vue.getUsers(); //not necessayer (trigger by onchange)
        }).catch(function (err) {
          console.log(err);
          alert(err.message);
        });
    	},
  	  addUser : function(event){
  	    var vue = this;
  	    
        console.log('Adding user ...');
        $('#add-user button').attr('disabled', 'disabled').text('Sending ...').blur();
        $('#add-user input').attr('disabled', 'disabled');
        var user = {
          _id: 'org.couchdb.user:' + $('#add-user input#name').val(),
          type: 'user',
          name: $('#add-user input#name').val(),
          password: $('#add-user input#password').val(),
          roles: [
             'equipier',
          ],
        };
        
        this.db.users.put(user).then(function (response) {
          // handle response
          console.log(response);
  	      //vue.getUsers(); //not necessayer (trigger by onchange)
          vue.updtUsersList();
          $('#add-user input').val('').removeAttr('disabled');
          $('#add-user button').removeAttr('disabled').text('Sauvegardé !').css('background-color', 'green');
          window.setTimeout('$("#add-user button").text("Valider").css("background-color", "#9b4dca")', 1000);
        }).catch(function (err) {
          console.log(err);
          alert(err.message);
        });
  	  },
  	  delUser : function(event){},
  	  updtUsersList: function(){},
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
