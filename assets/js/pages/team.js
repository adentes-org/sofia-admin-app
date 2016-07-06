define(["jquery"], function($) {
  return {
    props: ['db'],
  	data: function () {
  	        return {};
    },
    template: '<h2>Team Management</h2>'+
              '<table>'+
                '<thead><tr><th>Name</th><th>Password</th><th>Roles</th><th>Action</th></tr></thead>'+
                '<tbody><tr id="add-user"><td><input type="text" id="name" placeholder="username" style="width: 240px;"></td><td><input type="text" id="password" placeholder="password" style="width: 240px;"></td><td></td><td><button class="button-primary" onclick="addUser;">Ajouter</button></td></tr></tbody>'+
              '</table>',
  	methods:{
  	        addUser : function(){
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
