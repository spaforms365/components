// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!checkboxgroup.html'], function( htmlString) {
	/**
	 * COMPONENT MODEL CONSTRUCTOR
	 */
	function checkboxgroup( params) { 

		this.internalName = (params) ? params.InternalName : '';
		
		//this.availablechoices = (params) ? JSON.parse('["' + params.Choices.split(',').join('","') + '"]') : [];
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
			if( !val || (val == "")) { 
				val = {};
				val.results = [];
				this.value( val);
			};
			var selectedchoices = (val) ? val.results : [];
			this.choices(this.$choices(this.availablechoices, selectedchoices));
		}, this);
	}
	/**
	 * COMPONENT MODEL HELPER METHODS
	 */
	(function(){
		this.$update = function( key, add) {
			var val = this.value();
			if( add) {
				if( val == "") { val = {}; this.value( val); }
				if( !val.results) val.results = [];
				val.results.push(key);
			}
			else {
				val.results.splice( val.results.indexOf(key), 1);
			}
			this.value(val);
		};
		this.$choices = function( choices, selectedchoices) {
			var choiceobjects = [];
			choices.forEach( function( key, index) {
				choiceobjects.push( 
				{
					'key' 	 : key, 
					'parent': this,
					'checked': ko.observable(''),
					'onclick': function(data, event) {
									if( !event.currentTarget.classList.contains('is-disabled')) {
										this.checked( (event.currentTarget.classList.contains('is-checked')) ? false : true);
										this.parent.$update( this.key, !event.currentTarget.classList.contains('is-checked'));
									}
								}
				});
			}, this);
			if( selectedchoices) {
				selectedchoices.forEach( function( key, index) {
					var results = $.grep( choiceobjects, function(choiceobject){ return choiceobject.key == key});
					if( results.length == 1) results[0].checked(true);
				}, this);
			};
			return choiceobjects;
		};
	}).call(checkboxgroup.prototype);
	/**
	 * OPTIONAL COMPONENT METADATA DECLARATIONS ENABLING VISUAL DESIGN MODE SUPPORT
	 */
	checkboxgroup.prototype.schema = {
		"Params": {
			"InternalName": "",
			"Title": "",
			"Description": "",
			"Choices": []
		},
		"Connections" : {
			"ListItem" : ['MultiChoice']
		}		
	};
    // Return component definition
    return { viewModel: checkboxgroup, template: htmlString };
});

