// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define([ 'text!./layout.html'], function( htmlString) {
	/**
	 * COMPONENT MODEL CONSTRUCTOR
	 */
	function layout(params) {
	}
	
	/**
	 * COMPONENT MODEL METHODS
	 */
	(function(){
	}).call(layout.prototype);
	
    // Return component definition
	return { viewModel: layout, template: htmlString };
});
