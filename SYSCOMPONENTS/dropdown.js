// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!dropdown.html'], function( htmlString) {
	/**
	 * COMPONENT MODEL CONSTRUCTOR
	 */
	function dropdown( params) { 

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
		 * VALUE	
		 */
		this.value = this.$column(this.internalName);
		/**
		 * FABRIC UI CHECKBOX CONTROL BINDING	
		 */
		this.value.subscribe( function( val) {
			this.choices(this.$choices(this.availablechoices, val));
		}, this);
	}
	/**
	 * COMPONENT MODEL HELPER METHODS
	 */
	(function(){
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
	}).call(dropdown.prototype);
	/**
	 * OPTIONAL COMPONENT METADATA DECLARATIONS ENABLING VISUAL DESIGN MODE SUPPORT
	 */
	dropdown.prototype.schema = {
		"Params": {
			"InternalName": "",
			"Title": "",
			"Description": "",
			"Choices": []
		},
		"Connections" : {
			"ListItem" : ['Choice']
		}		
	};
    // Return component definition
    return { viewModel: dropdown, template: htmlString };
});

