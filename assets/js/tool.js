define([], function() {
  return {
    getRandomPass: function(event){
      return Math.random().toString(36).substr(2, 5)
    },
    debounce: function(func, wait, immediate){
    	var timeout;
    	return function() {
    		var context = this, args = arguments;
    		var later = function() {
    			timeout = null;
    			if (!immediate) func.apply(context, args);
    		};
    		var callNow = immediate && !timeout;
    		clearTimeout(timeout);
    		timeout = setTimeout(later, wait);
    		if (callNow) func.apply(context, args);
    	};
    }
  }
});
