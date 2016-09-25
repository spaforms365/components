// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!./attachment.html'], function( htmlString) {
	function Attachment( params) { //attachmentPrefix, attachmentFileName, absoluteFileUrl) {
		var self = this;
		self.params = params;
		self.params.attachmentFileName = (params.attachmentFileName == undefined) ? "" : params.attachmentFileName;
		self.params.absoluteFileUrl = (params.absoluteFileUrl == undefined) ? "" : params.absoluteFileUrl;
		self.form = ko.observable();//params.form);
		
		//self.form = params.form;
//??		
//		self.form()._formAttachments.push(self);	

		self.filePrefix = (self.params.prefix == undefined) ? "" : self.params.prefix;
		if(self.params.required == undefined)
			self._formAttachmentRequired = ko.observable(false);
		else 
			self._formAttachmentRequired = self.params.required;
		
		self.oldFileUrl = ko.observable("");//params.absoluteFileUrl);
		self.oldFullFileName = ko.observable("");//params.attachmentFileName);
		self.oldFileName = "";//fName;
		self.newFileName = "";
		self.fileContent = undefined;
		self.isChanged = ko.observable(false);
		self.fileName = ko.observable("");
		self.input = undefined;
		self.index = undefined;
		
		self.Init = function( params) {//attachmentPrefix, attachmentFileName, absoluteFileUrl) {
//			debugger;
			var fName = params.attachmentFileName;
			if( params.prefix != "" ) { //&& params.attachmentPrefix != undefined) {
				fName = params.attachmentFileName.substring( params.attachmentFileName.indexOf("_") + 1, params.attachmentFileName.length)
			}
			self.oldFileUrl(params.absoluteFileUrl);
			self.oldFullFileName(params.attachmentFileName);
			self.oldFileName = fName;
			self.newFileName = "";
			self.fileContent = undefined;
			self.isChanged(false);
			self.fileName(self.oldFileName);
			//console.log("self.isChanged()="+self.isChanged() + " self.oldFileName " + self.oldFileName);
		};
		self.Init2 = function( formWebAbsoluteUrl, serverRelativeFileUrl) {
	//		debugger;
			var fileURL = serverRelativeFileUrl.toString();
			//console.log( fileURL);
			var params = { prefix: self.filePrefix, attachmentFileName: "", absoluteFileUrl: ""};
			if( fileURL != "") {
				var absoluteFileUrl = formWebAbsoluteUrl + fileURL.substring(fileURL.indexOf("/Lists"), fileURL.length);
				var fileName = fileURL.substring( fileURL.lastIndexOf("/")+1, fileURL.length);
				var fileTag = (fileName.indexOf("_") > 0) ? fileName.substring(0, fileName.indexOf("_")) : "";
				params.prefix = fileTag;
				params.attachmentFileName = fileName;
				params.absoluteFileUrl = absoluteFileUrl;
			}		
			self.Init( params);//fileTag, fileName, absoluteFileUrl);
		};
		self.Init3 = function() {
//debugger;				
			if( self.form().__formAttachmentsResults == undefined ) return;
			$.each( self.form().__formAttachmentsResults, function() {
				var fileURL = this.ServerRelativeUrl.toString();
				//console.log( fileURL);
				
				var absoluteFileUrl = self.form()._formWebAbsoluteUrl + fileURL.substring(fileURL.indexOf("/Lists"), fileURL.length);
				var fileName = fileURL.substring( fileURL.lastIndexOf("/")+1, fileURL.length);
				var fileTag = (fileName.indexOf("_") > 0) ? fileName.substring(0, fileName.indexOf("_")) : "";

				if( self.filePrefix == fileTag) {
					var params = {};
					params.prefix = fileTag;
					params.attachmentFileName = fileName;
					params.absoluteFileUrl = absoluteFileUrl;
					self.Init(params);
					return false;
				}
			});
//debugger;			
		};
		self.Save = function() {
//	debugger;		
			if(self.isChanged()) {
				//self.newFileName = self.fileName();
				var nFile = self.newFileName;
				var oFile = self.oldFileName;
				var fContent = self.newFileName;//"";
				if( (nFile != "") && (self.filePrefix != "")) { 
					nFile = self.filePrefix + "_" + self.newFileName;
//debugger;			
//					fContent = self.ab2str( self.fileContent);
				}
				if( (oFile != "") && (self.filePrefix != "")) oFile = self.filePrefix + "_" + self.oldFileName;
				self.form()._formAttachmentSave( nFile, oFile, fContent);
				//self.isChanged(false);
			}
			return self.isChanged();
		};
		
		self._formFileNameEnabled = ko.computed(function () {
			return self.isChanged();//|| (self.oldFileName == ""));
		});
		self._formFileNameWithLinkEnabled= ko.computed(function () {
			return !self._formFileNameEnabled();
		});		
		self._formButtonAddFileClick = function () {
			self.form()._formAttachmentUpload(self.index);
			//self.input.click();
		};
		self._formButtonAddFileEnabled = ko.computed(function () {
			var b = false;
			if( self.form()) {
				b = (self.form()._formReadOnly()) ? false : true;
			};
			return b;//(self.form()._formReadOnly() == false); // read only form can't have add file button

		});
		self._formButtonDeleteFileClick = function () {
			self.newFileName = "";
			self.fileName("");
			self.isChanged(true);
		};
		self._formButtonDeleteFileEnabled= ko.computed(function () {
			var b = (self.fileName() == "") ? false : true;
			var b2 = false;
			if( self.form()) {
				b2 = (self.form()._formReadOnly()) ? false : true;
			};
			return b && b2;
		});	
		
		self._controlEnabled = ko.pureComputed( function() {
			if( self.form()) {
				//var b = self.form._formEnableForm();
				var b = ((self.form().mwp_FormState() == self.form()._formStates.DRAFT));
				return (b.toString().toLowerCase() == 'true') ? true : false;
			}
			return false;
		});
		
		self._uploadFile2 = function( fileName) {
			self.newFileName = fileName;
			self.isChanged(true);
			self.fileName(self.newFileName);			
		};
		self._uploadFile = function( file) {
			var reader = new FileReader();
			reader.addEventListener("load", function() {
//				debugger;
				self.fileContent = reader.result;
//console.log("File Size: " + self.fileContent.byteLength);
				self.newFileName = file.name;
				self.isChanged(true);
				self.fileName(self.newFileName);
			}, false);
			if(file) {
debugger;				
				//reader.readAsDataURL(file);
				//reader.readAsArrayBuffer(file);
				self.form()._formAttachmentUpload(file);
			}
		};
		self.postProcessingLogic = function( elements) {
			self.input = $(elements).find("span>input");
		};	
		self.ab2str = function( buf) {
			var a = new Uint8Array(buf);
			return String.fromCharCode.apply( null, a);
		};
		
		//validateAttachDoc(clicked, srcDelete)
		//self.Init3();
		
	};
    // Use prototype to declare any public methods
    //componentAttachmentModel.prototype.doSomething = function() { ... };
	Attachment.prototype.schema = {
		"Params": {
			"prefix": "",
			"required": false
		},
		"Connections" : {
			"ListItem" : ['Attachments']
		}		
	};
	
	
	ko.bindingHandlers.initAT = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			viewModel.form(bindingContext.$root);
			viewModel.form()._formAttachments.push(viewModel);
//debugger;			
			viewModel.index = viewModel.form()._formAttachments.indexOf(viewModel);
			viewModel.Init(viewModel.params);
			viewModel.Init3();
		}
	}; 
	
 	
 
    // Return component definition
    return { viewModel: Attachment, template: htmlString };
});

