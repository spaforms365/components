// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!datetime.html'], function( htmlString) {
	function datetime( params) { 
		var self = this;
		self.form = ko.observable();
		//self.model = ko.observable();
		self.params = params;

		//self.form._formColumns.push(self);	
		self.InternalName = params.InternalName;
		
		//VALUE
		self.value = ko.observable();
		//LABEL
		self.Title = ko.observable();
		//DESCRIPTION
		self.Description = ko.observable();
		
		// 
		self.Init = function(params) {
			try {
				/** 
				 * VALUE ON MODEL
				 */
				if( self.model[self.InternalName] == undefined) {
					self.model[self.InternalName] = ko.observable();
				}
				self.value = self.model[self.InternalName];
				self.value((self.form().__formDataResults == undefined) ? "" : self.form().__formDataResults[self.InternalName]);
				
				// VALUE REFERENCE ON FORM
				self.form()._formColumnValues[self.InternalName] = self.value;
				//FORM COLLECTION
				self.form()._formColumns[self.InternalName] = self;
				
				if( params.Title != undefined) self.Title( params.Title);
				if( params.Description != undefined) self.Description( params.Description);
				
			}
			catch (e) {
				alert( e);
			}
		};
		self.enabled = ko.pureComputed( function() {
			if( self.form()) {
				var b2 = true;// ((self.form().mwp_FormState() == self.form()._formStates.DRAFT));
				var b = b2 && (self.form()._formReadOnly() == false);
				return (b.toString().toLowerCase() == 'true') ? true : false;
			}
			return false;
		});
	}
    // Use prototype to declare any public methods
    //componentButtons.prototype.doSomething = function() { ... };
	datetime.prototype.schema = {
		"Params": {
			"InternalName": "",
			"Title": "",
			"Description": ""
		},
		"Connections" : {
			"ListItem" : ['DateTime']
		}
	};
	
	
	ko.bindingHandlers.initdatetime = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			viewModel.form(bindingContext.$root);
			viewModel.model = bindingContext.$parent;
			viewModel.Init(viewModel.params);
		}
	}; 
 
    // Return component definition
    return { viewModel: datetime, template: htmlString };
});

