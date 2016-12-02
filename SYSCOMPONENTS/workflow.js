// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!./workflow.html'], function( htmlString) {
	function workflow( params) { 
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
//
//		if( this.designmode()) {
//debugger;			
//			this.runtime().$formEnsureWorkflow(this);
//		}
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
				return (b.toString().toLowerCase() == 'true') ? true : false;
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
				return (b.toString().toLowerCase() == 'true') ? true : false;
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
			window.setTimeout( function() { RefreshCommandUI(); }, 100);
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
	}).call(workflow.prototype);
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
	}).call(workflow.prototype);
    // Use prototype to declare any public methods
	workflow.prototype.schema = {
		"Params": {
			"visible": true,
			"closeonclick": false,
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
		},
		"Workflow" : {
			"title":"Test5",
			"xaml": '<Activity mc:Ignorable="mwaw" x:Class="TestWF2.MTW" xmlns="http://schemas.microsoft.com/netfx/2009/xaml/activities" xmlns:local="clr-namespace:Microsoft.SharePoint.WorkflowServices.Activities" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:mwaw="clr-namespace:Microsoft.Web.Authoring.Workflow;assembly=Microsoft.Web.Authoring" xmlns:scg="clr-namespace:System.Collections.Generic;assembly=mscorlib" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"><Sequence><Sequence><mwaw:SPDesignerXamlWriter.CustomAttributes><scg:Dictionary x:TypeArguments="x:String, x:String"><x:String x:Key="InitBlock">InitBlock-7751C281-B0D1-4336-87B4-83F2198EDE6D</x:String></scg:Dictionary></mwaw:SPDesignerXamlWriter.CustomAttributes></Sequence><Flowchart StartNode="{x:Reference __ReferenceID0}"><FlowStep x:Name="__ReferenceID0"><mwaw:SPDesignerXamlWriter.CustomAttributes><scg:Dictionary x:TypeArguments="x:String, x:String"><x:String x:Key="Next">4294967294</x:String></scg:Dictionary></mwaw:SPDesignerXamlWriter.CustomAttributes><Sequence><mwaw:SPDesignerXamlWriter.CustomAttributes><scg:Dictionary x:TypeArguments="x:String, x:String"><x:String x:Key="StageAttribute">StageContainer-8EDBFE6D-DA0D-42F6-A806-F5807380DA4D</x:String></scg:Dictionary></mwaw:SPDesignerXamlWriter.CustomAttributes><local:SetWorkflowStatus Disabled="False" Status="Stage 1"><mwaw:SPDesignerXamlWriter.CustomAttributes><scg:Dictionary x:TypeArguments="x:String, x:String"><x:String x:Key="StageAttribute">StageHeader-7FE15537-DFDB-4198-ABFA-8AF8B9D669AE</x:String></scg:Dictionary></mwaw:SPDesignerXamlWriter.CustomAttributes></local:SetWorkflowStatus><Sequence DisplayName="Stage 1"><local:WriteToHistory Message="Test" /></Sequence><Sequence><mwaw:SPDesignerXamlWriter.CustomAttributes><scg:Dictionary x:TypeArguments="x:String, x:String"><x:String x:Key="StageAttribute">StageFooter-3A59FA7C-C493-47A1-8F8B-1F481143EB08</x:String></scg:Dictionary></mwaw:SPDesignerXamlWriter.CustomAttributes></Sequence></Sequence></FlowStep></Flowchart></Sequence></Activity>',
			"historyListTitle": 'History',
			"tasksListTitle": 'Tasks',
			"eventTypes": ["ItemAdded","ItemUpdated"],
			"formData":''
		}
	};

    // Return component definition
    return { viewModel: workflow, template: htmlString };
});

