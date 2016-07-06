define(['jquery','highcharts','highcharts-more','highcharts-solid-gauge'], function($,Highcharts) {
  return {
  		props: ['db','config'],
			data: function () {
    		return { stats : {}, last_update : null,
          options : {
            gaugeOptions :{
              chart: {
                 type: 'gauge',
                 plotBackgroundColor: null,
                 plotBackgroundImage: null,
                 plotBorderWidth: 0,
                 plotShadow: false
             },

             title: {
                 text: 'Team'
             },
             credits: {
                 enabled: false
             },
             pane: {
                 startAngle: -150,
                 endAngle: 150,
                 background: [{
                     backgroundColor: {
                         linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                         stops: [
                             [0, '#FFF'],
                             [1, '#333']
                         ]
                     },
                     borderWidth: 0,
                     outerRadius: '109%'
                 }, {
                     backgroundColor: {
                         linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                         stops: [
                             [0, '#333'],
                             [1, '#FFF']
                         ]
                     },
                     borderWidth: 1,
                     outerRadius: '107%'
                 }, {
                     // default background
                 }, {
                     backgroundColor: '#DDD',
                     borderWidth: 0,
                     outerRadius: '105%',
                     innerRadius: '103%'
                 }]
             },
             yAxis: {
                 min: 0,
                 max: 200,
                 minorTickInterval: 'auto',
                 minorTickWidth: 1,
                 minorTickLength: 10,
                 minorTickPosition: 'inside',
                 minorTickColor: '#666',

                 tickPixelInterval: 30,
                 tickWidth: 2,
                 tickPosition: 'inside',
                 tickLength: 10,
                 tickColor: '#666',
                 labels: {
                     step: 2,
                     rotation: 'auto'
                 },
                 plotBands: []
               },
             series: []
            }
          }
  		  }
      },
  		template: '<h2>Stat  <i style="font-size: 50%;"">(last update : {{last_update.toLocaleString()}})</i></h2>'+
                '<div id="global"><p>Nb fiche ouverte : {{stats.fiche.open}}</p><p>Nb fiche fermée : {{stats.fiche.close}}</p><br/></div>'+
                '<div id="graph">'+
                  '<div id="container-open" style="width: 400px; height: 400px; display: inline-block"></div>'+
                  '<div id="container-affection" style="width: 400px; height: 400px; display: inline-block"></div>'+
                '</div>',
			methods:{
        updateCharts : function(){
          var specific = this.generateSpecificOptionGauge("Total open",this.config.global.max_open, {
              name: 'Open',
              data: [this.stats.fiche.open],
              tooltip: {
                  valueSuffix: ' fiche(s)'
              }
          });
          window.setTimeout("Highcharts.chart('container-open',"+JSON.stringify(Highcharts.merge(this.options.gaugeOptions,specific))+",function callback() {});",150)
        },
        generateSpecificOptionGauge : function(title,max,serie){
          return {
          			title: {
          					text: title
          			},
          			yAxis: {
          					min: 0,
          			    max: max,
                    title: {
                        text: 'open'
                    },
          					plotBands: [{
          							from: 0,
          							to: max*0.6,
          							color: '#55BF3B' // green
          					}, {
          							from: max*0.6,
          							to: max*0.8,
          							color: '#DDDF0D' // yellow
          					}, {
          							from: max*0.80,
          							to: max,
          							color: '#DF5353' // red
          					}]
          			},
          			series: [serie]
                /* serie = {
          					name: 'Open',
          					data: [stats.fiche.open],
          					tooltip: {
          							valueSuffix: ' fiche(s)'
          					}
          			}*/
          	}
        },
        getStats : function(){
          var vue = this;
          return vue.db.fiches.allDocs({include_docs: true}).then(function(result){
        		console.log(result);
        		var stats = {
        			fiche : {
        				total:0,
        				open:0,
        				close:0,
        				deleted:0,
        				affection : {

        				}
        			},
        			owner : {

        			}
        		};
        		$.each(result.rows, function (index, obj) {
          		//console.log(obj.doc)
          		var d = obj.doc;
        			if (d._id[0] === '_') //Maybe a _design doc
        				return;
          			//if(typeof obj.doc["_conflicts"] !== "undefined" && obj.doc["_conflicts"].length > 0 ){
          			if(typeof stats.owner[d.owner_id] === "undefined" ){
        	  			stats.owner[d.owner_id] = {
        					total:0,
        					open:0,
        					close:0,
        					deleted:0,
        					affection : {}
        				}
          			}
          			if(typeof stats.owner[d.owner_id].affection[d.primaryAffection] === "undefined" ){
        	  			stats.owner[d.owner_id].affection[d.primaryAffection] = {
        					total:0,
        					open:0,
        					close:0,
        					deleted:0
        				}
          			}
          			if(typeof stats.fiche.affection[d.primaryAffection] === "undefined" ){
        	  			stats.fiche.affection[d.primaryAffection] = {
        					total:0,
        					open:0,
        					close:0,
        					deleted:0
        				}
          			}
          			stats.fiche.total++;
          			stats.owner[d.owner_id].total++;
          			stats.fiche.affection[d.primaryAffection].total++;
          			stats.owner[d.owner_id].affection[d.primaryAffection].total++;
          			if (d.deleted){
          				stats.fiche.deleted++;
          				stats.owner[d.owner_id].deleted++;
          				stats.fiche.affection[d.primaryAffection].deleted++;
          			        stats.owner[d.owner_id].affection[d.primaryAffection].deleted++;
          			}else if (d.closed){
          				stats.fiche.close++;
          				stats.owner[d.owner_id].close++;
          				stats.fiche.affection[d.primaryAffection].close++;
          			        stats.owner[d.owner_id].affection[d.primaryAffection].close++;
          			}else{
          				stats.fiche.open++;
          				stats.owner[d.owner_id].open++;
          				stats.fiche.affection[d.primaryAffection].open++;
          			        stats.owner[d.owner_id].affection[d.primaryAffection].open++;
          			}
        		});
        		console.log(stats);
            vue.stats = stats;
            vue.last_update = new Date();
//        		$("#stat_vue").html(formatStats(stats));
        	});
        }
			},
    	events: {
    	  onload : function(){
          this.getStats().then(this.updateCharts);
    	  },
    	  onchange : function(change){
          this.getStats().then(this.updateCharts);
    	  }
      }
	};
})
