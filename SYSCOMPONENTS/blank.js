// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!blank.html'], function( htmlString) {

	/**
	 * COMPONENT MODEL CONSTRUCTOR
	 */
	function blank( params) { 
//debugger;		
		this.designmode = ko.observable().extend({form: "designmode"});				
	}
	
	/**
	 * COMPONENT MODEL METHODS
	 */
	(function(){
		//called by $init binding handler on html template
		this.$init = function(element) {
		};
	}).call(blank.prototype);
	
	/**
	 * OPTIONAL COMPONENT METADATA ENABLING VISUAL DESIGN SUPPORT
	 */
	blank.prototype.schema = {
		"Params": {
		},
		"Permalink": "https://spaforms365.com/docs/syslib-blank/"
	};
	 
    // Return component definition
    return { viewModel: blank, template: htmlString };
});

