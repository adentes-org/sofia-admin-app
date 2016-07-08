define(['jquery',"app/tool",'highcharts','highcharts-more','highcharts-solid-gauge'], function($,tool,Highcharts) {
  return {
  		props: ['db','config'],
			data: function () {
    		return { stats : {}, users : [] ,charts: {},last_update : null,
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
              xAxis: {
                  type: 'datetime',
                  tickPixelInterval: 150
              },
              yAxis: {
                  title: {
                      text: 'Value'
                  },
                  allowDecimals : false,
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
              series: []
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
  		template: '<button class="button-primary float-right" @click="forceUpdt">Mise à jour forcée</button>'+
  		'<h2>Stat <i style="font-size: 50%;"">(dernière mise à jour : {{last_update.toLocaleString()}})</i></h2>'+
                '<button class="button-primary float-right" @click="saveConfig">saveConfig</button>'+
                '<div id="config"><p>Nb max global : <input v-model="config.global.max_open" /></p><p>'+
                  '<button v-for="user in users" @click="addToOwnerToShow" class="button button-small {{config.ownerToShow[user]?\'\':\'button-outline\'}}" style="margin-right:5px;">{{ user }}</button>'+
                '</p></div><hr>'+
                '<div id="global"><p>Nb fiche ouverte : {{stats.fiche.open}}</p><p>Nb fiche fermée : {{stats.fiche.close}}</p><br/></div>'+
                '<div id="global-graph" style="text-align: center;">'+
                  '<div id="container-open" style="width: 35%; height: 400px; display: inline-block"></div>'+
                  '<div id="container-affection" style="width: 65%; height: 400px; display: inline-block"></div>'+
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
            if(data.series[0].data.length === 1 && typeof data.series[0].data[0].x !== "undefined"){ //This a uniq point with x position (so spline point)
            	var point = [data.series[0].data[0].x,data.series[0].data[0].y];
            	this.charts[id].series[0].addPoint(point, true, this.charts[id].series[0].data.length>50); //Over 50 points we shift oldest
            }else{
            	this.charts[id].series[0].setData(data.series[0].data)
            }


          }
        },
        updateCharts : function(){
          var vue = this;
          var stats = vue.stats

          var specificGaugeOptions = this.generateSpecificOptionGauge("Fiches ouvertes totales",this.config.global.max_open, {
              name: 'Ouvertes',
              data: [stats.fiche.open],
              tooltip: {
                  valueSuffix: ' fiche(s)'
              }
          });
          var specificPieOptions = this.generateSpecificOptionPie("Affections primaires totales",true, {
            name: 'Affections',
            colorByPoint: true,
            data: Object.keys(stats.fiche.affection).map(function(name, index) {
              return {
                name : vue.config.affectionText[name] || name,
                color: vue.config.affectionColor[name],
                y : stats.fiche.affection[name].total - stats.fiche.affection[name].deleted
              }
            })
          });
	  var specificHistOptions = this.generateSpecificOptionHist("Suivi temporel fiches ouvertes",{
                name: 'Fiches ouvertes',
                data: [{
                	x:(new Date()).getTime(),
                	y:stats.fiche.open
                }]
           });

          this.chart('container-open',Highcharts.merge(this.options.gaugeOptions,specificGaugeOptions))
          this.chart('container-affection',Highcharts.merge(this.options.pieOptions,specificPieOptions))
          this.chart('container-historic',Highcharts.merge(this.options.histOptions,specificHistOptions))
          //this.charts['container-historic'].series[0].addPoint(point, true, this.charts['container-historic'].series[0].data.length>50); //Over 50 points we shift oldest

	   $.each(this.config.ownerToShow, function (id, params) {
            	var  open = 0; //Set to zero by default
                var  affection = {}; //Set to empty by default
            	if(typeof stats.owner[id] !== "undefined"){
            		open = stats.owner[id].open;
              		affection = stats.owner[id].affection;
            	}

                var specificGaugeOptions = vue.generateSpecificOptionGauge(id,params.max, {
                  name: 'Ouvertes par '+id,
                  data: [open],
                  tooltip: {
                    valueSuffix: ' fiche(s)'
                  }
                });
                var specificPieOptions = vue.generateSpecificOptionPie("Affections",false, {
                  name: 'Affections',
                  colorByPoint: true,
                  data: Object.keys(affection).map(function(name, index) {
                    return {
                      name : vue.config.affectionText[name] || name,
                      color: vue.config.affectionColor[name],
                      y : affection[name].total - affection[name].deleted
                    }
                  })
                });
		var specificHistOptions = vue.generateSpecificOptionHist(" ",{
	                name: 'Ouvertes par '+id,
	                data: [{
	                	x:(new Date()).getTime(),
	                	y:open
	                }]
	         });

                vue.chart('container-owner-'+id,Highcharts.merge(vue.options.gaugeOptions,specificGaugeOptions))
                vue.chart('container-affections-'+id,Highcharts.merge(vue.options.pieOptions,specificPieOptions))
                vue.chart('container-historic-'+id,Highcharts.merge(vue.options.histOptions,specificHistOptions))
          })

        },
        generateSpecificOptionHist : function(title,serie){
            return {
            	title: {
          		text: title
          	},
                series: [serie]
            }
        },
        generateSpecificOptionPie : function(title,displayLegends,serie){
          return {
                title: {
                  text: title
                },
                legend: {
                  enabled: displayLegends
                },
                plotOptions: {
	                pie: {
	                    dataLabels: {
	                        enabled: displayLegends
	                    }
	                }
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
        forceUpdt : function(){
        	this.getStats();
        },
        addToOwnerToShow : function(event){
          var user = $(event.target).text();
          var ownerToShow = $.extend({},this.config.ownerToShow);

          if (this.config.ownerToShow[user]){
            delete ownerToShow[user]
          } else {
            ownerToShow[user] = {max:parseInt(prompt("Max on gauge graph ?", "5"))};
            //this.config.ownerToShow.$add(user, {max:5});
          }
          this.$set("config.ownerToShow", ownerToShow);
          this.charts = {}; //Reset
          this.getStats();
        },
        saveConfig : function(){
          var vue =  this;
          this.db.fiches.get('_design/sofia-config').then(function (doc) {
            doc.config = {
              global : vue.config.global,
              ownerToShow : vue.config.ownerToShow
            }
            return vue.db.fiches.put(doc).then(function(doc){
              //window.location.reload(); //TODO reload grpah dinamicly OR REST local graph
              vue.charts = {};
              this.getStats();// Normally call by onchange also but in case (sinc func is debounce)
            });
          }).catch(function (err) {
            console.log(err);
          });
        },
        getConfig : function(){
          var vue =  this;
          return this.db.fiches.get('_design/sofia-config').then(function (doc) {
            // handle result
            console.log("Get config",doc.config)
            if(typeof doc.config !== "undefined"){ //TODO checkuo config format
              if(JSON.stringify({ global : vue.config.global,  ownerToShow : vue.config.ownerToShow }) !== JSON.stringify(doc.config)){ //We have update we reset
                vue.charts = {};
              }
              vue.$set("config", $.extend({},vue.config,doc.config)); //Apply config
            }
            if(typeof doc.users !== "undefined"){
              vue.$set("users", doc.users);
            }

            console.log(vue.config);
          }).catch(function (err) {
            console.log(err);
          });
        },
        getStats : tool.debounce(function(){
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
            vue.updateCharts()
//        		$("#stat_vue").html(formatStats(stats));
        	});
        }, 250)
			},
    	events: {
    	  onload : function(){
          Highcharts.setOptions({
              global: {
                  useUTC: false
              }
          });
          this.getConfig().then(this.getStats);
    	  },
    	  onchange : function(change){
          console.log(change)
          /* We don't care since we update dinammicly graph
          if(typeof change.message !== "undefined"){
           return; //This is a error event do not update.
          }
          */
          //TODO getConfig if _design/sofia-config in change
          if(change.id && change.id === "_design/sofia-config"){
            this.getConfig().then(this.getStats);
          }else{
            this.getStats();
          }
    	  }
      }
	};
})
