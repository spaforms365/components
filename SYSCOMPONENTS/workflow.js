// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!./workflow.html', 'text!./workflow.xaml'], function( htmlString, xamlString) { 
	/**
	 * CONSTRUCTOR
	 */
	function workflow( params) { 
		var self = this;
		self.params = params;
//debugger;	
		/**
		 * Get parameters used in Approval workflow.
		 */
		this.ID = (params) ? params.ID : '';
		this.NextID = (params) ? params.NextID : '';
		this.StepName = (params) ? params.StepName : '';	//Used for Status field and section heading
		this.ApproverType = (params) ? params.ApproverType : '';
		this.ApproverAccountID = (params) ? params.ApproverAccountID : '';		
		this.FirstStep = (params) ? params.FirstStep : '';		
		this.closeFormOnButtonClick = (params.closeonclick ) ? params.closeonclick : false;
		/**
		 * Get system-supported variables
		 */
		this.runtime = ko.observable().extend({form: "runtime"});
		this.readonly = ko.observable().extend({form: "readonly"});
		this.designmode = ko.observable().extend({form: "designmode"});
//		 
		this.commentsValue = ko.observable("");//Form comments textbox for reviewer input.
		this.workflowStepEnabled = ko.observable(false);	// Display form if user has design permissions.  Need check from Nikolay for permissions.
		this.taskFormReadOnly = ko.observable(false); // Hides Approve/Reject if ReviewerOutcome has a value.  Workflow will reset the field.
//
		this.enableui = ko.pureComputed(function() {
			if( this.designmode()) return true;
			return (this.workflowStepEnabled()) ? true : false;
		}, this);

		/**
		 * Task form variables
		 */
		this.approvalWorkflowText = ko.observable().extend({ listItem: "mwp_ApprovalWorkflow" });	
		this.approvalWorkflowJSON = ko.observable().extend({ listItem: "mwp_ApprovalWorkflowJSON" });
		this.approvalWorkflowText.subscribe( function(strValue) {
			var step = undefined, arr = [];
			
			if( strValue ) { try { arr = JSON.parse( strValue); } catch (e) {}; }
			arr.forEach(function(item) { if( item.ID == this.ID) step = item; }, this);
			if(!step) step = this.$jsonNewEmptyWorkflowStep();
	
			var obj = this.approvalWorkflowJSON();
			if( this.$isObject(obj)) {
				if(!obj[this.ID]) {
					obj[this.ID] = step;
//console.log("obj =" + JSON.stringify(obj));			
					this.approvalWorkflowJSON(obj);
				}
			}
			else {
				obj = {};
				obj[this.ID] = step;
//console.log("obj =" + JSON.stringify(obj));			
				this.approvalWorkflowJSON(obj);
			};
			var canEdit = this.runtime().$userPermissions.has(SP.PermissionKind.editListItems);
			if (step.Current && canEdit) {			
				this.workflowStepEnabled(true);// show Task Form in runtime mode
			};
			
		},this);
		/*
		this.validateApprovalWorkflowJSON = function( workflowProcess) {
			var result = false;
			if( !this.$isObject(workflowProcess)) return false;
			var workflowStep = workflowProcess[this.ID];
			if( !this.$isObject(workflowStep)) return false;
		};
		*/
		this.approvalWorkflowJSON.subscribe( function(value) {
			var arr = [];
			try { for( var key in value) { arr.push(value[key]);} } catch(e) {};
//console.log("arr =" + JSON.stringify(arr));			
			this.approvalWorkflowText(JSON.stringify(arr));
		},this);
		// triggers JSON initialization for new form
		//setTimeout( () => { if( !this.approvalWorkflowText()) this.approvalWorkflowText(null); }, 2000);
		setTimeout( function() { if( !self.approvalWorkflowText()) self.approvalWorkflowText(null); }, 2000);
		

		/**
		 * APPROVE TASK BUTTON
		 */
        this.buttonApproveClick = function () {	
			this.runtime()._closeOnButtonClick = this.closeFormOnButtonClick;
			//this.approvalWorkflowJSON()[this.ID] = this.$jsonNewEmptyWorkflowStep();
			this.approvalWorkflowJSON()[this.ID].ReviewerOutcome = "Approved";
			this.approvalWorkflowJSON()[this.ID].ReviewerComments = this.commentsValue();
			this.approvalWorkflowJSON.valueHasMutated();
			setTimeout( function() { self.runtime()._formSave();},100);
			this.taskFormReadOnly(true);
        };
        this.enableApproveButton = ko.pureComputed(function () {
            return (self.taskFormReadOnly()) ? false: true;
        },this);
		/**
		 * REJECT TASK BUTTON
		 */
        this.buttonRejectClick = function () {
			this.runtime()._closeOnButtonClick = this.closeFormOnButtonClick;
			this.approvalWorkflowJSON()[this.ID].ReviewerOutcome = "Rejected";
			this.approvalWorkflowJSON()[this.ID].ReviewerComments = this.commentsValue();
			this.approvalWorkflowJSON.valueHasMutated();
			setTimeout( function() { self.runtime()._formSave();},100);
			this.taskFormReadOnly(true);
			/*
			this.runtime()._closeOnButtonClick = this.closeFormOnButtonClick;
			//this._formButtonRejectClick();
			if (this.commentsValue() == "")
			{
				$(".custom-error-text").show();
			}
			else
			{
				$(".custom-error-text").hide();
				this.taskFormReadOnly(false);				
				var workflowStep = $.parseJSON(this.approvalWorkflow())
				for (var i=0; i<workflowStep.length; i++)
				{
					if (workflowStep[i].ID == this.ID)
					{
						workflowStep[i].ReviewerOutcome = "Rejected";
						workflowStep[i].ReviewerComments = this.commentsValue();
					}
				}
			}
			
			var workflowStepStr = JSON.stringify(workflowStep)
			this.taskFormReadOnly(true);
			this.approvalWorkflow(workflowStepStr);			
			this.runtime()._formSave();
			*/
        };
        this.enableRejectButton = ko.pureComputed(function () {
            return (self.taskFormReadOnly()) ? false: true;
        },this);
		/**
		 * CLOSE TASK BUTTON
		 */
        this.buttonCloseClick = function () {
//debugger;			
            this.runtime()._formRedirectToList();
        };
        this.enableCloseButton = ko.pureComputed(function () {
            return true;
        });		
	 }
	/**
	 * PRIVATE SUPPORT METHODS
	 */
	(function(){
		/*
		this.$workflowStart() {
			//this.approvalWorkflowJSON()[this.ID].NextID = "";
			this.approvalWorkflowJSON.valueHasMutated();
		};
		this.$workflowEnd() {
			this.approvalWorkflowJSON()[this.ID].NextID = "";
			this.approvalWorkflowJSON.valueHasMutated();
		};
		this.$workflowGoTo(nextID) {
			this.approvalWorkflowJSON()[this.ID].NextID = nextID;
			this.approvalWorkflowJSON.valueHasMutated();
		};
		*/
		this.$isObject = function(obj) {
			return obj === Object(obj);
		};
		this.$jsonNewEmptyWorkflowStep = function() {
			return {
				"ID": this.ID,
				"NextID": this.NextID,
				"StepName": this.StepName,
				"ApproverType": this.ApproverType,
				"ApproverAccountID": this.ApproverAccountID,				
				"FirstStep": this.FirstStep,			
				"Current": false,
				"Processed": false,
				"ReviewerOutcome": "",
				"ReviewerComments": "",
				"Dependency": false
			};
		};
		this.$strNewEmptyWorkflow = function() {
			var appwf = [];
			appwf.push(this.$jsonNewEmptyWorkflowStep());
			return JSON.stringify(appwf);
		};
 
		this.$enableTaskForm = function() {
            return (this.taskFormReadOnly()) ? false: true;
		};				
	}).call(workflow.prototype);
	/**
	 * OPTIONAL COMPONENT METADATA DECLARATIONS ENABLING VISUAL DESIGN MODE SUPPORT
	 *
	 *	ID:					{Unique ID of approval}  Used with NextID for processing.
	 *	NextID:  			Next step in approval process to run.  
	 *	StepName: 			Used for Status field and section heading
	 *	ApproverType: 		Value: (User, Manager, Group)
	 *	ApproverAccountID: 	Needed when User or Group
	 *  FirstStep: 			Which approval step to execute first.  Only 1 approval step should be set to true.
	 *	Current: 			*Populated by Workflow.  Boolean used to track approval step to execute.
	 *	Processed: 			*Populated by Workflow. Boolean used to track approval steps processed.
	 *	ReviewerOutcome: 	*Internal populated by system. Values: Approved, Rejected
	 *  ReviewerComments:	*Internal populated by system. Reviewer comments.	
	 *  closeonclick
	 */
	workflow.prototype.schema = {
		"Params": {			
			"ID": "ManagerApproval",
			"NextID": "",
			"StepName": "Manager Approval Needed",
			"ApproverType": "User",
			"ApproverAccountID": "sphurley",
			"FirstStep": "true",			
			"closeonclick": false,
		},
		"Permalink": "https://spaforms365.com/docs/syslib-workflow/",
		"ListColumns" : {
			//"mwp_FormID": '<Field ID="{3c53b379-6256-4ab5-bc14-8fa61360e526}" Type="Text" Name="mwp_FormID" Required="FALSE" DisplayName="Form ID" Description="Unique Form Identificator" Group="Medline Web Portal" SourceID="{cbfbae2b-8362-4201-ac65-6a64a7d1d411}" StaticName="mwp_FormID" AllowDeletion="TRUE" Version="1" Customization="" ColName="nvarchar4" RowOrdinal="0"><Default>0</Default></Field>',
			//"mwp_FormType": '<Field ID="{ac53b379-6156-4aa5-bc14-8fa6136be526}" Type="Text" Name="mwp_FormType" Required="FALSE" DisplayName="Form Type" Description="Give SPA Form Name" Group="Medline Web Portal" SourceID="{cbfbae2b-8362-4201-ac65-6a64a7d1d411}" StaticName="mwp_FormType" AllowDeletion="TRUE" Version="1" Customization="" ColName="nvarchar3" RowOrdinal="0"><Default>Generic SPA Form</Default></Field>',
			//"mwp_FormState": '<Field ID="{2223b379-4a56-25b5-bc14-8f3c5360e526}" Type="Text" Name="mwp_FormState" Required="FALSE" DisplayName="Form State" Description="Form State" Group="Medline Web Portal" SourceID="{cbfbae2b-8362-4201-ac65-6a64a7d1d411}" StaticName="mwp_FormState" AllowDeletion="TRUE" Version="1" Customization="" ColName="nvarchar5" RowOrdinal="0"><Default>Draft</Default></Field>',
			"mwp_ApprovalWorkflow": '<Field Type="Note" DisplayName="Form Workflow" EnforceUniqueValues="FALSE" Required="FALSE" ID="{e7e87ed8-0296-4c31-b721-2ec9ede31109}" Name="mwp_ApprovalWorkflow" StaticName="mwp_ApprovalWorkflow" Sortable="FALSE" RichText="FALSE" RichTextMode="Compatible" IsolateStyles="FALSE" AppendOnly="FALSE" UnlimitedLengthInDocumentLibrary="FALSE" NumLines="6" SourceID="{daf8e407-d019-4c86-ba35-822c1763ac52}" ColName="ntext4" RowOrdinal="0" Version="1" />'
		},
		"Workflow" : {
			"title":"ProcessWorkflowState",
			"xaml": xamlString,
			"historyListTitle": 'History',
			"tasksListTitle": 'Tasks',
			"eventTypes": ["ItemUpdated"],
			"formData":''
		}
	};

    // Return component definition
    return { viewModel: workflow, template: htmlString };
});

