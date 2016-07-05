requirejs.config({
    baseUrl: "assets",
    paths: {
      app: "js",
	     lib: "lib",

      jquery: 'lib/jquery/jquery-3.0.0.min',

      vue: 'lib/vuejs/vue.min',
	    pouchdb: 'lib/pouchdb/pouchdb-5.4.4.min',

	    qrcode: 'lib/qrcode/qrcode.min',
	    objectdiff: 'lib/objectdiff/objectDiff'
    },
    shim: {
        "app/main": {
            exports: 'S'
        },
        jquery: {
            exports: '$'
        },
        vue: {
            exports: 'Vue'
        },
        pouchdb: {
            exports: 'PouchDB'
        },
        qrcode: {
            exports: 'QRCode'
        },
        objectdiff: {
            exports: 'objectDiff'
        }
	}
});

// Load the main app module to start the app
requirejs(["app/main"]);
