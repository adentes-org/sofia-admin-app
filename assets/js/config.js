define([], function() {
  return {
  	global : {
  		max_open : 10 //Default confg
  	},
  	ownerToShow : {}, //Default config,
  	graph : {
  		tick : 10, //Time in seconds between point (without event)
  		timeout : 3*60, //Time in seconds between forced updated (if over trigger update from db) //More a fail safe than a utility
  		nb_point : 60*6, //Nb point to graph nb_point*tick willl give you a rough estimation of global time of graph (force update or will shorter time between 2 points) Ex 60*10*6 = 60 minutes = 1hour
  	},
  	affectionColor : {
          "undefined" : "#B09F91",
          "unconscious" : "#f15c80",
          "cardio-respiratory-stop" : "#f45b5b",
          "little-care" : "#90ed7d",
          "bleeding" : "#f7a35c",
          "difficulty-breathing" : "#8085e9",
          "malaise" : "#999",
          "trauma" : "#e4d354",
          "medical-consultation" : "#2b908f"
    },
  	affectionText :  {
  		  "undefined" : "Non définit",
        "unconscious" : "Inconscient",
        "cardio-respiratory-stop" : "Arret Cardio Respiratoire",
        "little-care" : "Petit soin",
        "bleeding" : "Hémorragie",
        "difficulty-breathing" : "Difficulté respiratoire",
        "malaise" : "Malaise",
        "trauma" : "Traumatologie",
        "medical-consultation" : "Consultation médicale",
     }
  }
});
