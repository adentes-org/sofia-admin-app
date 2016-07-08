define([], function() {
  return {
  	global : {
  		max_open : 10 //Default confg
  	},
  	ownerToShow : {}, //DEfault config
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
