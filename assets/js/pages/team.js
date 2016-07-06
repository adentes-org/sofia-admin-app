define(["jquery"], function($) {
  return {
    props: ['db'],
    data: function () {
  	return {users : {}};
    },
    template: '<h2>Team Management</h2>'+
              '<table>'+
                '<thead><tr><th>Name</th><th>Password</th><th>Roles</th><th>Action</th></tr></thead>'+
                '<tbody>'+
                	'<tr id="add-user"><td><input type="text" id="name" placeholder="username" style="width: 240px;"></td><td><input type="text" id="password" placeholder="password" style="width: 240px;"></td><td></td><td><button class="button-primary" @click="addUser;">Ajouter</button></td></tr>'+
                	'<tr v-for="(id, user) in users" data-name="{{user.name}}" data-id="{{user._id}}" data-rev="{{user._rev}}"><td>{{user.name}}</td><td><button class="button button-outline" @click="resetPass">Reset</button></td><td>{{user.roles|json}}</td><td><button class="button button-outline" @click="delUser">Delete</button></td></tr>'
                '</tbody>'+
              '</table>',
    methods:{
    	resetPass: function(event){
    		
    	},
  	addUser : function(event){
  	},
  	delUser : function(event){
  		
  	}
    },
    events: {
  	onload : function(){
  	},
  	onchange : function(change){
  	}
     }
  };
})
