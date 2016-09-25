// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!observable2.html'], function( htmlString) {
	function observable2( params) { 
		var self = this;
		//self.form = ko.observable();//params.form;		
		self.params = params;	
		self.internalName = params.InternalName;
		
		//VALUE
		self.value = ko.observable();
		self.columnInternalName = ko.observable();
		
		self.Init = function(params) {
			try {
				self.columnInternalName(params.InternalName);
				/** 
				 * VALUE ON MODEL
				 */
				if( self.$model[self.internalName] == undefined) {
					self.$model[self.internalName] = ko.observable();
				}
				self.value = self.$model[self.internalName];
				self.value((self.$form.__formDataResults == undefined) ? "" : self.$form.__formDataResults[self.internalName]);
				
				// VALUE REFERENCE ON FORM
				self.$form._formColumnValues[self.internalName] = self.value;
				//FORM COLLECTION
				self.$form._formColumns[self.internalName] = self;								
			}
			catch (e) {
				alert( e);
			}
		};
	}
    // Use prototype to declare any public methods
    //componentButtons.prototype.doSomething = function() { ... };
	observable2.prototype.schema = {
		"Params": {
			"InternalName": ""
		},
		"Connections" : {
			"ListItem" : ['Any','Text','Choice','Note','Boolean','DateTime','Computed']
		}

	};
	
	
	ko.bindingHandlers.initobservable2 = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			//viewModel.form(bindingContext.$root);
			viewModel.$model = bindingContext.$parent;
			viewModel.Init(viewModel.params);
		}
	}; 
 
    // Return component definition
    return { viewModel: observable2, template: htmlString };
});

