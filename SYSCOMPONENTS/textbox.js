// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!textbox.html'], function( htmlString) {

	/**
	 * COMPONENT MODEL CONSTRUCTOR
	 */
	function textbox( params) { 
		// initialise validation
		//ko.validation.init(); // <--- initialises the knockout validation object
		
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
		this.maxlength = ko.observable((params) ? ((params.MaxLength) ? params.MaxLength : 100) : 100);
		/**
		 * DEFAULTVALUE	
		 */
		this.defaultvalue = ko.observable((params) ? ((params.DefaultValue) ? params.DefaultValue : "" ) : "");
		/**
		 * VALUE	
		 * observable bound to UI html template to show sharepoint column's 'Value' 
		 */
		this.value = ko.observable().extend({ listItem: this.internalName });//.extend({ required: true }).extend({ minLength: 3 });		
		/**
		 * COMPONENT VALIDATION	
		 */
		if( ko.validation) {
			this.value.extend({ required: this.required() })
					  .extend({ maxLength: this.maxlength() })
					  .extend({ validationGroup: "viewmodel" });
		};
		// -- ENABLE VALUE EDIT MODE
		// observable bound to UI html template to enable sharepoint column's 'Value'editing
		this.enableValue = ko.pureComputed( function() { return this.$enabled(); }, this);
		
	};
	/**
	 * COMPONENT MODEL HELPER METHODS
	 */
	(function(){
		this.$enabled = function() {
			return (this.readonly() && this.readonlyfield() ) ? false : true;
		};		
	}).call(textbox.prototype);
	/**
	 * COMPONENT METADATA DECLARATIONS ENABLING VISUAL DESIGN MODE SUPPORT
	 * parameter names matching SharePoint field metadata used for dynamic component params linking 
	 */
	textbox.prototype.schema = {
		"Params": {
			"InternalName": "",
			"Title": "",
			"Description": "",
			"MaxLength": 100,
			"DefaultValue": "",
			"ReadOnlyField": false,
			"Required": false
		},
		"Connections" : {
			"ListItem" : ['Text']
		}
	};
	 
    // Return component definition
    return { viewModel: textbox, template: htmlString };
});

