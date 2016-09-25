// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!./buttons.html'], function( htmlString) {
	function buttons( params) { 
		var self = this;
		self.params = params;
//debugger;	
//debugger;
		self.form = ko.observable();//params.form);
		// SETTINGS
		self.enableSaveUpdateDeleteButtonOnForms = (params.save !== undefined) ? params.save : false; //self.form()._formSettings
		self.enableCancelButtonOnSubmittedOrProcessingForms = (params.cancel !== undefined) ? params.cancel : true;
		self.enableDeleteButtonOnApprovedForms = (params.deletesubmitted != undefined) ? params.deletesubmitted : true;
		
		//self._formEditingForm = ko.observable(false);
		//self._formDesigningForm = ko.observable(false);

		
        // SUBMIT
        self._formButtonSubmitClick = function () {
            self.form().mwp_FormState(self.form()._formStates.SUBMITTED);
            self.form()._formModerationStatus(2); //SPModerationStatusType.Pending; -- will be applied only for Moderation Mode = DRAFT
            self.form()._formSave();
        };
        self._formButtonSubmitEnabled = ko.pureComputed(function () {
			if( self.form()) {
				//var b = (self.form().mwp_FormState() == self.form()._formStates.DRAFT);
				var b = (self.form()._formReadOnly() == false);
				return (b.toString().toLowerCase() == 'true') ? true : false;
			}
			return false;
        });
		/**
		 * SUBMIT FORM BUTTON
		 */
		self.enableFormsCommandSubmit = function() {
			return self._formButtonSubmitEnabled();
		};
		self.actionFormsCommandSubmit = function() {
			self.form()._closeOnButtonClick = true;
			self._formButtonSubmitClick();
		};
        // CANCEL
        self._formButtonCancelClick = function () {
			if( self.form()) {
				self.form().mwp_FormState(self.form()._formStates.CANCELLED);
				if (self.form()._formModerationStatus() == 2) //SPModerationStatusType.Pending
					self.form()._formModerationStatus(3); //SPModerationStatusType.Draft; -- will be applied only for Moderation Mode = DRAFT
				self.form()._formSave();
			}
			return false;
        };
        self._formButtonCancelEnabled = ko.computed(function () {
			if( self.form()) {
				var b = (((self.form().mwp_FormState() != self.form()._formStates.DRAFT) && (self.form().mwp_FormState() != self.form()._formStates.CANCELLED)) // cancel enabled always, except Draft or Cancelled
						//&& (self.form()._formReadOnly() == false) // read only form can't have cancel button
						&& (self.form()._formCanEdit() == true) && (self.form()._formEditMode() == true)
						&& self.enableCancelButtonOnSubmittedOrProcessingForms); // cancel enabled via options
				return (b.toString().toLowerCase() == 'true') ? true : false;
			}
			return false;
        });
		/**
		 * CANCEL FORM BUTTON
		 */
		self.enableFormsCommandCancel = function() {
			return self._formButtonCancelEnabled();
		};
		self.actionFormsCommandCancel = function() {
			self.form()._closeOnButtonClick = true;
			self._formButtonCancelClick();
		};
        // DELETE
        self._formButtonDeleteClick = function () {
            self.form()._formDelete();
        };
		self._formApproved = function () {
			if (self.form()._formEnableModeration()) return (self.form()._formModerationStatus() == 0);
			return true;
		};
        self._formButtonDeleteEnabled = ko.pureComputed(function () {
			if( self.form()) {
				var moderation;
				if (self.form()._formModerationMode() == self.form()._formModerationModeLevel.DISABLED) {
					moderation = (!self._formApproved()) || ((self._formApproved() && ( self.enableDeleteButtonOnApprovedForms || ((self.form().mwp_FormState() == self.form()._formStates.DRAFT) && self.enableSaveUpdateDeleteButtonOnForms) )));
				}
				else {
					moderation = ((!self._formApproved() || !self.form()._formEnableModeration()) || self.enableDeleteButtonOnApprovedForms);// if moderation is enabled -> then any moderation state enables delete, except APPROVED
				}
				var b_draft = ((self.form().mwp_FormState() == self.form()._formStates.DRAFT) && (self.enableSaveUpdateDeleteButtonOnForms));
				var b_submitted = ((self.form().mwp_FormState() != self.form()._formStates.DRAFT) && (!self._formButtonCancelEnabled()) && self.enableDeleteButtonOnApprovedForms);
//debugger;				
				var b = (!self.form()._formNew() // the new, not created yet form, can't have delete button
				    //&& (self.form()._formReadOnly() == false) // read only form can't have delete button
					&& (self.form()._formCanEdit() == true) && (self.form()._formEditMode() == true)
					&& moderation && ( b_draft || b_submitted));
				return (b.toString().toLowerCase() == 'true') ? true : false;
			}
			return false;
        });
		/**
		 * DELETE FORM BUTTON
		 */
		self.enableFormsCommandDelete = function() {
			return self._formButtonDeleteEnabled();
		};
		self.actionFormsCommandDelete = function() {
			self._formButtonDeleteClick();
		};
        // SAVE
        self._formButtonSaveClick = function () {
            self.form().mwp_FormState(self.form()._formStates.DRAFT); // Saved form is always in Draft state
            self.form()._formModerationStatus(3);//SPModerationStatusType.Draft; -- will be applied only for Moderation Mode = DRAFT
            self.form()._formSave();
        };
        self._formButtonSaveEnabled = ko.pureComputed(function () {
			if( self.form()) {
				var b = ((self.form().mwp_FormState() == self.form()._formStates.DRAFT) // Form can be saved only while in Draft state 
					 && (self.form()._formReadOnly() == false) // read only form can't have save button
					 && ((self.form()._formModerationMode() == self.form()._formModerationModeLevel.DRAFT) || (self.enableSaveUpdateDeleteButtonOnForms)));
				return (b.toString().toLowerCase() == 'true') ? true : false;
			}
			return false;
        });
		/**
		 * SAVE FORM BUTTON
		 */
		self.enableFormsCommandSave = function() {
			return self._formButtonSaveEnabled();
		};
		self.actionFormsCommandSave = function() {
			self.form()._closeOnButtonClick = true;
			self._formButtonSaveClick();
		};

        // CLOSE
        self._formButtonCloseClick = function () {
            self.form()._formRedirectToList();
        }
        self._formButtonCloseEnabled = ko.pureComputed(function () {
            return true;
        });
		self._formLoadForm = function() {
			//self.form()._formInitialize();
		};
		/**
		 * CLOSE FORM BUTTON
		 */
		self.enableFormsCommandClose = function() {
			return self._formButtonCloseEnabled();
		};
		self.actionFormsCommandClose = function() {
			self._formButtonCloseClick();
		};

		// Proxy method:  delete list item
		self.Init = function() {
						
			self.form()._formModerationMode((self.params.moderation != undefined) ? self.params.moderation : "Disabled");
			self.form()._formUniqueIDMethod((self.params.counter != undefined) ? self.params.counter : "Counter" );//this._formSettings.UniqueIDMethod);
			
			self._formLoadForm();
		};
		/**
		 * EDIT BUTTON
		 */
		self.actionFormsCommandEdit = function(enable) {
			//self._formEditingForm(enable);
			self.form()._formEditMode(enable);
			RefreshCommandUI();
			return true;
		};
		self.queryFormsCommandEdit = function() {
			return self.form()._formEditMode();
		};
		/**
		 * DESIGN BUTTON
		 */
		self.actionFormsCommandDesign = function(enable) {
			self.form()._formDesignMode(enable);
			RefreshCommandUI();
			return true;
		};
		self.queryFormsCommandDesign = function() {
			return self.form()._formDesignMode();
		};

	}
    // Use prototype to declare any public methods
    //componentbuttons.prototype.doSomething = function() { ... };
	buttons.prototype.schema = {
		"Params": {
			"save": true,
			"cancel": true,
			"deletesubmitted": true,
			"moderation": "Draft",
			"uniqueid": "Counter"
		}
	};

	
	ko.bindingHandlers.initbuttons = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			//viewModel.form = bindingContext.$parent;
			viewModel.form( bindingContext.$root);
			viewModel.Init();
			
			//if( viewModel.form()._formIsSearchContext == false) {
			//	var displayMode = JSRequest.QueryString["DisplayMode"];
			//	if( displayMode != "Design") {
					if( viewModel.$form.$ribbonEdit) {
						viewModel.$form.$ribbonEdit.Toolbar = viewModel;
						window.setTimeout( function() { RefreshCommandUI(); }, 100);
					}
			//		else {
			//			requirejs( ["ribbonedit"], 
			//				function(ribbon) {
			//					viewModel.ribbon = ribbon;
			//					ribbon.Toolbar = viewModel;
			//					window.setTimeout( function() { RefreshCommandUI(); }, 100);
			//				});
			//			}
			//	}				
			//}
		}
	};  
    // Return component definition
    return { viewModel: buttons, template: htmlString };
});

