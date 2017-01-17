// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!./filebox.html'], function( htmlString) {
	function filebox( params) { 
		var self = this;
		
		this.internalName = (params) ? params.InternalName : '';
		
		this.runtime = ko.observable().extend({form: "runtime"});
		this.parent = ko.observable().extend({form: "parent"});
		this.readonly = ko.observable().extend({form: "readonly"});
		this.designmode = ko.observable().extend({form: "designmode"});
		
		/**
		 * TITLE
		 * observable bound to component's html UI template to show Sharepoint column's 'Title'
		 * Title value passed via params of component's html notation on calling form's (viewmodel) html template
		 * Title parameter additionally declared at component's metadata (schema), enabling dynamic param's value update on 
		 * form's (viewmodel) html temlate from Sharepoint source on design mode.
		 */
		this.title = ko.observable((params) ? params.Title : '');
		/**
		 * DESCRIPTION	
		 * observable bound to UI html template to show sharepoint column's 'Description' 
		 * Description value passed via params of component's html notation on calling form's (viewmodel) html template
		 * Description parameter additionally declared at component's metadata (schema), enabling dynamic param's value update on 
		 * form's (viewmodel) html temlate from Sharepoint source on design mode.
		 */
		this.description = ko.observable((params && params.Description && (params.Description.length > 0)) ? params.Description : "click to add file...");
		/**
		 * REQUIRED	
		 */
		this.required = ko.observable((params && params.Required) ? params.Required : false);
		/**
		 * READONLYFIELD	
		 */
		this.readonlyfield = ko.observable((params && params.ReadOnlyField) ? params.ReadOnlyField : false);
		/**
		 * PREFIX	
		 */
		this.prefix = ko.observable((params && params.Filter) ? params.Filter : "");
		/**
		 * VALUE	
		 * observable bound to UI html template to show sharepoint column's 'Value' 
		 */
		//this.value = ko.observable().extend({ listItem: {"internalName": this.internalName, "typeName": this.schema.Connections.ListItem }});//.extend({ required: true }).extend({ minLength: 3 });
		this.value = ko.observable({results:[]}).extend({ listItem: this.internalName });
		this.results = ko.observableArray([]);
		this.value.subscribe( function( val) {
			if( !val) val = {};
			if( val && !val.results) val.results = [];
			var filtered = $.grep(val.results, function (item, index) { return item.prefix == self.prefix(); });
			this.results(this.$results(filtered));
		},this);
		/**
		 * COMPONENT VALIDATION	
		 */
		if( ko.validation) {
			/*
			this.value.extend({ required: this.required() })
					  .extend({ validationGroup: "viewmodel" });
					  */
			this.results.extend({ required: this.required() })
					  .extend({ validationGroup: {name: "viewmodel", viewmodel: this.parent()} });
//					  .extend({ validationGroup: "viewmodel" });
		};
		// -- ENABLE VALUE EDIT MODE
		// observable bound to UI html template to enable sharepoint column's 'Value'editing
		this.enableValue = ko.pureComputed( function() { return (this.$enabled()) ? "" : "is-disabled"; }, this);
		this.showValue = ko.pureComputed( function() { return this.$enabled(); }, this);
		this.enableRequired = ko.pureComputed( function() { return (this.required()) ? "is-required" : ""; }, this);
		
		this.addFile = function () {
			self.runtime()._formAttachmentUpload().done( function(fileName) {
				var r = self.value();
				var item = { 
						"newFileName": fileName, 
						"oldFileName": "", 
						"url": "",
						"prefix": self.prefix()
						};
				r.results.push(item);	
				self.value(r);			
			});
		};
	};
	/**
	 * FABRIC UI FILE PICKER COMPONENT VERSION
	 */
