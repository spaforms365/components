// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!textbox.html'], function( htmlString) {

	/**
	 * COMPONENT MODEL CONSTRUCTOR
	 */
	function textbox( params) { 
//debugger;		
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
					  .extend({ validationGroup: {name: "viewmodel", viewmodel: this.parent()} });
//					  .extend({ validationGroup: "viewmodel" });
		};
		// -- ENABLE VALUE EDIT MODE
		// observable bound to UI html template to enable sharepoint column's 'Value'editing
		this.enableValue = ko.pureComputed( function() { return this.$enabled(); }, this);
		this.enableDescription = ko.pureComputed( function() { return (this.runtime()._formReady() && !this.value.isValid() && this.value().length === 0 ) ? 'block' : 'none'; }, this);
		this.enableRequired = ko.pureComputed( function() { return (this.required()) ? "is-required" : ""; }, this);
		
	};
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
			"FieldTypeKind": 0,
			"ReadOnlyField": false,
			"Required": false
		},
		"Connections" : {
			"ListItem" : ['Text']
		},
		"Permalink": "https://spaforms365.com/docs/syslib-textbox/"
	};
	textbox.prototype.schema2 = {
		"Params": {
			"InternalName": { defaultvalue: '',
							  component: 'textbox',
							  params: {
								"InternalName": "InternalName",
								"Title": "InternalName",
//								"Description": "",
								"MaxLength": 100,
								"DefaultValue": "",
//								"FieldTypeKind": 0,
//								"ReadOnlyField": false,
								"Required": true
							  }
			},
			"Title": { 		  defaultvalue: '',
							  component: 'textbox',
							  params: {
								"InternalName": "Title",
								"Title": "Title",
								"MaxLength": 20,
								"DefaultValue": ""
							  }
			},
			"Description": {  defaultvalue: '',
							  component: 'textbox',
							  params: {
								"InternalName": "Description",
								"Title": "Description",
								"MaxLength": 100,
								"DefaultValue": ""
							  }
			},
			"MaxLength": {    defaultvalue: 100,
							  component: 'numberbox',
							  params: {
								"InternalName": "MaxLength",
								"Title": "MaxLength",
								"MaximumValue": 255,
								"MinimumValue": 0,
								"DefaultValue": ""
							  }
			},
			"DefaultValue": "",
			"FieldTypeKind": 0,
			"ReadOnlyField": false,
			"Required": {     defaultvalue: false,
							  component: 'checkbox',
							  params: {
								"InternalName": "Required",
								"Title": "Required",
								"Required": false
							  }
			}
		},
		"Connections" : {
			"ListItem" : ['Text']
		}
	};
	 
    // Return component definition
    return { viewModel: textbox, template: htmlString };
});

