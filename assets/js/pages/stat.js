define(['jquery','highcharts','highcharts-more','highcharts-solid-gauge'], function($,Highcharts) {
  return {
  		props: ['db','config'],
			data: function () {
    		return { stats : {}, charts: {},last_update : null,
          options : {
            histOptions : {
              chart: {
                  type: 'spline',
                  animation: Highcharts.svg, // don't animate in old IE
                  marginRight: 10,
              },
              credits: {
                  enabled: false
              },
              title: {
                text: 'Live open fiches'
              },
              xAxis: {
                  type: 'datetime',
                  tickPixelInterval: 150
              },
              yAxis: {
                  title: {
                      text: 'Value'
                  },
                  plotLines: [{
                      value: 0,
                      width: 1,
                      color: '#808080'
                  }]
              },
              tooltip: {
                  formatter: function () {
                      return '<b>' + this.series.name + '</b><br/>' +
                          Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                          this.y;
                          //Highcharts.numberFormat(this.y, 2);
                  }
              },
              legend: {
                  enabled: false
              },
              exporting: {
                  enabled: false
              },
              series: [{
                name: 'Total open',
                data: []
              }]
            },
            pieOptions : {
              chart: {
                  plotBackgroundColor: null,
                  plotBorderWidth: null,
                  plotShadow: false,
                  type: 'pie'
              },
              credits: {
                  enabled: false
              },
              plotOptions: {
                  pie: {
                      allowPointSelect: true,
                      cursor: 'pointer',
                      dataLabels: {
                          enabled: true,
                          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                          style: {
                              color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                          }
                      }
                  }
              },
              series: []
            },
            gaugeOptions :{
              chart: {
                 type: 'gauge',
                 plotBackgroundColor: null,
                 plotBackgroundImage: null,
                 plotBorderWidth: 0,
                 plotShadow: false
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
  		template: '<h2>Stat <i style="font-size: 50%;"">(last update : {{last_update.toLocaleString()}})</i></h2>'+
                '<div id="global"><p>Nb fiche ouverte : {{stats.fiche.open}}</p><p>Nb fiche fermée : {{stats.fiche.close}}</p><br/></div>'+
                '<div id="global-graph" style="text-align: center;">'+
                  '<div id="container-open" style="width: 400px; height: 400px; display: inline-block"></div>'+
                  '<div id="container-affection" style="width: 720px; height: 400px; display: inline-block"></div>'+
                '</div>'+
                '<br/><div id="container-historic" style="width: 100%; height: 400px; display: inline-block"></div><br/><hr>'+
                '<div id="owners-graph">'+
                  '<div v-for="(owner, config) in config.ownerToShow">'+
                     '<div id="container-owner-{{owner}}" style="width: 25%; height: 200px; display: inline-block"></div>'+
                     '<div id="container-affections-{{owner}}" style="width: 25%; height: 200px; display: inline-block"></div>'+
                     '<div id="container-historic-{{owner}}" style="width: 50%; height: 200px; display: inline-block"></div>'+
                  '</div>'+
                '</div>',
      computed: {
      },
      methods:{
        chart : function(id,data){
          if(typeof this.charts[id] === "undefined"){
            this.charts[id] = Highcharts.chart(id,data);
          }else{
            //console.log(id,this.charts[id],this.charts[id].series[0])
            this.charts[id].series[0].setData(data.series[0].data)
          }
        },
        updateCharts : function(){
          var vue = this;
          var stats = vue.stats

          var specificGaugeOptions = this.generateSpecificOptionGauge("Total open",this.config.global.max_open, {
              name: 'Open',
              data: [stats.fiche.open],
              tooltip: {
                  valueSuffix: ' fiche(s)'
              }
          });
          var specificPieOptions = this.generateSpecificOptionPie("Affections primaires totales", {
            name: 'Affections',
            colorByPoint: true,
            data: Object.keys(stats.fiche.affection).map(function(name, index) {
              return {
                name : name,
                color: vue.config.affectionColor[name],
                y : stats.fiche.affection[name].total - stats.fiche.affection[name].deleted
              }
            })
          });
          this.chart('container-open',Highcharts.merge(this.options.gaugeOptions,specificGaugeOptions))
          this.chart('container-affection',Highcharts.merge(this.options.pieOptions,specificPieOptions))
          //console.log(this.charts['container-historic'].series[0],this.charts['container-historic'].series[0].addPoint)
          var point = [(new Date()).getTime(), stats.fiche.open];
          //console.log(stats.fiche.open,this.charts['container-historic'].series[0].data,point);
          this.charts['container-historic'].series[0].addPoint(point, true, this.charts['container-historic'].series[0].data.length>50); //Over 50 points we shift oldest

	        $.each(this.config.ownerToShow, function (id, params) {
            		var  open = 0; //Set to zero by default
                var  affection = {}; //Set to empty by default
            		if(typeof stats.owner[id] !== "undefined"){
            			open = stats.owner[id].open;
              		affection = stats.owner[id].affection;
            		}

                var specificGaugeOptions = vue.generateSpecificOptionGauge(id,params.max, {
                  name: 'Open',
                  data: [open],
                  tooltip: {
                    valueSuffix: ' fiche(s)'
                  }
                });
                var specificPieOptions = vue.generateSpecificOptionPie("Affections", {
                  name: 'Affections',
                  colorByPoint: true,
                  data: Object.keys(affection).map(function(name, index) {
                    return {
                      name : name,
                      color: vue.config.affectionColor[name],
                      y : affection[name].total - affection[name].deleted
                    }
                  })
                });

                vue.chart('container-owner-'+id,Highcharts.merge(vue.options.gaugeOptions,specificGaugeOptions))
                vue.chart('container-affections-'+id,Highcharts.merge(vue.options.pieOptions,specificPieOptions))
          })

        },
        generateSpecificOptionPie : function(title,serie){
          return {
          			title: {
          					text: title
          			},
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.y} fiches</b>'
                },
                series: [serie]
          }
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

            	if(d.primaryAffection.trim() === "" || d.primaryAffection === null){ //empty name
            		d.primaryAffection = "undefined";
            	}
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
          Highcharts.setOptions({
              global: {
                  useUTC: false
              }
          });
          this.chart('container-historic',this.options.histOptions);
          this.getStats().then(this.updateCharts);
    	  },
    	  onchange : function(change){
          /* We don't care since we update dinammicly graph
          if(typeof change.message !== "undefined"){
           return; //This is a error event do not update.
          }
          */
          this.getStats().then(this.updateCharts);
    	  }
      }
	};
})
