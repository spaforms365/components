// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!checkbox.html'], function( htmlString) {
	/**
	 * COMPONENT MODEL CONSTRUCTOR
	 */
	function checkbox( params) { 
		var self = this;
		
		this.internalName = (params) ? params.InternalName : '';
		this.readonly = ko.observable().extend({form: "readonly"});
		this.designmode = ko.observable().extend({form: "designmode"});
		
		/**
		 * TITLE
		 * observable bound to component's html UI template to show Sharepoint column's 'Title'
		 * Title value passed via params of component's html notation on calling form's (viewmodel) html template
		 * Title parameter additionally declared at component's metadata (schema), enabling dynamic param's value update on 
		 * form's (viewmodel) html template from Sharepoint source on design mode.
		 */
		this.title = ko.observable((params) ? params.Title : '');
		/**
		 * DESCRIPTION	
		 * observable bound to UI html template to show sharepoint column's 'Description' 
		 * Description value passed via params of component's html notation on calling form's (viewmodel) html template
		 * Description parameter additionally declared at component's metadata (schema), enabling dynamic param's value update on 
		 * form's (viewmodel) html template from Sharepoint source on design mode.
		 */
		this.description = ko.observable((params) ? params.Description : '');
		/**
		 * REQUIRED	
		 */
		this.required = ko.observable((params) ? ((params.Required) ? params.Required : false) : false);
		/**
		 * VALUE	
		 */
		this.value = ko.observable().extend({ listItem: this.internalName });
		// -- ENABLE VALUE EDIT MODE
		// observable bound to UI html template to enable sharepoint column's 'Value'editing
		this.enabled = ko.pureComputed( function() {
			return this.$enabled();
		}, this);		
		this.enableValue = ko.pureComputed( function() { return (this.$enabled()) ? "" : "is-disabled"; }, this);
		this.enableRequired = ko.pureComputed( function() { return (this.required()) ? "is-required" : ""; }, this);
		/**
		 * FABRIC UI CHECKBOX CONTROL BINDING	
		 */
		this.value.subscribe( function( val) {
			//console.log("subscribe chkBox value = " + val);
			if( this.chkBox) { 	if( val) this.chkBox.check(); else this.chkBox.unCheck(); }
		}, this);
		this.onclick = function(data, event) {
			if( !event.currentTarget.classList.contains('is-disabled')) 
				self.value((event.currentTarget.classList.contains('is-checked')) ? true : false);
		};
	}
	/**
	 * COMPONENT MODEL HELPER METHODS
	 */
	(function(){
		this.$enabled = function() {
			return (this.readonly()) ? 'is-disabled' : '';
		};		
		this.$init = function(element) {
			var CheckBoxElements = element.querySelectorAll(".ms-CheckBox");
			for(var i = 0; i < CheckBoxElements.length; i++) {
				this.chkBox = new fabric['CheckBox'](CheckBoxElements[i]);
				if( this.value()) this.chkBox.check(); else this.chkBox.unCheck();
			}						
		};
	}).call(checkbox.prototype);
	/**
	 * OPTIONAL COMPONENT METADATA DECLARATIONS ENABLING VISUAL DESIGN MODE SUPPORT
	 */
	checkbox.prototype.schema = {
		"Params": {
			"InternalName": "",
			"Title": "",
			"DefaultValue": false,
			"Required": false,
			"FieldTypeKind": 0,
			"Description": ""
		},
		"Connections" : {
			"ListItem" : ['Boolean']
		}		
	};
	
    // Return component definition
    return { viewModel: checkbox, template: htmlString };
});

