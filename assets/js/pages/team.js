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
                	'<tr id="add-user"><td><input type="text" id="name" placeholder="username" style="width: 240px;"></td><td><input type="text" id="password" placeholder="password" style="width: 240px;"></td><td></td><td><button class="button-primary" @click="addUser;">Ajouter</button></td></tr>'+
                	'<tr v-for="(i, user) in users" data-i="{{i}}" data-name="{{user.name}}" data-id="{{user._id}}" data-rev="{{user._rev}}"><td>{{user.name}}</td><td><button class="button button-outline" @click="resetPass">Reset</button></td><td>{{user.roles|json}}</td><td><button class="button button-outline" @click="delUser">Delete</button></td></tr>'+
                '</tbody>'+
              '</table>',
    methods:{
      getUsers : function(){
        var vue = this;
        //vue.users = [];
        vue.users.length = 0
        //Filling user table
        this.db.users.allDocs({ include_docs: true }).then(function (result) {
          console.log("Nb user (+ _design docs) : "+result.rows.length);
          $.each(result.rows, function (index, value) {
            var user = value.doc;
            if (user.type != 'user')
              return; //Ex _design doc
            console.log(user);
            vue.users.push(user);
          });
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
  	      vue.getUsers();
        }).catch(function (err) {
          console.log(err);
          alert(err.message);
        });
    	},
  	  addUser : function(event){},
  	  delUser : function(event){}
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
