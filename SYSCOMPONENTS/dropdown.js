// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!dropdown.html'], function( htmlString) {
	/**
	 * COMPONENT MODEL CONSTRUCTOR
	 */
	function dropdown( params) { 	

		this.readonly = ko.observable().extend({form: "readonly"});
		this.designmode = ko.observable().extend({form: "designmode"});

		this.internalName = (params) ? params.InternalName : '';
		
		this.availablechoices = (params) ? params.Choices : [];
		
		/**
		 * TITLE
		 * observable bound to component's html UI template to show Sharepoint column's 'Title'
		 * Title value passed via params of component's html notation on calling form's (viewmodel) html template
		 * Title parameter additionally declared at component's metadata (schema), enabling dynamic param's value update on 
		 * form's (viewmodel) html template from Sharepoint source on design mode.
		 */
		this.title = ko.observable((params) ? params.Title : '');
		/**
		 * CHOICES
		 * observable bound to component's html UI template to bouid list of choices
		 * Choices value passed via params of component's html notation on calling form's (viewmodel) html template
		 * Choices parameter additionally declared at component's metadata (schema), enabling dynamic param's value update on 
		 * form's (viewmodel) html template from Sharepoint source on design mode.
		 */
		this.choices = ko.observableArray(this.availablechoices);
		/**
		 * DESCRIPTION	
		 * observable bound to UI html template to show sharepoint column's 'Description' 
		 * Description value passed via params of component's html notation on calling form's (viewmodel) html template
		 * Description parameter additionally declared at component's metadata (schema), enabling dynamic param's value update on 
		 * form's (viewmodel) html template from Sharepoint source on design mode.
		 */
		this.description = ko.observable((params && params.Description && params.Description.length > 0) ? params.Description : 'Select...');
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
		 */
		this.value = ko.observable(this.defaultvalue()).extend({ listItem: this.internalName });
		/**
		 * COMPONENT VALIDATION	
		 */
		if( ko.validation) {
			this.value.extend({ required: this.required() })
					  .extend({ validationGroup: "viewmodel" });
		};
		// -- ENABLE VALUE EDIT MODE
		// observable bound to UI html template to enable sharepoint column's 'Value'editing
		this.enableValue = ko.pureComputed( function() { return (this.$enabled()) ? "" : "is-disabled"; }, this);
		this.enableRequired = ko.pureComputed( function() { return (this.required()) ? "is-required" : ""; }, this);
	}
	/**
	 * FABRIC UI DROPDOWN COMPONENT OVERRIDES AND EXTENSIONS
	 */
	 
	fabric.Dropdown.prototype._checkTruncation = function () {
		var origText = this._newDropdownLabel.getAttribute("fulltitle");
		this._dropdownLabelHelper.textContent = origText;
		if (this._dropdownLabelHelper.offsetHeight > this._newDropdownLabel.offsetHeight) {
			var i = 0;
			var ellipsis = "...";
			var newText = void 0;
			do {
				i--;
				newText = origText.slice(0, i);
				this._dropdownLabelHelper.textContent = newText + ellipsis;
			} while (this._dropdownLabelHelper.offsetHeight > this._newDropdownLabel.offsetHeight);
		}
		this._newDropdownLabel.textContent = this._dropdownLabelHelper.textContent;
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
			var self = this;
			
			setTimeout( function() {
				var elm = element.querySelector(".ms-Dropdown");
				self.fabricObject = new fabric['Dropdown'](elm);
				self.fabricObject["_dropdownIcon"] = self.fabricObject._container.querySelector(".ms-Dropdown-caretDown");
				// enterkey handler (enter to tab) keypress support
				//this.fabricObject._newDropdownLabel.classList.add("formfield");
				// selected value on dropdown
				self.fabricObject._newDropdownLabel.innerHTML = (self.value()) ? self.value() : "";
				self.fabricObject._container.setAttribute("fulltitle", (self.value()) ? self.value() : self.description());
				self.fabricObject._checkTruncation();
				
				self.fabricObject._originalDropdown.addEventListener('change', function(e) {
					var index = 0;
					for (var i = 0; i < self.fabricObject._dropdownItems.length; ++i) {
						if( self.fabricObject._dropdownItems[i].oldOption.selected) index = i; 
					}
					self.value((index == 0) ? undefined : self.choices()[index-1]);
					self.fabricObject._container.setAttribute("fulltitle", (self.value()) ? self.value() : self.description());
					self.fabricObject._checkTruncation();
				}, false);
				if( ko.validation) {
					// added line 654 in knockout.validation.js : if( element.tagName == "SELECT") return init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
					// knockout.validation.min.css overrides fabric.components.css to support dropdown validation
					var validationMessageElement = ko.validation.insertValidationMessage(self.fabricObject._newDropdownLabel);
					//additional span for validation message
					ko.applyBindingsToNode(validationMessageElement, { validationMessage: self.value  });
					//enable red border on validation errors
					ko.applyBindingsToNode(self.fabricObject._newDropdownLabel, { validationElement: self.value });
					//fix icon offset on validation error message display
					ko.applyBindingsToNode(self.fabricObject._dropdownIcon, { validationElement: self.value });
				}
			}, 300); // 100 insufficient			
		};
	}).call(dropdown.prototype);
	/**
	 * OPTIONAL COMPONENT METADATA DECLARATIONS ENABLING VISUAL DESIGN MODE SUPPORT
	 */
	dropdown.prototype.schema = {
		"Params": {
			"InternalName": "",
			"Title": "",
			"Description": "",
			"DefaultValue": false,
			"FieldTypeKind": 0,
			"Required": false,
			"Choices": []
		},
		"Permalink": "https://spaforms365.com/docs/syslib-dropdown/",
		"Connections" : {
			"ListItem" : ['Choice']
		}		
	};
    // Return component definition
    return { viewModel: dropdown, template: htmlString };
});

