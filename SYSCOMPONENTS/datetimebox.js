// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
//define(['text!datetimebox.html', 'text!./../Runtime/syscomponents/datepicker.min.css','./../Runtime/syscomponents/jquery.datepicker', './../Runtime/syscomponents/pickadate'], function( htmlString, cssString) {
define(['text!datetimebox.html', 'text!./../Runtime/syscomponents/datepicker.min.css', './../Runtime/syscomponents/pickadate'], function( htmlString, cssString) {
	/**
	 * LOAD STYLESHEET FOR THIS COMPONENT CLASS
	 */
	(function(css) {
		var node = document.createElement('style');
		document.body.appendChild(node);
		node.innerHTML = css;
	}(cssString));	
	/**
	 * COMPONENT MODEL CONSTRUCTOR
	 */
	function datetimebox( params) { 
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
		 * DEFAULTVALUE	
		 */
		this.defaultvalue = ko.observable((params) ? ((params.DefaultValue) ? params.DefaultValue : "" ) : "");
		/**
		 * VALUE	
		 * observable bound to UI html template to show sharepoint column's 'Value' 
		 */
		this.value = ko.observable().extend({ listItem: this.internalName });//.extend({ required: true }).extend({ minLength: 3 });
		this.value.subscribe(function(val){
			// convert ISO string received from SharePoint field
			if( val && val.indexOf('-') > 0) {
				var now = new Date(val);
				this.fabricObject.picker.set('select', [now.getFullYear(), now.getMonth(), now.getDate()]);
			}			
		}, this);
//debugger;
		//this.value.extend({ type: 'moment' });
		/**
		 * COMPONENT VALIDATION	
		 */
		if( ko.validation) {
			this.value.extend({ required: this.required() })
					  //.extend({ dateISO: true })
					  .extend({ validationGroup: "viewmodel" });
		};
		// -- ENABLE VALUE EDIT MODE
		// observable bound to UI html template to enable sharepoint column's 'Value'editing
		this.enableValue = ko.pureComputed( function() { return this.$enabled(); }, this);
		this.enableRequired = ko.pureComputed( function() { return (this.required()) ? "is-required" : ""; }, this);		
	};
	/**
	 * COMPONENT MODEL HELPER METHODS
	 */
	(function(){
		this.$enabled = function() {
			return (this.readonly() || this.readonlyfield() ) ? false : true;
		};		
		this.$init = function(element) {
			if (typeof fabric !== "undefined") {
				if ('DatePicker' in fabric) {
				  var elements = element.querySelectorAll('.ms-DatePicker');
				  var i = elements.length;
				  var component;
				  while(i--) {
//debugger;					  
					this.fabricObject = new fabric['DatePicker'](elements[i]);
					this.fabricObject["_dropdownIcon"] = elements[i].querySelector(".ms-DatePicker-event");
					//this.fabricObject._newDropdownLabel.innerHTML = this.value();
					if( ko.validation) {
						// added line 654 in knockout.validation.js : if( element.tagName == "SELECT") return init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
						// knockout.validation.min.css overrides fabric.components.css to support dropdown validation
						//var validationMessageElement = ko.validation.insertValidationMessage(this.fabricObject._newDropdownLabel);
						//additional span for validation message
						//ko.applyBindingsToNode(validationMessageElement, { validationMessage: this.value  });
						//enable red border on validation errors
						//ko.applyBindingsToNode(this.fabricObject._newDropdownLabel, { validationElement: this.value });
						//fix icon offset on validation error message display
						ko.applyBindingsToNode(this.fabricObject._dropdownIcon, { validationElement: this.value });
					}
				  }
				}
			};			
		};
	}).call(datetimebox.prototype);
	/**
	 * COMPONENT METADATA DECLARATIONS ENABLING VISUAL DESIGN MODE SUPPORT
	 * parameter names matching SharePoint field metadata used for dynamic component params linking 
	 */
	datetimebox.prototype.schema = {
		"Params": {
			"InternalName": "",
			"Title": "",
			"Description": "",
			"DefaultValue": "",
			"ReadOnlyField": false,
			"DisplayFormat": false,
			"FriendlyDisplayFormat": false,
			"FieldTypeKind": 0,
			"Required": false
		},
		"Connections" : {
			"ListItem" : ['DateTime']
		}
	};
    // Return component definition
    return { viewModel: datetimebox, template: htmlString };
});

