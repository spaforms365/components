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
		this.parent = ko.observable().extend({form: "parent"});
		this.readonly = ko.observable().extend({form: "readonly"});
		this.designmode = ko.observable().extend({form: "designmode"});
//
//		this.formStatesEnum = self.runtime()._formStates;

		// SETTINGS
		this.visible = (params.visible) ? params.visible : true;
		self.enableSaveUpdateDeleteButtonOnForms = (params.save) ? params.save : false; 
		self.enableCancelButtonOnSubmittedOrProcessingForms = (params.cancel) ? params.cancel : true;
		self.enableDeleteButtonOnApprovedForms = (params.deletesubmitted ) ? params.deletesubmitted : true;
		self.closeFormOnButtonClick = (params.closeonclick ) ? params.closeonclick : false;
		
		//self._formEditingForm = ko.observable(false);
		//self._formDesigningForm = ko.observable(false);
		this.enableui = ko.pureComputed(function() {
			if( this.designmode()) return true;
			return (this.visible) ? true : false;
		}, this);
		this.validForm = ko.pureComputed( function() {
//debugger;	
			//var d = self.runtime().$validationGroup("viewmodel");			
			var d = self.runtime().$validationGroup({name: "viewmodel", viewmodel: this.parent()});
			return (d.isValid()) ? "" : "is-disabled";
		}, this);
		
        // SUBMIT
        self._formButtonSubmitClick = function () {
            self.formState(self.runtime()._formStates.SUBMITTED);
            self.runtime()._formModerationStatus(2); //SPModerationStatusType.Pending; -- will be applied only for Moderation Mode = DRAFT
            self.runtime()._formSave();
        };
        self._formButtonSubmitEnabled = ko.pureComputed(function () {
			if( self.runtime()) {
				//var b = (self.formState() == self.runtime()._formStates.DRAFT);
				var b = (self.readonly() == false);
				var c = (b.toString().toLowerCase() == 'true') ? true : false;
				//var d = self.runtime().$validationGroup("viewmodel");
				return c;// && d.isValid();
			}
			return false;
        });
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
        // SAVE
		
        self._formButtonSaveClick = function () {
            self.formState(self.runtime()._formStates.DRAFT); // Saved form is always in Draft state
            self.runtime()._formModerationStatus(3);//SPModerationStatusType.Draft; -- will be applied only for Moderation Mode = DRAFT
            self.runtime()._formSave();
        };
        self._formButtonSaveEnabled = ko.computed(function () {
			if( self.runtime()) {
				var b = ((self.formState() == self.runtime()._formStates.DRAFT) // Form can be saved only while in Draft state 
					 && (self.readonly() == false) // read only form can't have save button
					 && ((self.runtime()._formModerationMode() == self.runtime()._formModerationModeLevel.DRAFT) || (self.enableSaveUpdateDeleteButtonOnForms)));
				var c = (b.toString().toLowerCase() == 'true') ? true : false;
//debugger;				
				//var d = self.runtime().$validationGroup("viewmodel");
				return c;// && d.isValid();
			}
			return false;
        });
        self.enableButtonSave = ko.pureComputed(function () {
			var b = self.runtime()._formNew();
			return (self._formButtonSaveEnabled() && b) ? true : false;
		});
        self.enableButtonUpdate = ko.pureComputed(function () {
			var b = self.runtime()._formNew();
			return (self._formButtonSaveEnabled() && !b) ? true : false;
		});
       // CLOSE
		
        self._formButtonCloseClick = function () {
            self.runtime()._formRedirectToList();
        }
        self._formButtonCloseEnabled = ko.pureComputed(function () {
            return true;
        });
		// Proxy method:  delete list item
		self.Init = function() {
						
			self.runtime()._formModerationMode((self.params.moderation != undefined) ? self.params.moderation : "Disabled");
			self.runtime()._formUniqueIDMethod((self.params.counter != undefined) ? self.params.counter : "Counter" );//this._formSettings.UniqueIDMethod);
		};