//	var fabric;
	(function (fabric) {
		/**
		 * People Picker
		 *
		 * People picker control
		 *
		 */
		var MODAL_POSITION = "bottom";
		var TOKEN_CLASS = "ms-Persona--token";
		var FilePicker = (function () {
			/**
			 *
			 * @param {HTMLElement} container - the target container for an instance of People Picker
			 * @constructor
			 */
			function FilePicker(container) {
	//debugger;			
				this._container = container;
				this._peoplePickerMenu = this._container.querySelector(".ms-PeoplePicker-results");
				this._peoplePickerSearch = this._container.querySelector(".ms-TextField-field");
				this._peoplePickerSearchBox = this._container.querySelector(".ms-PeoplePicker-searchBox");
				this._selectedPeople = this._container.querySelector(".ms-PeoplePicker-selectedPeople");
				/*
				this._assignClicks();
				if (this._selectedPeople) {
					this._assignRemoveHandler();
					this._selectedCount = this._container.querySelector(".ms-PeoplePicker-selectedCount");
					this._selectedPlural = this._container.querySelector(".ms-PeoplePicker-selectedCountPlural");
				}
				if (this._peoplePickerMenu) {
					this._peoplePickerMenu.setAttribute("style", "display: none;");
				}
				*/
			}
			/*
			FilePicker.prototype._createModalHost = function (e) {
				e.stopPropagation();
				this._peoplePickerMenu.setAttribute("style", "display: block;");
				this._contextualHostView = new fabric.ContextualHost(this._peoplePickerMenu, MODAL_POSITION, this._peoplePickerSearchBox, false, [""], true, this._contextHostCallBack.bind(this));
				this._peoplePickerSearchBox.classList.add("is-active");
				this._isContextualMenuOpen = true;
			};
			*/
			FilePicker.prototype._clickHandler = function (e) {
				//this._peoplePickerResults = this._peoplePickerMenu.querySelectorAll(".ms-PeoplePicker-result");
				//if( this._peoplePickerResults.length > 0) this._createModalHost(e);
				/*
				this._createModalHost(e);
				// Select all results and remove event listeners by cloning
				var peoplePickerResults = this._peoplePickerMenu.querySelector(".ms-PeoplePicker-result");
				var resultsParent = peoplePickerResults.parentNode;
				var resultsClone = resultsParent.cloneNode(true);
				resultsParent.parentNode.replaceChild(resultsClone, resultsParent);
				// Get all results
				this._peoplePickerResults = this._peoplePickerMenu.querySelectorAll(".ms-PeoplePicker-result");
				// Add _selectResult listeners to each result
				for (var i = 0; i < this._peoplePickerResults.length; i++) {
					var personaResult = this._peoplePickerResults[i].querySelector(".ms-Persona");
					var removeButton = this._peoplePickerResults[i].querySelector(".ms-PeoplePicker-resultAction");
					personaResult.addEventListener("click", this._selectResult.bind(this), true);
					removeButton.addEventListener("click", this._removeItem.bind(this), true);
				}
				*/
			};
			/*
			FilePicker.prototype._selectResult = function (e) {
				//e.stopPropagation();
				//var currentResult = this._findElement(e.target, "ms-Persona");
//debugger;				
				this._peoplePickerResults = this._peoplePickerMenu.querySelector(".ms-PeoplePicker-result");
				var currentResult = this._peoplePickerResults.querySelector(".ms-Persona");
				var clonedResult = currentResult.cloneNode(true);
				// if facePile - add to members list / else tokenize
				if (this._container.classList.contains("ms-PeoplePicker--facePile")) {
					this._addResultToMembers(clonedResult);
				}
				else {
					this._tokenizeResult(clonedResult);
				}
				this._updateCount();
				
				var id = currentResult.querySelector(".ms-Persona-primaryText");
				if( this._selectCallback) this._selectCallback(id.innerText, clonedResult);
				// Close the open contextual host
				//this._contextualHostView.disposeModal();
			};
			FilePicker.prototype._findElement = function (childObj, className) {
				var currentElement = childObj.parentNode;
				while (!currentElement.classList.contains(className)) {
					currentElement = currentElement.parentNode;
				}
				return currentElement;
			};
			FilePicker.prototype._addRemoveBtn = function (persona, token) {
				var actionBtn;
				var actionIcon = document.createElement("i");
				if (token) {
					actionBtn = document.createElement("div");
					actionBtn.classList.add("ms-Persona-actionIcon");
					actionBtn.addEventListener("click", this._removeToken.bind(this), true);
				}
				else {
					actionBtn = document.createElement("button");
					actionBtn.classList.add("ms-PeoplePicker-resultAction");
					actionBtn.addEventListener("click", this._removeResult.bind(this), true);
				}
				actionIcon.classList.add("ms-Icon", "ms-Icon--Cancel");
				actionBtn.appendChild(actionIcon);
				persona.appendChild(actionBtn);
			};
			FilePicker.prototype._removeToken = function (e) {
				var currentToken = this._findElement(e.target, "ms-Persona");
				var id = currentToken.querySelector(".ms-Persona-primaryText");
				//console.log('delete id: ' + id.innerText);
				if( this._removeCallback) this._removeCallback(id.innerText);
				currentToken.remove();
				
//				var currentToken = this._findElement(e.target, "ms-Persona");
//				currentToken.remove();
				
			};
			FilePicker.prototype._removeResult = function (e) {
				var currentResult = this._findElement(e.target, "ms-PeoplePicker-selectedPerson");
				currentResult.remove();
				this._updateCount();
			};
			FilePicker.prototype._removeItem = function (e) {
				var currentItem = this._findElement(e.target, "ms-PeoplePicker-result");
				currentItem.remove();
			};
			FilePicker.prototype._updateCount = function () {
				if (this._selectedPeople) {
					var count = this._selectedPeople.querySelectorAll(".ms-PeoplePicker-selectedPerson").length;
					this._selectedCount.textContent = count.toString();
					this._selectedPlural.style.display = (count === 1) ? "none" : "inline";
				}
			};
			FilePicker.prototype._tokenizeResult = function (tokenResult) {
				var searchBox = this._container.querySelector(".ms-PeoplePicker-searchBox");
				var textField = searchBox.querySelector(".ms-TextField");
				// Add token classes to persona
				tokenResult.classList.add(TOKEN_CLASS, "ms-PeoplePicker-persona");
				// Add the remove button to the token
				this._addRemoveBtn(tokenResult, true);
				// Use persona xs variant for token
				if (tokenResult.classList.contains("ms-Persona--sm")) {
					tokenResult.classList.remove("ms-Persona--sm");
					tokenResult.classList.add("ms-Persona--xs");
				}
				// Prepend the token before the search field
				searchBox.insertBefore(tokenResult, textField);
			};
			FilePicker.prototype._addResultToMembers = function (persona) {
				var membersList = this._container.querySelector(".ms-PeoplePicker-selectedPeople");
				var firstMember = membersList.querySelector(".ms-PeoplePicker-selectedPerson");
				var selectedItem = document.createElement("li");
				// Create the selectedPerson list item
				selectedItem.classList.add("ms-PeoplePicker-selectedPerson");
				selectedItem.tabIndex = 1;
				// Append the result persona to list item
				selectedItem.appendChild(persona);
				// Add the remove button to the persona
				this._addRemoveBtn(selectedItem, false);
				// Add removeResult event to resultAction
				selectedItem.querySelector(".ms-PeoplePicker-resultAction").addEventListener("click", this._removeResult.bind(this), true);
				membersList.insertBefore(selectedItem, firstMember);
			};
			FilePicker.prototype._assignClicks = function () {
				
				var _this = this;
				this._peoplePickerSearch.addEventListener("click", this._clickHandler.bind(this), true);
				this._peoplePickerSearch.addEventListener("keyup", function (e) {
					if (e.keyCode !== 27 && !_this._isContextualMenuOpen) {
						_this._clickHandler(e);
					}
				}, true);
				
			};
			FilePicker.prototype._assignRemoveHandler = function () {
				var selectedPeople = this._selectedPeople.querySelectorAll(".ms-PeoplePicker-selectedPerson");
				for (var i = 0; i < selectedPeople.length; i++) {
					selectedPeople[i].querySelector(".ms-PeoplePicker-resultAction").addEventListener("click", this._removeResult.bind(this), true);
				}
			};
			FilePicker.prototype._contextHostCallBack = function () {
				this._peoplePickerSearchBox.classList.remove("is-active");
				this._isContextualMenuOpen = false;
			};
			FilePicker.prototype._loadField = function() {
				// Get all results
				this._peoplePickerResults = this._peoplePickerMenu.querySelectorAll(".ms-PeoplePicker-result");
				for (var i = 0; i < this._peoplePickerResults.length; i++) {
					var personaResult = this._peoplePickerResults[i].querySelector(".ms-Persona");
					var currentResult = personaResult;
					var clonedResult = currentResult.cloneNode(true);
					// if facePile - add to members list / else tokenize
					if (this._container.classList.contains("ms-PeoplePicker--facePile")) {
						this._addResultToMembers(clonedResult);
					}
					else {
						this._tokenizeResult(clonedResult);
					}
					this._updateCount();
					if( this._appendCallback) this._appendCallback(clonedResult);
				}
			};
			*/
			return FilePicker;
		}());
		fabric.FilePicker = FilePicker;
	})(fabric || (fabric = {}));
	/**
	 * COMPONENT MODEL HELPER METHODS
	 */
	(function(){
		this.$enabled = function() {
			return (this.readonly() || this.readonlyfield() ) ? false : true;
		};		
		//called by $init binding handler on html template
		this.$init = function(element) {
			
			var elm = element.querySelector(".ms-PeoplePicker");
			// override fabric ui
			var self = this;
			this.fabricObject = new fabric['FilePicker'](elm);

			self.fabricObject["_filePickerIcon"] = self.fabricObject._container.querySelector(".ms-FilePicker-dialog");
			if( ko.validation) {
				// knockout.validation.min.css overrides fabric.components.css to support people picker validation
				var validationMessageElement = ko.validation.insertValidationMessage(this.fabricObject._container);
				//additional span for validation message
//debugger;				
				ko.applyBindingsToNode(validationMessageElement, { validationMessage: this.results  });//.value  });
				//enable red border on validation errors
				ko.applyBindingsToNode(this.fabricObject._container, { validationElement: this.results  });//.value });
				//fix icon offset on validation error message display
				ko.applyBindingsToNode(this.fabricObject._filePickerIcon, { validationElement: this.results  });//.value });
			}
			
		};
		this.$results = function( resultset) {
			var self = this;
			var resultobjects = [];
			resultset.forEach( function( item, index) {
				resultobjects.push( 
				{
//					'color': "ms-Persona-initials--green",//item.Color,
//					'initials': "TD",//item.Initials,
					'oldFileName': item.oldFileName,//item.PrimaryText,
					'newFileName': item.newFileName,//item.EntityData.Department,//item.SecondaryText,
//					'index': index,
					'prefix': item.prefix,
					'url': ko.pureComputed( function() { return item.url; } ),
					'showText': ko.pureComputed( function() { return (item.url && (item.url.length > 0)) ? false : true; }, this),
					'showLink': ko.pureComputed( function() { return (item.url && (item.url.length > 0)) ? true : false; }, this),
					'parent': this,
					'onremove': function() {
//debugger;						
						var r = this.parent.value();
						var d = this;
						var filtered = $.grep(r.results, function (item, index) { return ((item.oldFileName == d.oldFileName) && (item.newFileName == d.newFileName)); });
						filtered[0].newFileName = "";
						filtered[0].url = "";
						filtered[0].prefix = 'deleted';
						//r.results.splice( , 1);
						this.parent.value(r);
					},
					'jsonObject': item//,
				});
			}, this);
			return resultobjects;
		};
	}).call(filebox.prototype);
    // Use prototype to declare any public methods
    //componentAttachmentModel.prototype.doSomething = function() { ... };
	filebox.prototype.schema = {
		"Params": {
			"Filter": "",			
			"InternalName": "",
			"Title": "",
			"AllowMultipleValues": false,
			"Description": "click to add file...",
			"ReadOnlyField": false,
			"FieldTypeKind": 0,
			"Required": false
		},
		"ListColumns" : {
			"mwp_Attachments": '<Field Type="Note" DisplayName="Form Attachments Map" EnforceUniqueValues="FALSE" Required="FALSE" ID="{17117ed8-0696-4031-b721-2ef99de31109}" Name="mwp_Attachments" StaticName="mwp_Attachments" Sortable="FALSE" RichText="FALSE" RichTextMode="Compatible" IsolateStyles="FALSE" AppendOnly="FALSE" UnlimitedLengthInDocumentLibrary="FALSE" NumLines="6" SourceID="{daf8e407-d019-4c86-ba35-822c1763ac52}" Version="1" />'
		},
		"Connections" : {
			"ListItem" : ['Attachments']
		}		
	};
	
    // Return component definition
    return { viewModel: filebox, template: htmlString };
});

