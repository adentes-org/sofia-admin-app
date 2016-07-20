define(['jquery',"app/tool",'highcharts','highcharts-more','highcharts-solid-gauge'], function($,tool,Highcharts) {
	return {
		props: ['db','config'],
	data: function () {
			return {
				stats : {},
				users : [],
				charts: {},
				last_update : null,
				errors : [],
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
									tickPixelInterval: 150,
									plotBands: []
							},
							yAxis: {
									min:0,
									minRange:1,
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
													Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' + this.y;
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
								 allowDecimals : false,
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
			'<div v-if="!config.statOnly" id="config">'+
									'<button class="button-primary float-right" @click="saveConfig">saveConfig</button>'+
									'<button class="button-primary float-right" style="margin-right: 5px;" @click="reloadConfig">reloadConfig</button>'+
									'<p>Nb max global : <input v-model="config.global.max_open" /></p>'+
									'<p><button v-for="user in users" @click="addToOwnerToShow" class="button button-small {{config.ownerToShow[user]?\'\':\'button-outline\'}}" style="margin-right:5px;">{{ user }}</button></p>'+
					'</div><hr>'+
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
								'</div>'+
								'<h4>Logs :</h4><div id="global-log" class="logs"></div>',
			computed: {
			},
			methods:{
				addBand : function(color,from,to,label){
					var vue = this;
					$.each(vue.charts, function (index, config) { //only updt historic grpah
						if(index === "container-historic"||index.startsWith("container-historic-")){
							vue.charts[index].xAxis[0].addPlotBand({
									from: from,
									to: to,
									color: color,
									label: label
							});
						}
					});
				},
				tick : function(){ //Generate one point base on old value or new one if timeout is over in order to have a constant graph animation.
								//Call by timer or GetStat to update graph
								var vue = this;
								//console.log("tick");
								if(this.tick_timer){
									window.clearTimeout(this.tick_timer);
								}
								//Compare last_update to this.config.graph.timeout and now to determinate if a pull of DB is necessary.
								var limit = new Date();
								limit.setSeconds(limit.getSeconds() - this.config.graph.timeout);
								if(this.last_update === null || (this.last_update < limit && (vue.errors.length === 0 || vue.errors[vue.errors.length-1] < limit) )){
									console.log("tick","getStats");
									this.getStats(); //This will trigger again tick after getting data and updating last_update
								}else{
									console.log("tick","updateCharts");
									this.updateCharts(); //Add point base on curretn stat
									if(!(vue.errors.length === 0 || vue.errors[vue.errors.length-1] < vue.last_update)){
										//Update last plotband error since we have a error superior at last_update
										vue.errors.push(new Date()); //Add to array pf timestamps error
										vue.addBand('#FFB6B8',vue.errors[vue.errors.length-2],vue.errors[vue.errors.length-1])
									}
								}
								this.tick_timer = window.setTimeout(this.tick,this.config.graph.tick*1000)
				},
				chart : function(id,data){
					if(typeof this.charts[id] === "undefined"){
						this.charts[id] = Highcharts.chart(id,data);
						if(data.options){
							if(data.options.label){ //{text : "" , width: '80px', style : { 'stroke': 'silver', 'stroke-width': 1,	'r': 5,'padding': 10	} , position : { align: 'right', x: 0, // offset verticalAlign: 'bottom', y: 0 // offset } }
								var label = this.charts[id].renderer.label(data.options.label.text)
									.css(data.options.label.style)
									.attr(data.options.label.attr)
									.add();
								label.align(Highcharts.extend(label.getBBox(), data.options.label.position), null, 'spacingBox');
							}
						}

					}else{
						//console.log(id,this.charts[id],this.charts[id].series[0])
						if(data.series[0].data.length === 1 && typeof data.series[0].data[0].x !== "undefined"){ //This a uniq point with x position (so spline point)
							var point = [data.series[0].data[0].x,data.series[0].data[0].y];
							this.charts[id].series[0].addPoint(point, true, this.charts[id].series[0].data.length>this.config.graph.nb_point); //Over NB point to display points we shift oldest
							//TODO If this.config.graph.nb_point is decrease in DB config we should remove some point.
						}else{
							this.charts[id].series[0].setData(data.series[0].data)
						}
					}
				},
				updateCharts : function(){
					var vue = this;
					var stats = vue.stats
					 //TODO better detect change in stats to determine wich graph to update. (Maybe through a cach obj)
					var specificGaugeOptions = this.generateSpecificOptionGauge("Fiches ouvertes totales",this.config.global.max_open, {
							name: 'Ouvertes',
							data: [stats.fiche.open],
							tooltip: {
									valueSuffix: ' fiche(s)'
							}
					}, "Total fiche - fermée(s) incluse(s): "+(stats.fiche.total-stats.fiche.deleted));
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
							var	open = 0; //Set to zero by default
						 	var	total = 0; //Set to zero by default
						 	var	deleted = 0; //Set to zero by default
							var	affection = {}; //Set to empty by default
							if(typeof stats.owner[id] !== "undefined"){
									open = stats.owner[id].open;
									total = stats.owner[id].total;
									deleted = stats.owner[id].deleted;
									affection = stats.owner[id].affection;
							}//TODO use a base config and extend

								var specificGaugeOptions = vue.generateSpecificOptionGauge(id,params.max, {
									name: 'Ouvertes par '+id,
									data: [open],
									tooltip: {
										valueSuffix: ' fiche(s)'
									}
								},"T : "+(total-deleted));
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
				generateSpecificOptionGauge : function(title,max,serie,label){
					return {
						title: {
							text: title
						},
						options : {
							label : {
								text : ""+label,
								style : {
									width: label.startsWith("Total")?'220px':'80px'
								},
								attr : { 'stroke': 'silver', 'stroke-width': 1,	'r': 5,'padding': 5	}, //{ 'stroke': 'silver', 'stroke-width': 1,	'r': 5,'padding': 10	}
								position : {
									align: 'right', x: 0, // offset
									verticalAlign: 'bottom', y: 5 // offset
								}
							}
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
						}
				},
				forceUpdt : function(){
					this.getStats();
				},
				addToOwnerToShow : function(event){
					var vue = this;
					var user = $(event.target).text();
					var ownerToShow = $.extend({},this.config.ownerToShow);

					if (this.config.ownerToShow[user]){
						delete ownerToShow[user]
					} else {
						ownerToShow[user] = {max:parseInt(prompt("Max on gauge graph ?", "5"))};
						//this.config.ownerToShow.$add(user, {max:5});
					}
					this.$set("config.ownerToShow", ownerToShow);

					//this.charts = {}; //Reset //Too desctructive
					$.each(vue.charts, function (index, config) { //only reset owner grpah
						if(index.startsWith("container-owner-")||index.startsWith("container-affections-")||index.startsWith("container-historic-")){
							//We are in a owner index;
							var owner = index.split("-")[2];
							if(typeof ownerToShow[owner] === "undefined"){ //not present anymore
								delete vue.charts[index]; //remove graph
							}
							//delete vue.charts[index]; //Remove all owner graph
						}
					})
					this.getStats();
				},
				saveConfig : function(){
					var vue =	this;
					this.db.fiches.get('_design/sofia-config').then(function (doc) {
						doc.config = {
							global : vue.config.global,
							ownerToShow : vue.config.ownerToShow
						}
						return vue.db.fiches.put(doc).then(function(doc){
							//window.location.reload(); //TODO reload grpah dinamicly OR REST local graph
							//vue.charts = {};
							delete vue.charts['container-open']; //Only this one need to be reset
							//this.getStats();// Normally call by onchange also but in case (sinc func is debounce)
							//No need to do anyrhing this should trigger oncange and this.getConfig().then(this.getStats);
						});
					}).catch(function (err) {
						console.log(err);
					});
				},
				reloadConfig : function(){
					return this.getConfig().then(this.getStats);
				},
				getConfig : function(){
					var vue =	this;
					return this.db.fiches.get('_design/sofia-config').then(function (doc) {
						// handle result
						console.log("Get config",doc.config,doc.users)
						if(typeof doc.users !== "undefined"){
							vue.$set("users", doc.users);
						}
						if(typeof doc.config !== "undefined"){ //TODO checkup config format
							console.log(JSON.stringify(vue.config.global) !== JSON.stringify(doc.config.global),JSON.stringify(vue.config.global),JSON.stringify(doc.config.global))
							if(JSON.stringify(vue.config.global) !== JSON.stringify(doc.config.global)){ //We have update we reset
								delete vue.charts['container-open'];
								//delete vue.charts['container-affection']; //Don't depend on global (yet)
								//delete vue.charts['container-historic']; //Don't depend on global (yet)
							}

							console.log(JSON.stringify(vue.config.ownerToShow) !== JSON.stringify(doc.config.ownerToShow),JSON.stringify(vue.config.ownerToShow),JSON.stringify(doc.config.ownerToShow))
							if(JSON.stringify(vue.config.ownerToShow) !== JSON.stringify(doc.config.ownerToShow)){ //We have update we reset
						$.each(vue.charts, function (index, config) { //only reset owner grpah
							if(index.startsWith("container-owner-")||index.startsWith("container-affections-")||index.startsWith("container-historic-")){
								//We are in a owner index;
								delete vue.charts[index]; //Remove all owner graph
							}
						})
							}
							vue.$set("config", $.extend({},vue.config,doc.config)); //Apply config
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
						vue.tick(); //updateCharts() and clear timer of graphing constant point
					}); //TODO catch errors
				}, 750),
				parseChange : function(change){
					var vue = this;
					var logs = $("#global-log");
					if(change.id && change.id === "_design/sofia-config"){
						vue.getConfig().then(vue.getStats);
						logs.prepend(
							'<div class="log">'+
							      '<a class="log-img" href="#non">'+
							        '<img src="assets/img/config.svg" alt="config" width="50" height="50">'+
							      '</a>'+
							      '<div class="log-body">'+
							       '<div class="text">'+
							          '<p>Configuration mise à jour.</p>'+
							        '</div>'+
							        '<p class="attribution">by a admin the '+Date().toLocaleString()+'</p>'+
							      '</div>'+
							'</div>'
						);
					}else if(typeof change === "string" && change === "monitor-started"){
						logs.prepend(
								'<div class="log">'+
								      '<a class="log-img" href="#non">'+
								        '<img src="assets/img/info.svg" alt="information" width="50" height="50">'+
								      '</a>'+
								      '<div class="log-body">'+
								       '<div class="text">'+
								          '<p>Réinitialisation de la synchronisation avec la DB</p>'+
								        '</div>'+
								        '<p class="attribution"> the '+Date().toLocaleString()+'</p>'+
								      '</div>'+
								'</div>'
						);
						vue.getStats();
					} else {
						//$.each(change.changes, function( index, doc ) {
						vue.getStats();
						var event = change.doc.events[change.doc.events.length-1];
						logs.prepend(
								'<div class="log">'+
								      '<a class="log-img" href="#non">'+
								        '<img src="assets/img/doc-edit.svg" alt="doc-edit" width="50" height="50">'+
								      '</a>'+
								      '<div class="log-body">'+
								       '<div class="text">'+
								          '<p>'+JSON.stringify(event)+'</p>'+
								        '</div>'+
								      '</div>'+
								'</div>'
						);
						/*
						var event = change.doc.events[change.doc.events-1];
						logs.prepend(
								'<div class="log">'+
								      '<a class="log-img" href="#non">'+
								        '<img src="assets/img/doc-edit.svg" alt="doc-edit" width="50" height="50">'+
								      '</a>'+
								      '<div class="log-body">'+
								       '<div class="text">'+
								          '<p>'+event.message+'</p>'+
								        '</div>'+
								        '<p class="attribution">by <a href="#non">'+event.user+'</a> the '+(new Date(parseInt(event.timestamp))).toLocaleString()+'</p>'+
								      '</div>'+
								'</div>' //TODO use event.action to show different img
						);
						*/
						//});
					}
				}
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
						var vue = this;
						if( typeof change === "object" &&  typeof change.changes  === "undefined" && typeof change.status === "number"){ //This is a error (obj and no change + status)
							//TODO filter know erros
							console.log("error detected",change)
							vue.errors = vue.errors.slice(-5) //only keep last 5 value
							if(vue.errors.length === 0 || vue.errors[vue.errors.length-1] < vue.last_update){
								vue.errors.push(new Date()); //Add to array pf timestamps error
								vue.addBand('#EEE',vue.last_update,vue.errors[vue.errors.length-1],{
											text: 'Possible time with missed update',
											style: {
													color: '#999'
											},
											y: 30
								});
							}else{
								vue.errors.push(new Date()); //Add to array pf timestamps error
								vue.addBand('#FFB6B8',vue.errors[vue.errors.length-2],vue.errors[vue.errors.length-1]);
							}

						}else{
							console.log("updt detected",change)
							this.parseChange(change);
						}
				}
			}
	 };
})
