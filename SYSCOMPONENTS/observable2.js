// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!observable2.html'], function( htmlString) {
	function observable2( params) { 
		
		this.internalName = (params) ? params.InternalName : '';
		this.designmode = ko.observable().extend({form: "designmode"});
		/**
		 * VALUE	
		 * observable bound to UI html template to show sharepoint column's 'Value' 
		 */
		ko.observable().extend({ listItem: this.internalName });
		
	}
	/**
	 * OPTIONAL COMPONENT METADATA DECLARATIONS ENABLING VISUAL DESIGN MODE SUPPORT
	 */
	observable2.prototype.schema = {
		"Params": {
			"InternalName": ""
		},
		"Permalink": "https://spaforms365.com/docs/syslib-observable2/",
		"Connections" : {
			"ListItem" : ['Any','Text','Choice','Note','Boolean','DateTime','Computed']
		}

	};
	
    // Return component definition
    return { viewModel: observable2, template: htmlString };
});

