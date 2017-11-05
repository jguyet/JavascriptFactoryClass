
var test = {};

(function() {
    'use strict';

	//#########################################################
	//NEW CLASS
	//#########################################################
    test.Classtestparent = function() {
		console.log("construct CLASSTESTPARENT");
		this.___contructor();
    };
	Factory.newClass(test.Classtestparent);
	
	
	//#########################################################
	//ADD GETTER AND SETTER
	//#########################################################
	Factory.addGetterSetter(test.Classtestparent, 'name1', "rien1");
	
	//#########################################################
	//ADD METHODS
	//#########################################################
    Factory.addMethods(test.Classtestparent, {
        ___contructor: function() {
			this.name = "rien";
        },
		___destructor: function() {
			console.log("DESTROY CLASSTESTParent");
		}
    });

})();

(function() {
    'use strict';

	//#########################################################
	//NEW CLASS
	//#########################################################
    test.Classtest = function() {
		test.Classtestparent.call(this);
		console.log("construct CLASSTEST");
		this.___contructor();
    };
	Factory.newClass(test.Classtest);
	
	
	//#########################################################
	//ADD GETTER AND SETTER
	//#########################################################
	Factory.addGetterSetter(test.Classtest, 'name2', "rien");
	Factory.addComponentsGetterSetter(test.Classtest, 'scale', ['x', 'y'], {x: 0, y:0});
	
	
	Factory.extend(test.Classtest, test.Classtestparent);
	
	//#########################################################
	//ADD METHODS
	//#########################################################
    Factory.addMethods(test.Classtest, {
        ___contructor: function() {
			this.name = "rien";
        },
		___destructor: function() {
			console.log("DESTROY CLASSTEST");
		}
    });
	
	

})();