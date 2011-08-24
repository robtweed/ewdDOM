# ewdDOM
 
Persistent lightweight DOM for Node.js, using the Globals database

Rob Tweed <rtweed@mgateway.com>  
25 July 2011, M/Gateway Developments Ltd [http://www.mgateway.com](http://www.mgateway.com)  

Twitter: @rtweed

Google Group for discussions, support, advice etc: [http://groups.google.co.uk/group/enterprise-web-developer-community](http://groups.google.co.uk/group/enterprise-web-developer-community)

## Installing ewdDOM

       npm install ewdDOM

You must also install Isaac Schlueter's sax module, which is used when importing XML/HTML files:

       npm install sax
	   

##  EWD DOM

This is a lightweight DOM implementation for Node.js.  It differs from other DOM implementations by 
storing DOMs persistently in the extremely high-performance [http://glogalsdb.org](Globals) database.  By virtue
of the in-process nature of the Globals APIs and the performance of the Globals database, the EWD DOM implementation 
uses the synchronous Globals APIs for Node.js, allowing the ewdDOM module to provide a fully object-oriented suite of 
DOM APIs.  

When using the EWD DOM APIs, you are directly manipulating persistent DOMs stored in the Globals database rather than 
an in-memory copy.  Once created, a DOM will persist until an explicit removeDocument() method is invoked.

EWD DOMs can be created in two ways:

- by parsing an XML or HTML file.  Isaac Schlueter's sax module provides the core parsing engine
- programmatically, by using the EWD DOM APIs

ewdDOM essentially provides Native XML Database storage for Node.js.  There is currently no XPath or XQuery 
capability, but it is hoped that these will follow (volunteers for collaboration are very welcome!).

It turns out that persiatent DOMs are a very powerful and flexible way of storing and manipulating data.  Although 
you can output any EWD DOM as an XML text file, there is actually no need to do so unless you really need an 
XML file as output for some reason.  The real power of the DOM is the ability to quickly and easily 
transform and modify the document via the DOM APIs, and it is straightforward to walk the DOM tree and carry 
out actions (or output data) based on the information found while traversing the DOM.

The EWD DOM is actually the core of the [http://www.mgateway.com/ewd.html](EWD Ajax/Mobile web application development framework) 
 and is the key to the power and flexibility of EWD.  It has been re-implemented and made available for Node.js for two reasons:
 
 - as a useful standalone product in its own right
 - as an initial stepping stone to porting EWD to a fully Node.js environment

##  Using the ewdDOM module

Node.js should be installed on the same physical server as an instance of the Globals database.

The following is a simple example of how to use the *ewdDOM* module:

      var ewdDOM = require('ewdDOM');
      var params = {
        path:'/home/user/globals/mgr'
      };
      ewdDOM.start(params,function(db) {
        console.log("version = " + ewdDOM.version);
        console.log("Your persistent DOMs: " + JSON.stringify(ewdDOM.getDocumentNames()));
      });

This example assumes that the Globals database has been installed in the path */home/user/globals*.  The
ewdDOM.start() method opens the database and establishes the environment for your DOMs to be accessed 
within its callback function.

The array of document names will, of course, initially be empty because you haven't created any DOMs yet.

##  ewdGateway Start Parameters

The parameters that you can specify for the *ewdGateway* *start* function are as follows:

- *path  = the path in which the Globals database file (CACHE.DAT) resides (default *'/home/user/globals/mgr'*)
- *username*  = the Globals database username (default *_SYSTEM*)
- *password*  = the Globals databaase password (default *SYS*)
- *namespace* = the Globals database namespace to which *ewdDOM* should connect (default *'USER'*)

##  EWD DOM Examples

###Creating a DOM by parsing an XML file

Use the ewdDOM.parse() method.  The example below parses an XML document (*'index.xml'*) and 
creates a persistent DOM named *'stdemo-index'*.  The document.output() method then outputs 
the DOM to the console as an XML document again.

      var ewdDOM = require('ewdDOM');
      var params = {
        path:'/home/user/globals/mgr'
      };
      ewdDOM.start(params,function(db) {
        var document = ewdDOM.parse('/home/user/ewdapps/stdemo/index.xml', 'stdemo-index');
        document.output();
      });

###Creating a DOM programmatically, using the DOM API methods

Use the ewdDOM.createDocument() method.  The example below creates a new DOM named *'myDocument'*.  Several
nodes are then added using a variety of the available DOM API methods.  Finally we output it 
to the console as an XML document.

      var ewdDOM = require('ewdDOM');
      var params = {
        path:'/home/user/globals/mgr'
      };
      ewdDOM.start(params,function(db) {
        var document = ewdDOM.createDocument('myDocument');
		var documentNode = document.getDocumentNode();
		var node1 = document.createElement("testElement");
        documentNode.appendChild(node1);
		node1.setAttribute("name","rob");
        node1.setAttribute("town","Reigate");
		var newNode = {
          tagName: "div",
          attributes: {id: "myNewNode", abc: 123, def: "this is cool!"},
          text: "This is a new div"
        };
        var node2 = node1.addElement(newNode);
		newNode = {
          tagName: "div",
          attributes: {id: "secondDiv", abc: 'hkjhjkhjk'},
        };
        var node3 = node1.addElement(newNode);
        var imNode = node1.insertIntermediateElement("intermediateTag");
        var pNode = imNode.insertParentElement("newParentTag");
        document.output();
      });
	  
Note that DOMs, once created, will automatically persist until they are explicitly 
removed by using the ewdDOM.removeDocument() method.

###Accessing an existing DOM

You can access (and then modify or manipulate) using the ewdDOM.getDocument() method, identifying 
the DOM you require by its documentName:


      var ewdDOM = require('ewdDOM');
      var params = {
        path:'/home/user/globals/mgr'
      };
      ewdDOM.start(params,function(db) {
        var document = ewdDOM.getDocument('stdemo-index');
        document.output();
      });
	  
You can find and identify your saved DOMs using the ewdDOM.getDocuments() method.  This returns an 
array of document objects:

      var ewdDOM = require('ewdDOM');
      var params = {
        path:'/home/user/globals/mgr'
      };
      ewdDOM.start(params,function(db) {
        var documents = ewdDOM.getDocuments();
        documents[0].output();
      });

Alternatively, the ewdDOM.getDocumentNames() method returns an array of DOM names:

      var ewdDOM = require('ewdDOM');
      var params = {
        path:'/home/user/globals/mgr'
      };
      ewdDOM.start(params,function(db) {
        console.log("Your DOMs: " + JSON.stringify(ewdDOM.getDocumentNames()));
      });

	  
To remove a document:	  

      var ewdDOM = require('ewdDOM');
      var params = {
        path:'/home/user/globals/mgr'
      };
      ewdDOM.start(params,function(db) {
        ewdDOM.removeDocument('stdemo-index');
      });
	  
	  
##  Summary of the EWD DOM APIs


### System-level:

#### ewdDOM.start()

Opens the Globals database and establishes the EWD DOM environment.  See examples above.

#### ewdDOM.createDocument(documentName)

Creates a new, initially empty DOM, with just a top-level documentNode.

Returns the new document object.

#### ewdDOM.documentExists(documentName)

Determines whether or not a DOM with the specified name exists in the Globals database.

Returns true or false

#### ewdDOM.getDocument(documentName)

Returns the document object for the named DOM, if it exists, otherwise false.

#### ewdDOM.getDocuments()

Returns an array of document objects

#### ewdDOM.getDocumentNames()

Returns an array of document names

#### ewdDOM.parse(filePath, documentName)

Parses an XML or HTML file and creates a DOM using the specified name.

Returns the new document object.

Note: if a DOM already exists with the specified name it is first removed.

#### ewdDOM.removeDocument(documentName)

Permanently deletes a named document. Does not return any value.

#### ewdDOM.version()

Returns the ewdDOM module version.



### Document-specific properties:

#### document.creationDate

The date/timestamp (epoch time) when the document was first created

#### document.name

The document name (as specified when the document was created)

### Document-specific methods:

#### document.createCDataSection(data)

Creates a CDATA Section node

#### document.cloneTo(documentName)

Clones the current document into a new named document.  If the named document exists, 
it is first deleted.

#### document.createComment(data)

Creates a Comment node

#### document.createDocumentType(params)

Creates a DocumentType node.  The params object has the following properties:

- qualifiedName
- publicId
- systemId

#### document.createElement(tagName)

Creates an Element node

#### document.createProcessingInstruction(target, data)

Creates a Processing Instruction node

#### document.createTextNode(text)

Creates a Text node

#### document.delete() or document.remove()

Permanently removes the document.  No return value.

#### document.getDocumentNode()

Returns the top-level Document Node object

#### document.getElementById(id)

Returns the Element Node object with the specified id attribute value, if it exists.  Otherwise returns false

#### document.getElementsByTagName(tagName)

Returns an array of Element Node objects that match the specified tagName

#### document.importNode(node, deep)

Copies the specified Node (from another document) into the current document.  If deep is true, the 
sub-tree of nodes under the specified node is also copied.  Returns the Node object of the new top-level node.

#### document.insertBefore(newNode, existingNode)

Attaches the new Node object into the document Node tree, as a previousSibling of the existing Node object.

#### document.output([params][, callback])

Walks the DOM tree and outputs the nodes.

If no parameters are specified, the document is output to the console as an XML document.

Parameters are as follows:

- newLine: write a new line after every node (true|false) (default = true)
- indent: indent each child node (true|false) (default = true)
- destination: where to send output (console|file) (default = console)
- fileName (if destination == file): filepath for output

If destination is file and fileName is defined, then you should specify a standard fs.writeFile call-back function which 
will be invoked when writing to the file is completed.

#### document.removeNode(node, deleteFromDOM)

Removes the specified Node object from the document.  If deleteFromDOM is false, the node (and its subtree) is simply detached from the document.
If deleteFromDOM is true, the Node and its sub-tree is deleted from permanent DOM storage.

If deleteFromDOM is false, returns the detached Node object.


### Node-specific properties:

#### node.data

If the Node is a Text node, Comment, CDATASection node or a ProcessingInstruction node, returns the data property, otherwise 
a null string is returned.

#### node.firstChild

Returns the current node's First Child Node object, or false if it doesn't have any child nodes.

#### node.lastChild

Returns the current node's Last Child Node object, or false if it doesn't have any child nodes.

#### node.nextSibling

Returns the current node's Next Sibling Node object, or false if it doesn't have a sibling.

#### node.nodeName

Returns the current node's name property

#### node.nodeTYpe

Returns the current node's type:

- 1 = Element
- 3 = Text
- 4 = DocumentType
- 7 = Comment
- 8 = Processing Instruction
- 9 = Document Node

Note, in the EWD DOM, attributes are not represented as Nodes per se.

#### node.parentNode

Returns the current node's Parent Node object, or false if it doesn't have a parent.

#### node.previousSibling

Returns the current node's Pervious Sibling Node object, or false if the current node has no previous sibling.

#### node.publicId

if the current node is a Document Type node, returns the publicId property, if defined

#### node.systemId

if the current node is a Document Type node, returns the systemId property, if defined

#### node.tagName

If the current node is an Element, returns its tagname property

#### node.target

If the current node is a Processing Instruction, returns its target property

#### node.text

This read/write property allows you to get the text for an Element Node, or modify its value.

### Node-specific methods:

#### node.addElement(params)

Creates and attaches a new element (plus attributes and text if speficied) to the current node

This is a fast, one-shot way of adding nodes to your DOM.

Parameters are as follows:

- tagName: the Element's tagName
- attributes: optional object containing attribute name/value pairs, eg {name:'rob', city: 'reigate'}
- text: opttionally specifies the text node data for the element
- asFirstChild: true|false (default = false).  If true, the new element is added as a new First Child node.  If false, 
the new element is appended as a new Last Child node.

#### node.addText(text)

Adds a text node to the current Element

#### node.appendChild(childNode)

Attaches the specified Node as a new Last Child node and returns the child Node object.


#### node.attributeExists(attributeName)

Returns true if the current node has an attribute with the specified name

#### node.getAttribute(attributeName)

Returns the value of the specified attribute.  Null returned if the attribute doesn't exist.

#### node.getAttributes()

Returns an array of attribute objects: Object structure {name:'city', value: 'Reigate'}

#### node.getChildNodes()

Returns an array of Node objects representing the immediate child nodes of the current node.  The array elements are in child sequence order.

#### node.getDescendentNodes()

Returns an array of Node objects representing all child nodes and their ancestors under the current node.

#### node.getNextChild(childNode)

Returns the current node's next child Node.  If childNode is a null string, the node's First Child is returned.  
If childNode is the current node's Last Child node, a null string is returned.

#### node.getProperties()

Returns all the current node's properties as a JSON string, extracted directly from the Globals database represntation

#### node.hasAttributes()

Returns true if the current node has one or more attributes

#### node.hasChildNodes()

Returns true if the current node has one or more child nodes

#### node.insertBefore(newNode, existingChildNode)

Attaches the new node object as a previous sibling of the child node

#### node.insertIntermediateElement(tagName)

Creates a new Element node with the specified tagName and inserts it between the current node its current children.

#### node.insertParentElement(tagName)

Creates a new Element node with the specified tagName and inserts it between the current tag and it's current parentNode.

#### node.modifyElementText(newText)

Replaces any existing text nodes for the current Element node with the specified text

#### node.modifyTextData(newText)

Replaces the data property of the current Text node with the specified text

#### node.renameTag(newTagName)

Replaces the value of the current Element's tagName property with the specified tagName value

#### node.removeChild(childNode, deleteFromDOM)

Removes the specified Node from the document.  If deleteFromDOM is false, the Node (and its sub-tree if present) is 
simply detached from the document tree.  If deleteFromDOM is true, the node (and its sub-tree) is deleted from 
permanent DOM storage.

#### node.removeAttribute(attributeName, deleteFromDOM)

Removes the specified attribute from the current Element Node.  If deleteFromDOM is false, the attribute is 
simply detached from the document tree.  If deleteFromDOM is true, the attribute is deleted from 
permanent DOM storage.

#### node.removeAsIntermediateNode(deleteFromDOM)

Removes the current node from the document tree.  Any child nodes of the current node are moved up to become child nodes of 
what was previously the current node's parent node.  If deleteFromDOM is false, the current Node is 
simply detached from the document tree.  If deleteFromDOM is true, the current Node is deleted from 
permanent DOM storage.

#### node.setAttribute(name, value)

Adds an attribute to the current Element Node.  If the attribute already exists, its value is replaced with the new one.


## License

Copyright (c) 2011 M/Gateway Developments Ltd,
Reigate, Surrey UK.
All rights reserved.

http://www.mgateway.com
Email: rtweed@mgateway.com

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.

