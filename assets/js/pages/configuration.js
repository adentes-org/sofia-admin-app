define(["qrcode"], function(QRCode) {
  return {
  		props: ['db'],
			data: function () {
    		return { }
  		},
  		template: '<h2>Configuration</h2><input v-model="db.tools.getUrl().fiche" disabled type="text" style="width: 100%;"><div id="qrcode"></div></div>',
			methods:{
			},
			events: {
        onload : function(){
          new QRCode(document.getElementById('qrcode'), this.db.tools.getUrl().fiche);
        }
      }
	};
})
