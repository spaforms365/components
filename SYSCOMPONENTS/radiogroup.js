// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!radiogroup.html'], function( htmlString) {
	/**
	 * COMPONENT MODEL CONSTRUCTOR
	 */
	function radiogroup( params) { 

		this.readonly = ko.observable().extend({form: "readonly"});
		this.designmode = ko.observable().extend({form: "designmode"});


		this.internalName = (params) ? params.InternalName : '';
		
		this.availablechoices = (params) ? params.Choices : [];
		
		this.choices = ko.observableArray(this.$choices(this.availablechoices));
		
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
		 * READONLYFIELD	
		 */
		this.readonlyfield = ko.observable((params) ? ((params.ReadOnlyField) ? params.ReadOnlyField : false ): false);
		/**
		 * DEFAULTVALUE	
		 */
		this.defaultvalue = ko.observable((params) ? ((params.DefaultValue) ? params.DefaultValue : "" ) : "");
		/**
		 * DEFAULTMESSAGE
		 */
		this.defaultmessage = ko.observable((params) ? ((params.DefaultMessage) ? params.DefaultMessage : "" ) : "");
		/**
		 * VALUE	
		 */
		this.value = ko.observable(this.defaultvalue()).extend({ listItem: this.internalName });
		/**
		 * COMPONENT VALIDATION	
		 */
		if( ko.validation) {
			this.value.extend({ required: this.required() })
					  .extend({ validationGroup: "viewmodel" });
		};
		/**
		 * FABRIC UI CHECKBOX CONTROL BINDING	
		 */
		this.value.subscribe( function( val) {
			this.choices(this.$choices(this.availablechoices, val));
		}, this);
		// -- ENABLE VALUE EDIT MODE
		// observable bound to UI html template to enable sharepoint column's 'Value'editing
		this.enableValue = ko.pureComputed( function() { return (this.$enabled()) ? "" : "is-disabled"; }, this);
		this.enableRequired = ko.pureComputed( function() { return (this.required()) ? "is-required" : ""; }, this);	
		// set default value
		if(this.defaultvalue()) this.choices(this.$choices(this.availablechoices, this.value()));
	}
	/**
	 * COMPONENT MODEL HELPER METHODS
	 */
	(function(){
		this.$enabled = function() {
			return (this.readonly() || this.readonlyfield() ) ? false : true;
		};		
		this.$init = function(element) {
			var elms = element.querySelectorAll(".validationBox");
			for(var i = 0; i < elms.length; i++) {
				this.fabricObject = {};
				this.fabricObject['validationBox'] = elms[i];
				if( ko.validation) {
					// knockout.validation.min.css overrides fabric.components.css to support dropdown validation
					var validationMessageElement = ko.validation.insertValidationMessage(this.fabricObject.validationBox);
					//additional span for validation message
					ko.applyBindingsToNode(validationMessageElement, { validationMessage: this.value  });
					//enable red border on validation errors
					ko.applyBindingsToNode(this.fabricObject.validationBox, { validationElement: this.value });
				}
			}						
		};
		this.$select = function( selectedchoice) {
			this.choices().forEach( function( choice, index) {
				choice.checked( (choice.key == selectedchoice) ? true : false);
			});
			this.value( selectedchoice);
		};
		this.$choices = function( choices, selectedchoice) {
			var choiceobjects = [];
			choices.forEach( function( key, index) {
				choiceobjects.push( 
				{
					'key' 	 : key, 
					'parent': this,
					'checked': ko.observable(''),
					'onclick': function(data, event) {
									if( !event.currentTarget.classList.contains('is-disabled')) {
										if(event.currentTarget.classList.contains('is-checked') == false) this.parent.$select( this.key);
									}
								}
				});
			}, this);
			if( selectedchoice) {
				var results = $.grep( choiceobjects, function(choiceobject){ return choiceobject.key == selectedchoice});
				if( results.length == 1) results[0].checked(true);
			}
			return choiceobjects;
		};
	}).call(radiogroup.prototype);
	/**
	 * OPTIONAL COMPONENT METADATA DECLARATIONS ENABLING VISUAL DESIGN MODE SUPPORT
	 */
	radiogroup.prototype.schema = {
		"Params": {
			"InternalName": "",
			"Title": "",
			"Description": "",
			"Required": false,
			"FieldTypeKind": 0,
			"DefaultValue": "",
			"Choices": []
		},
		"Permalink": "https://spaforms365.com/docs/syslib-radiogroup/",
		"Connections" : {
			"ListItem" : ['Choice']
		}		
	};
    // Return component definition
    return { viewModel: radiogroup, template: htmlString };
});

