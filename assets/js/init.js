requirejs.config({
    baseUrl: "assets",
    paths: {
      app: "js",
	    lib: "lib",

	    main: "js/main",

      jquery: 'lib/jquery/jquery-3.0.0.min',
      //jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min',
      trumbowyg: 'lib/trumbowyg/trumbowyg.min',

      vue: 'lib/vuejs/vue.min',
	    pouchdb: 'lib/pouchdb/pouchdb-5.4.4.min',

	    qrcode: 'lib/qrcode/qrcode.min',
	    objectdiff: 'lib/objectdiff/objectDiff'
    },
    shim: {
        "main": {
            exports: 'S'
        },
        jquery: {
            exports: '$'
        },
        trumbowyg: ['jquery'],
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
requirejs(["main"]);
