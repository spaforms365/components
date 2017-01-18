// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!notebox.html'], function( htmlString) {
	function notebox( params) { 
		var self = this;
		
		this.internalName = (params) ? params.InternalName : '';

		this.runtime = ko.observable().extend({form: "runtime"});
		this.parent = ko.observable().extend({form: "parent"});
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
		 * REQUIRED	
		 */
		this.required = ko.observable((params) ? ((params.Required) ? params.Required : false) : false);
		/**
		 * READONLYFIELD	
		 */
		this.readonlyfield = ko.observable((params) ? ((params.ReadOnlyField) ? params.ReadOnlyField : false ): false);
		/**
		 * MAXLENGTH	
		 */
		this.maxlength = ko.observable((params) ? ((params.MaxLength) ? params.MaxLength : 10000) : 10000);
		/**
		 * DEFAULTVALUE	
		 */
		this.defaultvalue = ko.observable((params) ? ((params.DefaultValue) ? params.DefaultValue : "" ) : "");
		/**
		 * VALUE	
		 * observable bound to UI html template to show sharepoint column's 'Value' 
		 */
		this.value = ko.observable().extend({ listItem: this.internalName });
		/**
		 * COMPONENT VALIDATION	
		 */
		if( ko.validation) {
			this.value.extend({ required: this.required() })
					  .extend({ maxLength: this.maxlength() })
					  .extend({ validationGroup: {name: "viewmodel", viewmodel: this.parent()} });
//					  .extend({ validationGroup: "viewmodel" });
		};
		// -- ENABLE VALUE EDIT MODE
		// observable bound to UI html template to enable sharepoint column's 'Value'editing
		this.enableValue = ko.pureComputed( function() { return this.$enabled(); }, this);
		this.enableDescription = ko.pureComputed( function() { return (this.runtime()._formReady() && !this.value.isValid() && this.value().length === 0 ) ? 'block' : 'none'; }, this);
		this.enableRequired = ko.pureComputed( function() { return (this.required()) ? "is-required" : ""; }, this);

	}
	/**
	 * COMPONENT MODEL HELPER METHODS
	 */
	(function(){
		this.$enabled = function() {
			return (this.readonly() || this.readonlyfield() ) ? false : true;
		};
		//called by $init binding handler on html template
		this.$init = function(element) {
			var elms = element.querySelectorAll(".ms-TextField");
			for(var i = 0; i < elms.length; i++) {
				this.fabricObject = new fabric['TextField'](elms[i]);
			}						
		};
	}).call(notebox.prototype);
    // Use prototype to declare any public methods
    //componentButtons.prototype.doSomething = function() { ... };
	notebox.prototype.schema = {
		"Params": {
			"InternalName": "",
			"Title": "",
			"Description": "",
			"MaxLength": 10000,
			"DefaultValue": "",
			"FieldTypeKind": 0,
			"ReadOnlyField": false,
			"Required": false
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

