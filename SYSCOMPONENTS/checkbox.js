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
		 * VALUE	
		 */
		this.value = this.$column(this.internalName);
		// -- ENABLE VALUE EDIT MODE
		// observable bound to UI html template to enable sharepoint column's 'Value'editing
		this.enabled = ko.pureComputed( function() {
			return this.$enabled();
		}, this);		
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
			return (this.$readonly()) ? 'is-disabled' : '';
		};		
		this.$init = function(element) {
//debugger;			
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
			"Description": ""
		},
		"Connections" : {
			"ListItem" : ['Boolean']
		}		
	};
	
	
	ko.bindingHandlers.initcheckbox = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			viewModel.$init( element);			
		}
	}; 
 
    // Return component definition
    return { viewModel: checkbox, template: htmlString };
});

