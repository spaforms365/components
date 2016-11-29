// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!./buttons.html'], function( htmlString) {
	function buttons( params) { 
		var self = this;
		self.params = params;
//debugger;	
		this.formID = ko.observable("").extend({ listItem: "mwp_FormID" });
		this.formType = ko.observable("").extend({ listItem: "mwp_FormType" });
		this.formState = ko.observable("Draft").extend({ listItem: "mwp_FormState" });
//debugger;
		this.runtime = ko.observable().extend({form: "runtime"});
		this.readonly = ko.observable().extend({form: "readonly"});
		this.designmode = ko.observable().extend({form: "designmode"});
		if( this.designmode()) {
			console.log("ensure columns");
			this.runtime()._formEnsureColumns( this.schema["ListColumns"]).done( function() {
				console.log("columns ensured");
			});
		}

		self.form = ko.observable();//params.form);
		// SETTINGS
		self.hideUI = (params.hidden) ? params.hidden : false;
		self.enableSaveUpdateDeleteButtonOnForms = (params.save !== undefined) ? params.save : false; //self.form()._formSettings
		self.enableCancelButtonOnSubmittedOrProcessingForms = (params.cancel !== undefined) ? params.cancel : true;
		self.enableDeleteButtonOnApprovedForms = (params.deletesubmitted != undefined) ? params.deletesubmitted : true;
		
		//self._formEditingForm = ko.observable(false);
		//self._formDesigningForm = ko.observable(false);
		self.enableUI = ko.pureComputed(function() {
			if( self.designmode()) return true;
			return (self.hideUI) ? false : true;
		});
		
        // SUBMIT
        self._formButtonSubmitClick = function () {
            self.formState(self.form()._formStates.SUBMITTED);
            self.runtime()._formModerationStatus(2); //SPModerationStatusType.Pending; -- will be applied only for Moderation Mode = DRAFT
            self.runtime()._formSave();
        };
        self._formButtonSubmitEnabled = ko.pureComputed(function () {
			if( self.runtime()) {
				//var b = (self.formState() == self.runtime()._formStates.DRAFT);
				var b = (self.readonly() == false);
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
			self.runtime()._closeOnButtonClick = true;
			self._formButtonSubmitClick();
		};
        // CANCEL
        self._formButtonCancelClick = function () {
			if( self.runtime()) {
				self.formState(self.runtime()._formStates.CANCELLED);
				if (self.runtime()._formModerationStatus() == 2) //SPModerationStatusType.Pending
					self.runtime()._formModerationStatus(3); //SPModerationStatusType.Draft; -- will be applied only for Moderation Mode = DRAFT
				self.runtime()._formSave();
			}
			return false;
        };
        self._formButtonCancelEnabled = ko.computed(function () {
//debugger;			
			if( self.runtime()) {
				var b = (((self.formState() != self.runtime()._formStates.DRAFT) && (self.formState() != self.runtime()._formStates.CANCELLED)) // cancel enabled always, except Draft or Cancelled
						//&& (self.readonly() == false) // read only form can't have cancel button
						&& (self.runtime()._formCanEdit() == true) && (self.runtime()._formEditMode() == true)
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
			self.runtime()._closeOnButtonClick = true;
			self._formButtonCancelClick();
		};
        // DELETE
        self._formButtonDeleteClick = function () {
            self.runtime()._formDelete();
        };
		self._formApproved = function () {
			if (self.runtime()._formEnableModeration()) return (self.runtime()._formModerationStatus() == 0);
			return true;
		};
        self._formButtonDeleteEnabled = ko.pureComputed(function () {
			if( self.runtime()) {
				var moderation;
				if (self.runtime()._formModerationMode() == self.runtime()._formModerationModeLevel.DISABLED) {
					moderation = (!self._formApproved()) || ((self._formApproved() && ( self.enableDeleteButtonOnApprovedForms || ((self.formState() == self.runtime()._formStates.DRAFT) && self.enableSaveUpdateDeleteButtonOnForms) )));
				}
				else {
					moderation = ((!self._formApproved() || !self.runtime()._formEnableModeration()) || self.enableDeleteButtonOnApprovedForms);// if moderation is enabled -> then any moderation state enables delete, except APPROVED
				}
				var b_draft = ((self.formState() == self.runtime()._formStates.DRAFT) && (self.enableSaveUpdateDeleteButtonOnForms));
				var b_submitted = ((self.formState() != self.runtime()._formStates.DRAFT) && (!self._formButtonCancelEnabled()) && self.enableDeleteButtonOnApprovedForms);
//debugger;				
				var b = (!self.runtime()._formNew() // the new, not created yet form, can't have delete button
				    //&& (self.readonly() == false) // read only form can't have delete button
					&& (self.runtime()._formCanEdit() == true) && (self.runtime()._formEditMode() == true)
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
            self.formState(self.runtime()._formStates.DRAFT); // Saved form is always in Draft state
            self.runtime()._formModerationStatus(3);//SPModerationStatusType.Draft; -- will be applied only for Moderation Mode = DRAFT
            self.runtime()._formSave();
        };
        self._formButtonSaveEnabled = ko.pureComputed(function () {
			if( self.runtime()) {
				var b = ((self.formState() == self.runtime()._formStates.DRAFT) // Form can be saved only while in Draft state 
					 && (self.readonly() == false) // read only form can't have save button
					 && ((self.runtime()._formModerationMode() == self.runtime()._formModerationModeLevel.DRAFT) || (self.enableSaveUpdateDeleteButtonOnForms)));
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
			self.runtime()._closeOnButtonClick = true;
			self._formButtonSaveClick();
		};

        // CLOSE
        self._formButtonCloseClick = function () {
            self.runtime()._formRedirectToList();
        }
        self._formButtonCloseEnabled = ko.pureComputed(function () {
            return true;
        });
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
						
			self.runtime()._formModerationMode((self.params.moderation != undefined) ? self.params.moderation : "Disabled");
			self.runtime()._formUniqueIDMethod((self.params.counter != undefined) ? self.params.counter : "Counter" );//this._formSettings.UniqueIDMethod);
		};
		/**
		 * EDIT BUTTON
		 */
		self.actionFormsCommandEdit = function(enable) {
			//self._formEditingForm(enable);
			self.runtime()._formEditMode(enable);
			RefreshCommandUI();
			return true;
		};
		self.queryFormsCommandEdit = function() {
			return self.runtime()._formEditMode();
		};
		/**
		 * DESIGN BUTTON
		 */
		//self.actionFormsCommandDesign = function(enable) {
		//	self.runtime()._formDesignMode(enable);
		//	RefreshCommandUI();
		//	return true;
		//};
		//self.queryFormsCommandDesign = function() {
		//	return self.runtime()._formDesignMode();
		//};

	}
    // Use prototype to declare any public methods
    //componentbuttons.prototype.doSomething = function() { ... };
	buttons.prototype.schema = {
		"Params": {
			"hidden": false,
			"save": true,
			"cancel": true,
			"deletesubmitted": true,
			"moderation": "Draft",
			"uniqueid": "Counter"
		},
		"ListColumns" : {
			"mwp_FormID": '<Field ID="{3c53b379-6256-4ab5-bc14-8fa61360e526}" Type="Text" Name="mwp_FormID" Required="FALSE" DisplayName="Form ID" Description="Unique Form Identificator" Group="Medline Web Portal" SourceID="{cbfbae2b-8362-4201-ac65-6a64a7d1d411}" StaticName="mwp_FormID" AllowDeletion="TRUE" Version="1" Customization="" ColName="nvarchar4" RowOrdinal="0"><Default>0</Default></Field>',
			"mwp_FormType": '<Field ID="{ac53b379-6156-4aa5-bc14-8fa6136be526}" Type="Text" Name="mwp_FormType" Required="FALSE" DisplayName="Form Type" Description="Give SPA Form Name" Group="Medline Web Portal" SourceID="{cbfbae2b-8362-4201-ac65-6a64a7d1d411}" StaticName="mwp_FormType" AllowDeletion="TRUE" Version="1" Customization="" ColName="nvarchar3" RowOrdinal="0"><Default>Generic SPA Form</Default></Field>',
			"mwp_FormState": '<Field ID="{2223b379-4a56-25b5-bc14-8f3c5360e526}" Type="Text" Name="mwp_FormState" Required="FALSE" DisplayName="Form State" Description="Form State" Group="Medline Web Portal" SourceID="{cbfbae2b-8362-4201-ac65-6a64a7d1d411}" StaticName="mwp_FormState" AllowDeletion="TRUE" Version="1" Customization="" ColName="nvarchar5" RowOrdinal="0"><Default>Draft</Default></Field>'
		}
	};

	
	ko.bindingHandlers.initbuttons = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			//viewModel.form = bindingContext.$parent;
			viewModel.form( bindingContext.$root);
			viewModel.Init();
			if( viewModel.$form.$ribbonEdit) {
				viewModel.$form.$ribbonEdit.Toolbar = viewModel;
				window.setTimeout( function() { RefreshCommandUI(); }, 100);
			}
		}
	};  
    // Return component definition
    return { viewModel: buttons, template: htmlString };
});

