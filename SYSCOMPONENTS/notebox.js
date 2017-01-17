// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!notebox.html'], function( htmlString) {
	function notebox( params) { 
		var self = this;
		
		this.internalName = (params) ? params.InternalName : '';
		this.readonly = ko.observable().extend({form: "readonly"});
		this.designmode = ko.observable().extend({form: "designmode"});
				
		/**
		 * TITLE
		 * observable bound to component's html UI template to show Sharepoint column's 'Title'
		 * Title value passed via params of component's html notation on calling form's (viewmodel) html template
		 * Title parameter additionally declared at component's metadata (schema), enabling dynamic param's value update on 
		 * form's (viewmodel) html temlate from Sharepoint source on design mode.
		 */
		this.title = ko.observable((params) ? params.Title : '');
		/**
		 * DESCRIPTION	
		 * observable bound to UI html template to show sharepoint column's 'Description' 
		 * Description value passed via params of component's html notation on calling form's (viewmodel) html template
		 * Description parameter additionally declared at component's metadata (schema), enabling dynamic param's value update on 
		 * form's (viewmodel) html temlate from Sharepoint source on design mode.
		 */
		this.description = ko.observable((params) ? params.Description : '');
		/**
		 * VALUE	
		 * observable bound to UI html template to show sharepoint column's 'Value' 
		 */
		this.value = ko.observable().extend({ listItem: this.internalName });
		// -- ENABLE VALUE EDIT MODE
		// observable bound to UI html template to enable sharepoint column's 'Value'editing
		this.enableValue = ko.pureComputed( function() { return this.$enabled(); }, this);

	}
	/**
	 * COMPONENT MODEL HELPER METHODS
	 */
	(function(){
		this.$enabled = function() {
			return (this.readonly()) ? false : true;
		};		
	}).call(notebox.prototype);
    // Use prototype to declare any public methods
    //componentButtons.prototype.doSomething = function() { ... };
	notebox.prototype.schema = {
		"Params": {
			"InternalName": "",
			"Title": "",
			"FieldTypeKind": 0,
			"Description": ""
		},
		"Connections" : {
			"ListItem" : ['Note']
		}
	};
	
/*	
	ko.bindingHandlers.initnotebox = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			viewModel.form(bindingContext.$root);
			viewModel.model = bindingContext.$parent;
			viewModel.Init(viewModel.params);
		}
	};
*/	
 
    // Return component definition
    return { viewModel: notebox, template: htmlString };
});