//debugger;		
		if( self.runtime().$ribbonEdit) {
			self.runtime().$ribbonEdit.Toolbar = self;
			window.setTimeout( function() { RefreshCommandUI();   }, 100);
		}

	}
	/**
	 * BUTTONS INTERFACE
	 */
	(function(){
        this.buttonSaveClick = function () {
			this.runtime()._closeOnButtonClick = this.closeFormOnButtonClick;
			this._formButtonSaveClick();
        };
        this.buttonSubmitClick = function () {
			this.runtime()._closeOnButtonClick = this.closeFormOnButtonClick;
			this._formButtonSubmitClick();
        };
        this.buttonCancelClick = function () {
			this.runtime()._closeOnButtonClick = this.closeFormOnButtonClick;
			this._formButtonCancelClick();
        };
        this.buttonDeleteClick = function () {
			this.runtime()._closeOnButtonClick = this.closeFormOnButtonClick;
			this._formButtonDeleteClick();
        };
	}).call(buttons.prototype);
	/**
	 * SHAREPOINT 'FORM' RIBBON INTERFACE
	 */
	(function(){
		/**
		 * SUBMIT FORM BUTTON
		 */
		this.enableFormsCommandSubmit = function() {
			return this._formButtonSubmitEnabled();
		};
		this.actionFormsCommandSubmit = function() {
			this.runtime()._closeOnButtonClick = true;
			this._formButtonSubmitClick();
		};
		/**
		 * CANCEL FORM BUTTON
		 */
		this.enableFormsCommandCancel = function() {
			return this._formButtonCancelEnabled();
		};
		this.actionFormsCommandCancel = function() {
			this.runtime()._closeOnButtonClick = true;
			this._formButtonCancelClick();
		};
		/**
		 * DELETE FORM BUTTON
		 */
		this.enableFormsCommandDelete = function() {
			return this._formButtonDeleteEnabled();
		};
		this.actionFormsCommandDelete = function() {
			this._formButtonDeleteClick();
		};
		/**
		 * SAVE FORM BUTTON
		 */
		this.enableFormsCommandSave = function() {
			return this._formButtonSaveEnabled();
		};
		this.actionFormsCommandSave = function() {
			this.runtime()._closeOnButtonClick = true;
			this._formButtonSaveClick();
		};
		/**
		 * CLOSE FORM BUTTON
		 */
		this.enableFormsCommandClose = function() {
			return this._formButtonCloseEnabled();
		};
		this.actionFormsCommandClose = function() {
			this._formButtonCloseClick();
		};
		/**
		 * EDIT BUTTON
		 */
		this.actionFormsCommandEdit = function(enable) {
			this.runtime()._formEditMode(enable);
			RefreshCommandUI();  
			return true;
		};
		this.queryFormsCommandEdit = function() {
			return this.runtime()._formEditMode();
		};
	}).call(buttons.prototype);
    // Use prototype to declare any public methods
    //componentbuttons.prototype.doSomething = function() { ... };
	buttons.prototype.schema = {
		"Params": {
			"visible": true,
			"closeonclick": true,
			"save": true,
			"cancel": true,
			"deletesubmitted": true,
			"moderation": "Draft",
			"uniqueid": "Counter"
		},
		"Permalink": "https://spaforms365.com/docs/syslib-buttons/",
		"ListColumns" : {
			"mwp_FormID": '<Field ID="{3c53b379-6256-4ab5-bc14-8fa61360e526}" Type="Text" Name="mwp_FormID" Required="FALSE" DisplayName="Form ID" Description="Unique Form Identificator" Group="Medline Web Portal" SourceID="{cbfbae2b-8362-4201-ac65-6a64a7d1d411}" StaticName="mwp_FormID" AllowDeletion="TRUE" Version="1" Customization="" ColName="nvarchar4" RowOrdinal="0"><Default>0</Default></Field>',
			"mwp_FormType": '<Field ID="{ac53b379-6156-4aa5-bc14-8fa6136be526}" Type="Text" Name="mwp_FormType" Required="FALSE" DisplayName="Form Type" Description="Give SPA Form Name" Group="Medline Web Portal" SourceID="{cbfbae2b-8362-4201-ac65-6a64a7d1d411}" StaticName="mwp_FormType" AllowDeletion="TRUE" Version="1" Customization="" ColName="nvarchar3" RowOrdinal="0"><Default>Generic SPA Form</Default></Field>',
			"mwp_FormState": '<Field ID="{2223b379-4a56-25b5-bc14-8f3c5360e526}" Type="Text" Name="mwp_FormState" Required="FALSE" DisplayName="Form State" Description="Form State" Group="Medline Web Portal" SourceID="{cbfbae2b-8362-4201-ac65-6a64a7d1d411}" StaticName="mwp_FormState" AllowDeletion="TRUE" Version="1" Customization="" ColName="nvarchar5" RowOrdinal="0"><Default>Draft</Default></Field>'
		}
	};

    // Return component definition
    return { viewModel: buttons, template: htmlString };
});

