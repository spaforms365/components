// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!./forminfo.html'], function( htmlString) {
	function componentFormInfo( params) { 
		var self = this;
		self.form = ko.observable();
		self.params = params;

		self.formID = ko.pureComputed( function() {
			if( self.form()) {
				return self.form().mwp_FormID();
			}
			return "";
		});
		self.formType = ko.pureComputed( function() {
			if( self.form()) {
				return self.form().mwp_FormType();
			}
			return "";
		});
		self.formState = ko.pureComputed( function() {
			if( self.form()) {
				return self.form().mwp_FormState();
			}
			return "";
		});
		self.moderationState = ko.pureComputed( function() {
			if( self.form()) {
				return self.form()._formModerationStatus();
			}
			return "";
		});
		self.moderationComments = ko.pureComputed( function() {
			if( self.form()) {
				return self.form()._formModerationComments();
			}
			return "";
		});
		self.moderationMode = ko.pureComputed( function() {
			if( self.form()) {
				return self.form()._formModerationMode();
			}
			return "";
		});
		self.uniqueIDMethod = ko.pureComputed( function() {
			if( self.form()) {
				return self.form()._formUniqueIDMethod();
			}
			return "";
		});
		self.Init = function(params) {
		};
		//alert(self.form._formColumnValues['mwp_FormType']());
		//self.formtype = self.form._formColumnValues['mwp_FormType'];
	}
    // Use prototype to declare any public methods
    //componentButtons.prototype.doSomething = function() { ... };
	ko.bindingHandlers.initFI = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			viewModel.form(bindingContext.$root);
			viewModel.Init(self.params);
		}
	};  
    // Return component definition
    return { viewModel: componentFormInfo, template: htmlString };
});

