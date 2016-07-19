requirejs.config({
    baseUrl: "assets",
    paths: {
      app: "js",
      lib: "lib",

      main: "js/main",

      jquery: 'lib/jquery/jquery.min',
      //jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min',
      trumbowyg: 'lib/trumbowyg/trumbowyg.min',

      vue: 'lib/vue/vue.min',
      pouchdb: 'lib/pouchdb/pouchdb.min',

      qrcode: 'lib/qrcodejs/qrcode.min',
      jspdf: 'lib/jspdf/jspdf.min',
      objectdiff: 'lib/objectdiff/objectDiff',
      highcharts: 'lib/highcharts/highcharts',
      "highcharts-more": 'lib/highcharts/highcharts-more',
      //"highcharts-solid-gauge": 'lib/highcharts/modules/solid-gauge'
      "highcharts-solid-gauge": 'lib/highcharts/solid-gauge'
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
        jspdf: {
            exports: 'jsPDF'
        },
        objectdiff: {
            exports: 'objectDiff'
        },
        highcharts: {
            exports: 'Highcharts'
        },
        "highcharts-more": ['highcharts'],
        "highcharts-solid-gauge": ['highcharts',"highcharts-more"]
	}
});

// Load the main app module to start the app
requirejs(["main"]);
