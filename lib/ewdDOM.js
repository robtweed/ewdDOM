// Copy cache.node to /home/rob/gdbwork/node_modules/cache.node
// Run the following from /home/rob/gdbwork using:
// node ewdDOM.js

// document: {docId: 12}
// node or element: {docId: 12, nodeId: 2}

var ewdDOM = {

  version: '0.2',

  global: 'zewdDOM',

  // APIs

  addElement: function(params) {
    // params = {tagName: xxx, parentNode: {docId:123, id: 234}, attributes: {x:1,y:'aa'}, text: text, asFirstChild: true}

    var element = '';
    if (typeof params !== 'undefined') {
      if (typeof params.parentNode !== 'undefined') {
        if (typeof params.tagName !== 'undefined') {
          if (ewdDOM.nodeExists(params.parentNode)) {
            var asFirstChild = false;
            if (typeof params.asFirstChild !== 'undefined') asFirstChild = params.asFirstChild;

            var docId = params.parentNode.docId;
            if (!asFirstChild) {
              var element = ewdDOM.createElement(params.tagName, docId);
              element = ewdDOM.appendChild(element, params.parentNode);
            }
            else {
              element = ewdDOM.insertElementAsFirstChild(params.tagName, params.parentNode);
            }
            var attrName;
            var attrValue;
            for (attrName in params.attributes) {
              attrValue = params.attributes[attrName];
              ewdDOM.setAttribute(attrName, attrValue, element);
            }
            if (typeof params.text !== 'undefined') {
              if (params.text !== '') {
                var textNode = ewdDOM.createTextNode(params.text,docId);
                textNode = ewdDOM.appendChild(textNode, element);
              }
            }
          }
        }        
      }
    }
    return element;
  },

  addText: function(text, element) {
    var textNode = ewdDOM.createTextNode(text, element.docId);
    textNode = ewdDOM.appendChild(textNode, element);
    return textNode;
  },

  appendChild: function(newChild, parent) {
    if (!ewdDOM.nodeExists(newChild)) return {error: 'The node you\'re trying to append (' + newChild.id + 'does not exist'};
    if (!ewdDOM.nodeExists(parent)) return {error: 'The parent node you\'re trying to append to (' + parent.id + 'does not exist'};
    if (newChild.docId !== parent.docId) return {error:'The node you are attempting to append belongs to a different document to the parent node'};
    var docNo = parent.docId;
    var childNodeNo = newChild.id;
    var parentNodeNo = parent.id;
    var nodeType = ewdDOM.getNodeType(newChild);
    var gnode;
    if (!ewdDOM.hasChildNodes(parent)) {
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', parentNodeNo, 'firstChild'], data: childNodeNo};
      ewdDOM.db.set(gnode);
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', parentNodeNo, 'lastChild'], data: childNodeNo};
      ewdDOM.db.set(gnode);
    }
    else {
      var lastChild = ewdDOM.getLastChild(parent);
      var lastChildNodeNo = lastChild.id;
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', parentNodeNo, 'lastChild'], data: childNodeNo};
      ewdDOM.db.set(gnode);
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', lastChildNodeNo, 'nextSibling'], data: childNodeNo};
      ewdDOM.db.set(gnode);
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', childNodeNo, 'previousSibling'], data: lastChildNodeNo};
      ewdDOM.db.set(gnode);
    }
    gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', childNodeNo, 'parent'], data: parentNodeNo};
    ewdDOM.db.set(gnode);
    var docName = ewdDOM.getDocumentName(docNo);
    gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'documentElement']};
    var documentElement = ewdDOM.db.get(gnode).data;
    if ((nodeType === 1)&&(documentElement === '')) {
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'documentElement'], data: childNodeNo};
      ewdDOM.db.set(gnode);
    }
    return newChild;
  },

  attributeExists: function(name, element) {
    if (name !== '') {
      if (element !== '') {
        if (ewdDOM.nodeExists(element)) {
          if (ewdDOM.getNodeType(element) === 1) {
            var gnode = {global: ewdDOM.global, subscripts: ['dom', element.docId, 'node', element.id, 'attrNameIndex', name]};
            var data = ewdDOM.db.data(gnode);
            if (data.defined === 0) return false;
            return true;
          }
        }
      }
    }
    return false;
  },

  cloneDocument: function(fromDocId, toDocumentName) {
    if (fromDocId !== '') {
      if (toDocId !== '') {
        if (ewdDOM.documentExists(fromDocId)) {
          if (!ewdDOM.documentNameExists(toDocumentName)) {
            var newDocument = ewdDOM.createDocument(toDocumentName);
            var toDocId = newDocument.id;
            var creationDate = newDocument.creationDate;
            var json = ewdDOM.db.retrieve({global: ewdDOM.global, subscripts: ['dom', fromDocId]}, 'object');
            //console.log("!!! " + JSON.stringify(json));
            ewdDOM.db.update({node: {global: ewdDOM.global, subscripts: ['dom', toDocId]}, object: json.object}, 'object');
            var gnode = {global: ewdDOM.global, subscripts:  ['dom', toDocId, 'creationDate'], data: creationDate};
            ewdDOM.db.set(gnode);
            gnode = {global: ewdDOM.global, subscripts:  ['dom', toDocId, 'docName'], data: toDocumentName};
            ewdDOM.db.set(gnode);
            return toDocId;
          }
        }
      }
    }
    return false;
  },

  copyNodes: function(fromNode, toDocId, parentNode, deep) {
    var nodeType = ewdDOM.getNodeType(fromNode);
    var nodeName = ewdDOM.getNodeName(fromNode);
    var newNode = '';
    switch (nodeType) {

      case 1:
        newNode = ewdDOM.createElement(nodeName, toDocId);
        if (parentNode !== '') {
          newNode = ewdDOM.appendChild(newNode, parentNode);
          if (ewdDOM.hasAttributes(fromNode)) {
            var attributes = ewdDOM.getAttributes(fromNode);
            var attr;
            for (var i=0; i < attributes.length; i++) {
              attr = attributes[i];
              ewdDOM.setAttribute(attr.name, attr.value, newNode);
            }
          }
        }
        break;

      case 3:
        var data = ewdDOM.getData(fromNode);
        newNode = ewdDOM.createTextNode(data, toDocId);
        if (parentNode !== '') {
          newNode = ewdDOM.appendChild(newNode, parentNode);
        }
        break;

      case 7:
        var data = ewdDOM.getData(fromNode);
        var target = ewdDOM.getTarget(fromNode);
        newNode = ewdDOM.createProcessingInstruction(target, data, toDocId);
        if (parentNode !== '') {
          newNode = ewdDOM.appendChild(newNode, parentNode);
        }
        break;

      case 8:
        var data = ewdDOM.getData(fromNode);
        newNode = ewdDOM.createComment(data, toDocId);
        if (parentNode !== '') {
          newNode = ewdDOM.appendChild(newNode, parentNode);
        }
        break;

      case 4:
        var data = ewdDOM.getData(fromNode);
        newNode = ewdDOM.createCDATASection(data, toDocId);
        if (parentNode !== '') {
          newNode = ewdDOM.appendChild(newNode, parentNode);
        }
        break;

      default:
        break;

    }
    if (deep) {
      var child = '';
      var node;
      do {
        child = ewdDOM.getNextChild(fromNode, child);
        if (child !== '') {
          node = ewdDOM.copyNodes(child, toDocId, newNode, deep);
        }
      } while (child !== '')
    }
    return newNode;
  },

  createCDATASection: function(data, docId) {
    var node = '';
    if (data !== '') {
      if (docId !== '') {
        if (ewdDOM.documentExists(docId)) {
          var nodeNo = ewdDOM.incrementNodeNo(docId);
          var node = {docId: docId, id: nodeNo};
          ewdDOM.setNodeType(node, 4);
          ewdDOM.setTextData(data, node);
        }
      }
    }
    return node;
  },

  createComment: function(data, docId) {
    var node = '';
    if (data !== '') {
      if (docId !== '') {
        if (ewdDOM.documentExists(docId)) {
          var nodeNo = ewdDOM.incrementNodeNo(docId);
          var node = {docId: docId, id: nodeNo};
          ewdDOM.setNodeType(node, 8);
          var gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'data'], data: data};
          ewdDOM.db.set(gnode);
        }
      }
    }
    return node;
  },

  createDocument: function(documentName) {
    if (typeof documentName === 'undefined') return {error: 'You must specify a document name'};
    if (documentName === '') return {error: 'You must specify a document name'};
    if (ewdDOM.documentNameExists(documentName)) return {error: 'A DOM named ' + documentName + " already exists"};

    var docNo = ewdDOM.getNextDOMNo();

    var node = {global: ewdDOM.global, subscripts: ['dom', docNo, 'docName'], data: documentName};
    ewdDOM.db.set(node);

    node = {global: ewdDOM.global, subscripts:  ['dom', docNo, 'creationDate'], data: new Date().getTime()};
    ewdDOM.db.set(node);

    node = {global: ewdDOM.global, subscripts: ['docNameIndex', documentName], data: docNo};
    ewdDOM.db.set(node);

    var nodeNo = ewdDOM.incrementNodeNo(docNo);

    node = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, "nodeType"], data: 9};
    ewdDOM.db.set(node);

    var document = new Document(documentName);
    return document;
  },

  createDocumentType: function(qualifiedName, publicId, systemId, docId) {
    var node = '';
    if (qualifiedName !== '') {
      if (docOID !== '') {
        if (ewdDOM.documentExists(docId)) {
          var node = ewdDOM.createNode(qualifiedName, 10, docId);
          var gnode = {global: ewdDOM.global, subscripts: ['dom', docId, 'node', node.id, 'publicId'], data:publicId};
          ewdDOM.db.set(gnode);
          var gnode = {global: ewdDOM.global, subscripts: ['dom', docId, 'node', node.id, 'systemId'], data:systemId};
          ewdDOM.db.set(gnode);
        }
      }
    }
    return node;
  },

  createElement: function(tagName, docId) {
    return ewdDOM.createNode(tagName, 1, docId);
  },

  createNode: function(nodeName, nodeType, docId) {
    var node = '';
    if (nodeName !== '') {
      if (nodeType !== '') {
        if (ewdDOM.documentExists(docId)) {
          var nodeNo = ewdDOM.incrementNodeNo(docId);
          node = {docId: docId, id: nodeNo};
          ewdDOM.setNodeType(node, nodeType);
          ewdDOM.setNodeName(node, nodeName);
        }
      }
    }
    return node;
  },

  createProcessingInstruction: function(target, data, docId) {
    var node = '';
    if (target !== '') {
      if (data !== '') {
        if (docId !== '') {
          if (ewdDOM.documentExists(docId)) {
            var nodeNo = ewdDOM.incrementNodeNo(docId);
            node = {docId: docId, id: nodeNo};
            ewdDOM.setNodeType(node, 7);
            var gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'target'], data: target};
            ewdDOM.db.set(gnode);
            var gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'data'], data: data};
            ewdDOM.db.set(gnode);
          }
        }
      }
    }
    return node;
  },

  createTextNode: function(data, docId) {
    var node = '';
    if (data !== '') {
      if (docId !== '') {
        if (ewdDOM.documentExists(docId)) {
          var nodeNo = ewdDOM.incrementNodeNo(docId);
          node = {docId: docId, id: nodeNo};
          ewdDOM.setNodeType(node, 3);
          ewdDOM.setTextData(data, node);
        }
      }
    }
    return node;
  },

  deleteFromDOM: function(node) {
    var descendants = ewdDOM.getDescendantNodes(node);
    descendants.push(node);
    var tagName;
    var nodeType;
    var gnode;
    var id;
    var descendantNode;
    var docNo = node.docId;
    for (var i=0; i < descendants.length; i++) {
      descendantNode = descendants[i];
      tagName = ewdDOM.getTagName(descendantNode);
      id = ewdDOM.getAttribute('id', descendantNode);
      nodeType = ewdDOM.getNodeType(descendantNode);
      dNodeNo = descendantNode.id;
      gnode = {global: ewdDOM.global, subscripts:  ['dom', docNo, 'node', dNodeNo]};
      ewdDOM.db.kill(gnode);
      if (tagName !== '') {
        gnode = {global: ewdDOM.global, subscripts:  ['dom', docNo, 'nodeNameIndex', tagName, dNodeNo]};
        ewdDOM.db.kill(gnode);
      }
      if (nodeType !== '') {
        gnode = {global: ewdDOM.global, subscripts:  ['dom', docNo, 'nodeTypeIndex', nodeType, dNodeNo]};
        ewdDOM.db.kill(gnode);
      }
      if (id !== '') {
        gnode = {global: ewdDOM.global, subscripts:  ['dom', docNo, 'idIndex', id]};
        ewdDOM.db.kill(gnode);
      }
    }
  },

  documentNameExists: function(documentName) {
    if (typeof documentName === 'undefined') return false;
    if (documentName === '') return false;
    var gnode = {global: ewdDOM.global, subscripts: ['docNameIndex', documentName]};
    var data = ewdDOM.db.data(gnode);
    return (data.defined === 1);
  },

  documentExists: function(docId) {
    if (docId === '') return false;
    var gnode = {global: ewdDOM.global, subscripts: ['dom', docId]};
    var data = ewdDOM.db.data(gnode);
    return (data.defined !== 0);
  },

  getAttribute: function(name, element) {
    if (name !== '') {
      if (element !== '') {
        if (ewdDOM.nodeExists(element)) {
          if (ewdDOM.getNodeType(element) === 1) {
            var nodeNo = element.id;
            var docNo = element.docId;
            if (ewdDOM.attributeExists(name, element)) {
              var gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'attrNameIndex', name]};
              var attrNodeNo = ewdDOM.db.get(gnode).data;
              gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', attrNodeNo, 'data']};
              var textNodeNo = ewdDOM.db.get(gnode).data;
              if (textNodeNo !== '') {
                gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', textNodeNo, 'data', 1]};
                return ewdDOM.db.get(gnode).data;
              }
            }
          }
        }
      }
    }
    return '';
  },

  getAttributes: function(element) {
    var attributes = [];
    if (element !== '') {
      if (ewdDOM.nodeExists(element)) {
        if (ewdDOM.getNodeType(element) === 1) {
          var nodeNo = element.id;
          var docNo = element.docId;
          var attrName = '';
          var gnode;
          var attrValue;
          do {
            gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'attrNameIndex', attrName]};
            attrName = ewdDOM.db.order(gnode).result;
            if (attrName !== '') {
              attrValue = ewdDOM.getAttribute(attrName, element);
              attributes.push({name: attrName, value: attrValue});
            }
          } while (attrName !== '')
        }
      }
    }
    return attributes;
  },

  getChildNodes: function(parent) {
    var childNodes = [];
    if (parent !== '') {
      var child = '';
      do {
        child = ewdDOM.getNextChild(parent, child);
        if (child !== '') {
          childNodes.push(child);
        }
      } while (child !== '')
    }
    return childNodes;
  },

  getData: function(node) {
    var data = '';
    if (node !== '') {
      if (ewdDOM.nodeExists(node)) {
        var nodeNo = node.id;
        var docNo = node.docId;
        var nodeType = ewdDOM.getNodeType(node);
        var gnode;
        switch (nodeType) {

          case 3:
          case 4:
            var lineNo = '';
            var text = '';
            var space = '';
            do {
              gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'data', lineNo]};
              lineNo = ewdDOM.db.order(gnode).result;
              if (lineNo !== '') {
                gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'data', lineNo]};
                text = ewdDOM.db.get(gnode).data;
                data = data + space + text;
                space = ' ';
              }
            } while (lineNo !== '')
            break;

          case 7:
          case 8:
            gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'data']};
            data = ewdDOM.db.get(gnode).data;
            break;

          default:
        }
      }
    }
    return data;
  },

  getDescendantNodes: function(node) {
    if (node !== '') {
      if (ewdDOM.nodeExists(node)) {
        var descendants = [];
        ewdDOM.getDescendants(node, descendants);
        return descendants;
      }
    }
    return [];
  },

  getDescendants: function(node, descendants) {
    var child = '';
    do {
      child = ewdDOM.getNextChild(node, child);
      if (child !== '') {
        descendants.push(child);
        ewdDOM.getDescendants(child, descendants);
      }
    } while (child !== '')
  },

  getDocument: function(documentName) {
    if (typeof documentName === 'undefined') return {error: 'No document specified'};
    if (documentName === '') return {error: 'No document specified'};
    var docId = ewdDOM.getDocumentId(documentName);
    if (docId === 0) return {error: 'Document ' + documentName + ' does not exist'};
    var document = new Document(documentName);
    return document;
  },

  getDocumentName: function(docId) {
    if (docId === '') return '';
    var gnode = {global: ewdDOM.global, subscripts: ['dom', docId]};
    var data = ewdDOM.db.data(gnode);
    if (data.defined === 0) return '';
    gnode = {global: ewdDOM.global, subscripts: ['dom', docId, 'docName']};
    return ewdDOM.db.get(gnode).data;
  },

  getDocumentId: function(documentName) {
    if (typeof documentName === 'undefined') return 0;
    if (documentName === '') return 0;
    if (!ewdDOM.documentNameExists(documentName)) return 0;

    var gnode = {global: ewdDOM.global, subscripts: ['docNameIndex', documentName]};
    var results = ewdDOM.db.get(gnode);
    return parseInt(results.data);
  },

  getDocuments: function() {
    var documents = [];
    var gnode = {global: ewdDOM.global, subscripts: ['docNameIndex']};
    var doms = ewdDOM.db.retrieve(gnode,"list");
    console.log("getDocuments: doms = " + JSON.stringify(doms));
    var docName;
    for (var i=0; i < doms.length; i++) {
      docName = doms[i];
      document = new Document(docName);
      documents.push(document);
    }
    return documents;
  },

  getDOMs: function() {
    var gnode = {global: ewdDOM.global, subscripts: ['docNameIndex']};
    return ewdDOM.db.retrieve(gnode,"list");
  },

  getElementById: function(id, docId) {
    var node = '';
    if (id !== '') {
      if (docId !== '') {
        if (ewdDOM.documentExists(docId)) {
          var gnode = {global: ewdDOM.global, subscripts: ['dom', docId, 'idIndex', id]};
          var nodeNo = ewdDOM.db.get(gnode).data;
          node = {docId: docId, id: nodeNo};
        }
      }
    }
    return node;
  },

  getElementsByTagName: function(tagName, docId) {
    var elements = [];
    if (tagName !== '') {
      if (docId !== '') {
        if (ewdDOM.documentExists(docId)) {
          var node;
          var nodeNo = '';
          do {
            var gnode = {global: ewdDOM.global, subscripts: ['dom', docId, 'nodeNameIndex', tagName, nodeNo]};
            nodeNo = ewdDOM.db.order(gnode).result;
            if (nodeNo !== '') {
              node = {docId: docId, id: nodeNo};
              if (ewdDOM.getNodeType(node) === 1) {
                elements.push(new Node(node));
              }
            }
          } while (nodeNo !== '')
        }
      }
    }
    return elements;
  },

  getElementText: function(element) {
    var text = '';
    var childNodes = ewdDOM.getChildNodes(element);
    var child;
    for (var i = 0; i < childNodes.length; i++) {
      child = childNodes[i];
      if (ewdDOM.getNodeType(child) === 3) {
        text = text + ewdDOM.getData(child);
      }
    }
    return text;
  },

  getLinkedNode: function(node, linkName) {
    if (node !== '') {
      if (linkName !== '') {
        if (ewdDOM.nodeExists(node)) {
          //console.log("node.docId = " + node.docId + ", node.id = " + node.id);
          var gnode = {global: ewdDOM.global, subscripts: ['dom', node.docId, 'node', node.id, linkName]};
          var nodeNo = ewdDOM.db.get(gnode).data;
          if (nodeNo === '') return '';
          return {docId: node.docId, id: nodeNo};
        }
      }
    }
    return '';
  },

  getFirstChild: function(node) {
    return ewdDOM.getLinkedNode(node, 'firstChild');
  },

  getLastChild: function(node) {
    return ewdDOM.getLinkedNode(node, 'lastChild');
  },

  getNextChild: function(parent, child) {
    if (parent !== '') {
      if (ewdDOM.nodeExists(parent)) {
        if (child === '') {
          return ewdDOM.getFirstChild(parent);
        }
        else {
          return ewdDOM.getNextSibling(child);
        }
      }
    }
    return '';
  },

  getNextDOMNo: function() {
    return ewdDOM.incrementDocumentNo();
  },

  getNextSibling: function(node) {
    return ewdDOM.getLinkedNode(node, 'nextSibling');
  },

  getNode: function(node) {
    var gnode = {global: ewdDOM.global, subscripts: ['dom', node.docId, 'node', node.id]};
    var json = ewdDOM.db.retrieve(gnode, "object").object;
    json.id = node.id;
    json.docId = node.docId;
    return json;
  },

  getNodeName: function(node) {
    var gnode = {global: ewdDOM.global, subscripts: ['dom', node.docId, 'node', node.id, 'nodeName']};
    return ewdDOM.db.get(gnode).data;
  },

  getNodeProperty: function(node, propertyName) {
    var value = '';
    if (node !== '') {
      if (propertyName !== '') {
        var gnode = {global: ewdDOM.global, subscripts: ['dom', node.docId, 'node', node.id, propertyName]};
        value = ewdDOM.db.get(gnode).data;
      }
    }
    return value;
  },

  getNodeType: function(node) {
    var gnode = {global: ewdDOM.global, subscripts: ['dom', node.docId, 'node', node.id, 'nodeType']};
    var nodeTypeObj = ewdDOM.db.get(gnode);
    return parseInt(nodeTypeObj.data);
  },

  getParentNode: function(node) {
    return ewdDOM.getLinkedNode(node, 'parent');
  },

  getPreviousSibling: function(node) {
    return ewdDOM.getLinkedNode(node, 'previousSibling');
  },

  getPublicId: function(node) {
    return ewdDOM.getNodeProperty(node, 'publicId');
  },

  getSystemId: function(node) {
    return ewdDOM.getNodeProperty(node, 'systemId');
  },

  getTagName: function(element) {
    return ewdDOM.getNodeName(element);
  },

  getTarget: function(node) {
    return ewdDOM.getNodeProperty(node, 'target');
  },

  hasAttributes: function(element) {
    if (element !== '') {
      if (ewdDOM.nodeExists(element)) {
        if (ewdDOM.getNodeType(element) === 1) {
          var gnode = {global: ewdDOM.global, subscripts: ['dom', element.docId, 'node', element.id, 'attr']};
          var data = ewdDOM.db.data(gnode);
          if (data.defined === 0) return false;
          return true;
        }
      }
    }
    return false;
  },

  hasChildNodes: function(node) {
    if (ewdDOM.getFirstChild(node) === '') return false;
    return true;
  },

  importNode: function(fromNode, deep, toDocId) {
    var node = '';
    if (fromNode !== '') {
      if (ewdDOM.nodeExists(fromNode)) {
        node = ewdDOM.copyNodes(fromNode, toDocId, '', deep);
      }
    }
    return node;
  },

  incrementDocumentNo: function() {
    //var node = {global: ewdDOM.global, subscripts: ['documentCounter']};
    //var nodeObj = ewdDOM.db.increment(node);
    //return parseInt(nodeObj.data);
    var gnode = {global: ewdDOM.global, subscripts: ['documentCounter']};
    var docNo = ewdDOM.db.get(gnode).data;
    if (docNo === '') {
      docNo = 1;
    }
    else {
      docNo = parseInt(docNo);
      docNo++;
    }
    gnode.data = docNo;
    ewdDOM.db.set(gnode);
    return docNo;
  },

  incrementNodeNo: function(docId) {
    //var node = {global: ewdDOM.global, subscripts: ['dom', docId, 'nodeCounter']};
    //var nodeObj = ewdDOM.db.increment(node);
    //return parseInt(nodeObj.data);
    var gnode = {global: ewdDOM.global, subscripts: ['dom', docId, 'nodeCounter']};
    var nodeNo = ewdDOM.db.get(gnode).data;
    if (nodeNo === '') {
      nodeNo = 1;
    }
    else {
      nodeNo = parseInt(nodeNo);
      nodeNo++;
    }
    gnode.data = nodeNo;
    ewdDOM.db.set(gnode);
    return nodeNo;
  },

  insertBefore: function(newNode, targetNode) {
    if (!ewdDOM.nodeExists(newNode)) return {error: 'The node you\'re trying to insert (' + newNode.id + 'does not exist'};
    if (!ewdDOM.nodeExists(targetNode)) return {error: 'The node you\'re trying to insert before (' + targetOID + 'does not exist'};
    if (newNode.docId !== targetNode.docId) return {error:'The node you are attempting to insert belongs to a different document to the target node'};
    var docNo = targetNode.docId;
    var newNodeNo = newNode.id;
    var targetNodeNo = targetNode.id;
    var parentNode = ewdDOM.getParentNode(targetNode);
    var parentNodeNo = parentNode.id;
    var previousSibling = ewdDOM.getPreviousSibling(targetNode);
    var gnode;
    if (previousSibling === '') {
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', parentNodeNo, 'firstChild'], data: newNodeNo};
      ewdDOM.db.set(gnode);
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', newNodeNo, 'nextSibling'], data: targetNodeNo};
      ewdDOM.db.set(gnode);
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', targetNodeNo, 'previousSibling'], data: newNodeNo};
      ewdDOM.db.set(gnode);
    }
    else {
      var previousSiblingNodeNo = previousSibling.id;
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', previousSiblingNodeNo, 'nextSibling'], data: newNodeNo};
      ewdDOM.db.set(gnode);
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', newNodeNo, 'previousSibling'], data: previousSiblingNodeNo};
      ewdDOM.db.set(gnode);
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', newNodeNo, 'nextSibling'], data: targetNodeNo};
      ewdDOM.db.set(gnode);
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', targetNodeNo, 'previousSibling'], data: newNodeNo};
      ewdDOM.db.set(gnode);
    }
    gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', newNodeNo, 'parent'], data: parentNodeNo};
    ewdDOM.db.set(gnode);
    return newNode;
  },

  insertElementAsFirstChild: function(tagName, parent) {
    var docId = parent.docId;
    var element = ewdDOM.createElement(tagName, docId);
    var firstChild = ewdDOM.getFirstChild(parent);
    var newNode;
    if (firstChild !== '') {
      newNode = ewdDOM.insertBefore(element, firstChild);
    }
    else {
      newNode = ewdDOM.appendChild(element, parent);
    }
    return newNode;
  },

  insertIntermediateElement: function(tagName, parent) {
    var childNodes = ewdDOM.getChildNodes(parent);
    var node;
    var xnode;
    var newNode = {
      tagName: tagName,
      parentNode: parent
    };
    var newNode = ewdDOM.addElement(newNode);
    for (var i = 0; i < childNodes.length; i++) {
      node = childNodes[i];
      xnode = ewdDOM.removeChild(node);
      xnode = ewdDOM.appendChild(node, newNode);
    }
    return newNode;
  },

  insertParentElement: function(node, parentTagName) {
    var parent = '';
    if (node != '') {
      if (ewdDOM.nodeExists(node)) {
        if (parentTagName !== '') {
          parent = ewdDOM.createElement(parentTagName, node.docId);
          parent = ewdDOM.insertBefore(parent, node);
          node = ewdDOM.removeChild(node);
          node = ewdDOM.appendChild(node, parent);
        }
      }
    }
    return parent;
  },

  modifyElementText: function(text, element) {
    var childNodes = ewdDOM.getChildNodes(element);
    var child;
    for (var i = 0; i < childNodes.length; i++) {
      child = childNodes[i];
      if (ewdDOM.getNodeType(child) === 3) {
        ewdDOM.modifyTextData(text, child);
        break;
      }
    }
  },

  modifyTextData: function(data, node) {
    if (node !== '') {
      if (ewdDOM.nodeExists(node)) {
        if (ewdDOM.getNodeType(node) === 3) {
          var docNo = node.docId;
          var nodeNo = node.id;
          var gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'data']};
          ewdDOM.db.kill(gnode);
          gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'data', 1], data: data};
          ewdDOM.db.set(gnode);
        }
      }
    }
  },

  nodeExists: function(node) {
    if (node === '') return false;
    if (typeof node !== 'object') return false;
    var docNo = node.docId;
    var nodeNo = node.id;
    if (docNo === '') return false;
    var gnode = {global: ewdDOM.global, subscripts: ['dom', docNo]};
    var data = ewdDOM.db.data(gnode);
    if (data.defined === 0) return false;
    gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo]};
    data = ewdDOM.db.data(gnode);
    if (data.defined === 0) return false;
    return true;
  },

  output: function(params, callback) {
    var node;
    if (typeof params.documentName !== 'undefined') {
      docId = ewdDOM.getDocumentId(params.documentName);
      node = {docId: docId, id: 1};
    }
    if (typeof params.node !== 'undefined') {
      node = params.node;
    }
    if (typeof params.newLine === 'undefined') params.newLine = true;
    if (typeof params.indent === 'undefined') params.indent = true;
    if (typeof params.destination === 'undefined') params.destination = 'console';

    var xml = '';
    xml = ewdDOM.outputNode(node, xml, '', params);

    if (params.destination === 'console') console.log(xml);
    if (params.destination === 'file') {
      var fileName = params.fileName;
      ewdDOM.fs.writeFile(fileName, xml, callback);
    }

  },

  outputAttrs: function(node, xml) {
    var attributes = ewdDOM.getAttributes(node);
    var attr;
    for (var i=0; i < attributes.length; i++) {
       attr = attributes[i];
       xml = xml + ' ' + attr.name + "='" + attr.value + "'";
    }
    return xml;
  },

  outputChildren: function(node, xml, indent, params) {
    var child = '';
    do {
      child = ewdDOM.getNextChild(node, child);
      if (child !== '') {
        xml = ewdDOM.outputNode(child, xml, indent, params);
      }
    } while (child !== '')
    return xml;
  },

  outputNode: function(node, xml, indent, params) {
    if (node === '') return xml;
    var lt = '<';
    var nodeType = ewdDOM.getNodeType(node);
    //console.log("outputNode " + node.id + "; nodeType: " + nodeType);
    switch (nodeType) {

      case 1:
        var tagName = ewdDOM.getTagName(node);
        if (params.indent) xml = xml + indent;
        xml = xml + lt + tagName;
        if (ewdDOM.hasAttributes(node)) {
          xml = ewdDOM.outputAttrs(node, xml);
        }
        if (!ewdDOM.hasChildNodes(node)) {
          xml = xml + ' /';
        }
        xml = xml + '>';
        if (params.newLine) xml = xml + '\r\n';
        if (ewdDOM.hasChildNodes(node)) {
          xml = ewdDOM.outputChildren(node, xml, indent + '  ', params);
          if (params.indent) xml = xml + indent;
          xml = xml + lt + '/' + tagName + '>';
          if (params.newLine) xml = xml + '\r\n';
        }
        break;

      case 3:
        var text = ewdDOM.getData(node);
        if (params.indent) xml = xml + indent;
        xml = xml + text;
        if (params.newLine) xml = xml + '\r\n';
        break;

      case 7:
        var target = ewdDOM.getTarget(node);
        var data = ewdDOM.getData(node);
        if (params.indent) xml = xml + indent;
        xml = xml + lt + '?' + target;
        if (data !== '') xml = xml + ' ' + data
        xml = xml + '?>'
        if (params.newLine) xml = xml + '\r\n';
        break;

      case 8:
        var data = ewdDOM.getData(node);
        if (params.indent) xml = xml + indent;
        xml = xml + lt + '!--' + data + ' -->';
        if (params.newLine) xml = xml + '\r\n';
        break;

      case 9:
        xml = ewdDOM.outputChildren(node, xml, indent, params);
        break;

      case 10:
        var qName = ewdDOM.getNodeName(node);
        var publicId = ewdDOM.getPublicId(node);
        var systemId = ewdDOM.getSystemId(node);
        if (params.indent) xml = xml + indent;
        xml = xml + lt + '!DOCTYPE ' + qName;
        if ((systemId !== '')&&(publicId === '')) xml = xml + ' SYSTEM "' + systemId + '"';
        if (publicId !== '') {
          xml = xml + ' PUBLIC "' + publicId + '"';
          if (systemId !== '') xml = xml + ' "' + systemId + '"';
        }
        xml = xml + '>';
        if (params.newLine) xml = xml + '\r\n';
        break;

      default:

    }
    return xml;
  },

  parse: function(fileName, documentName) {
    var parser = ewdDOM.parser;

    var trim = function(s) {
      s = s.replace(/(^\s*)|(\s*$)/gi,"");
      s = s.replace(/[ ]{2,}/gi," ");
      s = s.replace(/\n /,"\n");
      return s;
    };

    var file_buf = ewdDOM.fs.readFileSync(fileName);

    parser.ontext = function(t) {
      t = trim(t);
      if (t !== '') {
        //console.log(t);
        domNode.addText(t);
      }
    };

    parser.onopentag = function(node) {
      //console.log("opentag: " + JSON.stringify(node));
      var nodeDef = {
        tagName: node.name,
        attributes: node.attributes
      };
      var newNode = domNode.addElement(nodeDef);
      if (node.name !== 'ewd:config') domNode = newNode;
      //console.log("domNode: " + domNode.OID);
    };

    parser.onclosetag = function(node) {
      //console.log("closetag: " + JSON.stringify(node));
      domNode = domNode.getParentNode();
    };
    if (ewdDOM.documentNameExists(documentName)) ewdDOM.removeDocument(documentName);
    var document = ewdDOM.createDocument(documentName);
    var domNode = document.getDocumentNode();

    parser.write(file_buf.toString('utf8')).close();
    return document;

  },

  removeAttribute: function(name, element, deleteFromDOM) {
    if (name !== '') {
      if (element !== '') {
        if (ewdDOM.nodeExists(element)) {
          if (ewdDOM.getNodeType(element) === 1) {
            var nodeNo = element.id;
            var docNo = element.docId;
            if (ewdDOM.attributeExists(name, element)) {
              var attrValue = ewdDOM.getAttribute(name, element);
              var gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'attrNameIndex', name]};
              var attrNodeNo = ewdDOM.db.get(gnode).data;
              var attribNode = {docId: docNo, id: attrNodeNo};
              gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'attr', attrNodeNo]};
              ewdDOM.db.kill(gnode); 
              gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'attrNameIndex', name]};
              ewdDOM.db.kill(gnode);
              if ((name === 'id')&&(attrValue !== '')) {
                gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'idIndex', attrValue]};
                ewdDOM.db.kill(gnode);
              }
              if (deleteFromDOM) {
                ewdDOM.deleteFromDOM(attribNode);
              }
              else {
                gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', attrNodeNo, 'parent'], data: ''};
                ewdDOM.db.set(gnode);
              }
            }
            else {
              return {ok: false, error: 'removeAttribute: attribute (' + name + ') does not exist for element (' + elementOID + ')'};
            }
          }
          else {
            return {ok: false, error: 'removeAttribute: node (' + elementOID + ') is not an element'};
          }
        }
        else {
          return {ok: false, error: 'removeAttribute: elementOID (' + elementOID + ') does not exist'};
        }
      }
      else {
        return {ok: false, error: 'removeAttribute: elementOID must be specified'};
      }
    }
    else {
      return {ok: false, error: 'removeAttribute: Attribute name must be specified'};
    }
    return '';
  },

  removeChild: function(node, deleteFromDOM) {
    if (!ewdDOM.nodeExists(node)) return {error: 'The node you\'re trying to insert (' + node.id + 'does not exist'};
    var docNo = node.docId;
    var nodeNo = node.id;
    var parent = ewdDOM.getParentNode(node);
    var parentNodeNo = parent.id;
    var previousSibling = ewdDOM.getPreviousSibling(node);
    var previousSiblingNodeNo = previousSibling.id;
    var nextSibling = ewdDOM.getNextSibling(node);
    var nextSiblingNodeNo = nextSibling.id;
    var gnode;

    if ((previousSibling === '')&&(nextSibling === '')) {
      // node being removed is the only child node of the parent
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', parentNodeNo, 'firstChild']};
      ewdDOM.db.kill(gnode);
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', parentNodeNo, 'lastChild']};
      ewdDOM.db.kill(gnode);
    }

    if ((previousSibling === '')&&(nextSibling !== '')) {
      // node being removed is the first child
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', parentNodeNo, 'firstChild'], data: nextSiblingNodeNo};
      ewdDOM.db.set(gnode);
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nextSiblingNodeNo, 'previousSibling']};
      ewdDOM.db.kill(gnode);
    }

    if ((previousSibling !== '')&&(nextSibling === '')) {
      // node being removed is the last child
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', parentNodeNo, 'lastChild'], data: previousSiblingNodeNo};
      ewdDOM.db.set(gnode);
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', previousSiblingNodeNo, 'nextSibling']};
      ewdDOM.db.kill(gnode);
    }

    if ((previousSibling !== '')&&(nextSibling !== '')) {
      // node being removed is a middle sibling
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', previousSiblingNodeNo, 'nextSibling'], data: nextSiblingNodeNo};
      ewdDOM.db.set(gnode);
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nextSiblingNodeNo, 'previousSibling'], data: previousSiblingNodeNo};
      ewdDOM.db.set(gnode);
    }

    if (deleteFromDOM) {
      ewdDOM.deleteFromDOM(node);
      return '';
    }
    else {
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'nextSibling']};
      ewdDOM.db.kill(gnode);
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'previousSibling']};
      ewdDOM.db.kill(gnode);
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'parent']};
      ewdDOM.db.kill(gnode);
      return node;
    }

  },

  removeDocument: function(documentName) {
    if (typeof documentName === 'undefined') return {error: 'You must specify a document name'};
    if (documentName === '') return {error: 'You must specify a document name'};
    var docNo = ewdDOM.getDocumentId(documentName);
    if (docNo === 0) return {error: documentName + " is not a DOM"};

    var node = {global: ewdDOM.global, subscripts: ['docNameIndex', documentName]};
    ewdDOM.db.kill(node); 

    node = {global: ewdDOM.global, subscripts:  ['dom', docNo]};
    ewdDOM.db.kill(node);

    node = {global: ewdDOM.global, subscripts:  ['dom']};
    var data = ewdDOM.db.data(node);
    if (data.defined === 1) {
      node = {global: ewdDOM.global};
      ewdDOM.db.kill(node);
    }
  },

  removeIntermediateNode: function(node, deleteFromDOM) {
    var childNodes = ewdDOM.getChildNodes(node);
    var child;
    for (var i = 0; i < childNodes.length; i++) {
      child = childNodes[i];
      child = ewdDOM.removeChild(child);
      child = ewdDOM.insertBefore(child, node);
    }
    node = ewdDOM.removeChild(node, deleteFromDOM);
  },

  renameTag: function(element, nodeName) {
    if (element !== '') {
      if (ewdDOM.nodeExists(element)) {
        if (ewdDOM.getNodeType(element) === 1) {
          var oldName = ewdDOM.getTagName(element);
          if (oldName !== '') {
             gnode = {global: ewdDOM.global, subscripts: ['dom', element.docId, 'nodeNameIndex', oldName, element.id]};
             ewdDOM.db.kill(gnode);
          }
          ewdDOM.setNodeName(element, nodeName);
        }
      }
    }
  },

  setAttribute: function(name, value, element) {
    if (name !== '') {
      if (element !== '') {
        if (ewdDOM.nodeExists(element)) {
          if (ewdDOM.getNodeType(element) === 1) {
            var nodeNo = element.id;
            var docNo = element.docId;
            var oldValue = ewdDOM.getAttribute(name, element);
            if (oldValue !== '') ewdDOM.removeAttribute(name, element, true);
            var attribNode = ewdDOM.createNode(name, 2, docNo);
            var attrNodeNo = attribNode.id;
            var gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'attr', attrNodeNo], data: ''};
            ewdDOM.db.set(gnode);
            gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'attrNameIndex', name], data: attrNodeNo};
            ewdDOM.db.set(gnode);
            if ((name === 'id')&&(value !== '')) {
              gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'idIndex', value], data: nodeNo};
              ewdDOM.db.set(gnode);
            }
            gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', attrNodeNo, 'parent'], data: nodeNo};
            ewdDOM.db.set(gnode);
            var textNode = ewdDOM.createTextNode(value, docNo);
            var textNodeNo = textNode.id;
            gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', attrNodeNo, 'data'], data: textNodeNo};
            ewdDOM.db.set(gnode);
            gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', textNodeNo, 'parent'], data: attrNodeNo};
            ewdDOM.db.set(gnode);
            return {ok:true};
          }
          else {
            return {ok: false, error: 'setAttribute: node (' + element.id + ') is not an element'};
          }
        }
        else {
          return {ok: false, error: 'setAttribute: elementOID (' + element.id + ') does not exist'};
        }
      }
      else {
        return {ok: false, error: 'setAttribute: elementOID must be specified'};
      }
    }
    else {
      return {ok: false, error: 'setAttribute: Attribute name must be specified'};
    }
  },

  setTextData: function(data, node) {
    if (node !== '') {
      if (ewdDOM.nodeExists(node)) {
        var docNo = node.docId;
        var nodeNo = node.id;
        var gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'data', '']};
        var lineNo = ewdDOM.db.previous(gnode).result + 1;
        gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'data', lineNo], data: data};
        ewdDOM.db.set(gnode);
      }
    }
  },

  setNodeName: function(node, nodeName) {
    var docNo = node.docId;
    var nodeNo = node.id;
    var gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'nodeName'], data: nodeName};
    ewdDOM.db.set(gnode);

    if (ewdDOM.getNodeType(node) === 1) {
      gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'nodeNameIndex', nodeName, nodeNo], data: ''};
      ewdDOM.db.set(gnode);  
    }
  },

  setNodeType: function(node, nodeType) {
    var docNo = node.docId;
    var nodeNo = node.id;
    var gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'node', nodeNo, 'nodeType'], data: nodeType};
    ewdDOM.db.set(gnode);  

    gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'nodeTypeIndex', nodeType, nodeNo], data: ''};
    ewdDOM.db.set(gnode);
  }

};



var Document = function(documentName) {
    var docNo = ewdDOM.getDocumentId(documentName);

    this.id = docNo;

    this.name = documentName;

    var gnode = {global: ewdDOM.global, subscripts: ['dom', docNo, 'creationDate']};
    this.creationDate = ewdDOM.db.get(gnode).data;

    // APIs

    this.createCDataSection = function(data) {
      var node = ewdDOM.createCDATASection(data, this.id);
      if (node !== '') {
        return new Node(node);
      }
      else {
        return false;
      }
    };

    this.cloneTo = function(newDocumentName) {
      var docId = ewdDOM.cloneDocument(this.id, newDocumentName)
      if (docId) {
        return new Document(newDocumentName);
      }
      else {
        return false;
      }
    };

    this.createComment = function(data) {
      var node = ewdDOM.createComment(data, this.id);
      if (node !== '') {
        return new Node(node);
      }
      else {
        return false;
      }
    };

    this.createDocumentType = function(params) {
      var qualifiedName = '';
      if (typeof params.qualifiedName !== 'undefined') qualifiedName = params.qualifiedName;
      var publicId = '';
      if (typeof params.publicId !== 'undefined') publicId = params.publicId;
      var systemId = '';
      if (typeof params.systemId !== 'undefined') systemId = params.systemId;
      var node = ewdDOM.createDocumentType(qualifiedName, publicId, systemId, this.id);
      if (node !== '') {
        return new Node(node);
      }
      else {
        return false;
      }
    };

    this.createElement = function(tagName) {
      var node = ewdDOM.createElement(tagName, this.id);
      if (node !== '') {
        return new Node(node);
      }
      else {
        return false;
      }
    };

    this.createProcessingInstruction = function(target, data) {
      var node = ewdDOM.createProcessingInstruction(target, data, this.id);
      if (node !== '') {
        return new Node(node);
      }
      else {
        return false;
      }
    };

    this.createTextNode = function(text) {
      var node = ewdDOM.createTextNode(text, this.id);
      if (node !== '') {
        return new Node(node);
      }
      else {
        return false;
      }
    };

    this.delete = function() {
      ewdDOM.removeDocument(this.name);
    };

    this.deleteDocument = function() {
      ewdDOM.removeDocument(this.name);
    };

    this.getDocumentNode = function() {
      var node = new Node({docId: this.id, id: 1});
      return node;
    };

    this.getElementById = function(id) {
      var node = ewdDOM.getElementById(id, this.id);
      if (node !== '') {
        return new Node(node);
      }
      else {
        return false;
      }
    };

    this.getElementsByTagName = function(tagName) {
      return ewdDOM.getElementsByTagName(tagName, this.id);
    };

    this.importNode = function(node, deep) {
      var newNode = ewdDOM.importNode(node, deep, this.id);
      if (typeof newNode.id !== 'undefined') {
        return new Node(newNode);
      }
      else {
        return false;
      }
    };

    this.insertBefore = function(newNode, existingChildNode) {
      var node = ewdDOM.insertBefore(newNode, existingChildNode);
      if (!node.error) {
        return new Node(node);
      }
      else {
        return false;
      }
    };

    this.output = function(params, callback) {
      if (typeof params === 'undefined') params = {};
      params.documentName = this.name;
      ewdDOM.output(params, callback);
    };

    this.remove = function() {
      ewdDOM.removeDocument(this.name);
    };

    this.removeDocument = function() {
      ewdDOM.removeDocument(this.name);
    };

    this.removeNode = function(node, deleteFromDOM) {
      if (typeof deleteFromDOM === 'undefined') deleteFromDOM = false;
      var node = ewdDOM.removeChild(node, deleteFromDOM);
      if (node === '') return false;
      if (!node.error) {
        return new Node(node);
      }
      else {
        return false;
      }
    };
};

var Node = function(node) {

    this.id = node.id;
    this.docId = node.docId;

    // APIs

    this.addElement = function(params) {
      params.parentNode = this;
      var node = ewdDOM.addElement(params);
      //console.log("addElement: nodeOID = " + nodeOID);
      if (node !== '') {
        return new Node(node);
      }
      else {
        return false;
      }
    };

    this.addText = function(text) {
      var node = ewdDOM.addText(text, this);
      if (node !== '') {
        return new Node(node);
      }
      else {
        return false;
      }
    };

    this.appendChild = function(childNode) {
      var node = ewdDOM.appendChild(childNode, this);
      if (!node.error) {
        return new Node(node);
      }
      else {
        return false;
      }
    };

    this.attributeExists = function(attrName) {
      return ewdDOM.attributeExists(name, this);
    };

    this.getAttribute = function(name) {
      return ewdDOM.getAttribute(name, this);
    };

    this.getAttributes = function() {
      return ewdDOM.getAttributes(this);
    };

    this.getChildNodes = function() {
      var children = ewdDOM.getChildNodes(this);
      var childNodes = [];
      var node;
      for (var i = 0; i < children.length; i++) {
        node = children[i];
        childNodes.push(new Node(node));
      }
      return childNodes;
    };

    this.getData = function() {
      return ewdDOM.getData(this);
    };

    Object.defineProperty(this, 'data', {
      enumerable: false,
      configurable: false,
      get: function() {
        return ewdDOM.getData(this);
      }
    });

    this.getDescendantNodes = function() {
      var descendantNodes = ewdDOM.getDescendantNodes(this);
      var descendants = [];
      var node;
      for (var i = 0; i < descendantNodes.length; i++) {
        node = descendantNodes[i];
        descendants.push(new Node(node));
      }
      return descendants;
    };

    this.getFirstChild = function() {
      var node=ewdDOM.getFirstChild(this);
      if (node !== '') {
        return new Node(node);
      }
      else {
        return false;
      }
    };
    
    Object.defineProperty(this, 'firstChild', {
      enumerable: false,
      configurable: false,
      get: function() {
        var node = ewdDOM.getFirstChild(this);
        if (node !== '') {
          return new Node(node);
        }
        else {
          return false;
        }
      }
    });
    

    this.getLastChild = function() {
      var node=ewdDOM.getLastChild(this);
      if (node !== '') {
        return new Node(node);
      }
      else {
        return false;
      }
    };

    Object.defineProperty(this, 'lastChild', {
      enumerable: false,
      configurable: false,
      get: function() {
        var node = ewdDOM.getLastChild(this);
        if (node !== '') {
          return new Node(node);
        }
        else {
          return false;
        }
      }
    });

    this.getName = function() {
      return ewdDOM.getNodeName(this);
    };

    this.getNextChild = function(childNode) {
      var child;
      if (typeof childNode === 'undefined') childNode = '';
      if (!childNode) childNode = '';

      if (childNode === '') {
        child = '';
      }
      else {
        child = childNode;
      }
      var node = ewdDOM.getNextChild(this, child)
      if (node !== '') {
        return new Node(node);
      }
      else {
        return false;
      }
    };

    this.getNextSibling = function() {
      var node=ewdDOM.getNextSibling(this);
      if (node !== '') {
        return new Node(node);
      }
      else {
        return false;
      }
    };

    Object.defineProperty(this, 'nextSibling', {
      enumerable: false,
      configurable: false,
      get: function() {
        var node = ewdDOM.getNextSibling(this);
        if (node !== '') {
          return new Node(node);
        }
        else {
          return false;
        }
      }
    });

    this.getNodeName = function() {
      return ewdDOM.getNodeName(this);
    };

    Object.defineProperty(this, 'nodeName', {
      enumerable: false,
      configurable: false,
      get: function() {
        return ewdDOM.getNodeName(this);
      }
    });

    this.getNodeType = function() {
      return ewdDOM.getNodeType(this);
    };

    Object.defineProperty(this, 'nodeType', {
      enumerable: false,
      configurable: false,
      get: function() {
        return ewdDOM.getNodeType(this);
      }
    });

    this.getParentNode = function() {
      var node=ewdDOM.getParentNode(this);
      if (node !== '') {
        return new Node(node);
      }
      else {
        return false;
      }
    };

    Object.defineProperty(this, 'parentNode', {
      enumerable: false,
      configurable: false,
      get: function() {
        var node = ewdDOM.getParentNode(this);
        if (node !== '') {
          return new Node(node);
        }
        else {
          return false;
        }
      }
    });

    this.getPreviousSibling = function() {
      var node=ewdDOM.getPreviousSibling(this);
      if (node !== '') {
        return new Node(node);
      }
      else {
        return false;
      }
    };

    Object.defineProperty(this, 'previousSibling', {
      enumerable: false,
      configurable: false,
      get: function() {
        var node = ewdDOM.getPreviousSibling(this);
        if (node !== '') {
          return new Node(node);
        }
        else {
          return false;
        }
      }
    });

    this.getProperties = function() {
      return ewdDOM.getNode(this);
    };

    this.getPublicId = function() {
      return ewdDOM.getPublicId(this);
    };

    Object.defineProperty(this, 'publicId', {
      enumerable: false,
      configurable: false,
      get: function() {
        return ewdDOM.getPublicId(this);
      }
    });

    this.getSystemId = function() {
      return ewdDOM.getSystemId(this);
    };

    Object.defineProperty(this, 'systemId', {
      enumerable: false,
      configurable: false,
      get: function() {
        return ewdDOM.getSystemId(this);
      }
    });

    this.getTagName = function() {
      return ewdDOM.getNodeName(this);
    };

    Object.defineProperty(this, 'tagName', {
      enumerable: false,
      configurable: false,
      get: function() {
        return ewdDOM.getTagName(this);
      }
    });

    this.getTarget = function() {
      return ewdDOM.getTarget(this);
    };

    Object.defineProperty(this, 'target', {
      enumerable: false,
      configurable: false,
      get: function() {
        return ewdDOM.getTarget(this);
      }
    });

    this.getType = function() {
      return ewdDOM.getNodeType(this);
    };

    this.hasAttributes = function() {
      return ewdDOM.hasAttributes(this);
    };

    this.hasChildNodes = function() {
      return ewdDOM.hasChildNodes(this)
    };

    this.insertBefore = function(newNode, existingChildNode) {
      var node = ewdDOM.insertBefore(newNode, existingChildNode);
      if (!node.error) {
        return new Node(node);
      }
      else {
        return false;
      }
    };

    this.insertElementAsFirstChild = function(tagName) {
      // this is the parent!
      var node = ewdDOM.insertElementAsFirstChild(tagName, this);
      if (!node.error) {
        return new Node(node);
      }
      else {
        return false;
      }
    };

    this.insertIntermediateElement = function(tagName) {
      var node = ewdDOM.insertIntermediateElement(tagName, this);
      if (!node.error) {
        return new Node(node);
      }
      else {
        return false;
      }
    };

    this.insertParentElement = function(parentTagName) {
      var node = ewdDOM.insertParentElement(this, parentTagName);
      if (!node.error) {
        return new Node(node);
      }
      else {
        return false;
      }
    };

    this.modifyElementText = function(text) {
      ewdDOM.modifyElementText(text, this);
    };

    this.modifyTextData = function(data) {
      ewdDOM.modifyTextData(data, this)
    };

    this.renameTag = function(nodeName) {
      ewdDOM.renameTag(this, nodeName);
    };

    this.removeChild = function(childNode, deleteFromDOM) {
      if (typeof deleteFromDOM === 'undefined') deleteFromDOM = false;
      var node = ewdDOM.removeChild(childNode, deleteFromDOM);
      if (node === '') return false;
      if (!node.error) {
        return new Node(node);
      }
      else {
        return false;
      }
    };

    this.removeAttribute = function(name, deleteFromDOM) {
      if (typeof deleteFromDOM === 'undefined') deleteFromDOM = false;
      ewdDOM.removeAttribute(name, this, deleteFromDOM);
    };

    this.removeAsIntermediateNode = function(deleteFromDOM) {
      if (typeof deleteFromDOM === 'undefined') deleteFromDOM = true;
      ewdDOM.removeIntermediateNode(this, deleteFromDOM);
    };

    this.setAttribute = function(name,value) {
      ewdDOM.setAttribute(name, value, this);
    };

    Object.defineProperty(this, 'text', {
      enumerable: false,
      configurable: false,
      get: function() {
        return ewdDOM.getElementText(this);
      },
      set: function(text) {
        ewdDOM.modifyElementText(text, this);
      }
    });

    Object.defineProperty(this, 'textContent', {
      enumerable: false,
      configurable: false,
      get: function() {
        return ewdDOM.getElementText(this);
      }
    });

};


module.exports = {

  start: function(params, callback) {
    var fs = require("fs");

    // https://github.com/isaacs/sax-js
    // SAX-style parser for XML and HTML
    // install using npm install sax

    var sax = require("sax");
    var parser = sax.parser(false, {lowercasetags: true});

    var globals = require('cache');
    var db = new globals.Cache();
    var path = '/home/user/globals/mgr';
    if (typeof params.path !== 'undefined') path = params.path;
    var username = '_SYSTEM';
    if (typeof params.username !== 'undefined') username = params.username;
    var password = 'SYS';
    if (typeof params.password !== 'undefined') password = params.password;
    var namespace = 'USER';
    if (typeof params.namespace !== 'undefined') namespace = params.namespace;

    var connection = {
      path: path, 
      username: username, 
      password: password, 
      namespace: namespace
    };

    db.open(connection);
    ewdDOM.db = db;
    ewdDOM.fs = fs;
    ewdDOM.parser = parser;
    callback(db);
  },

  createDocument: ewdDOM.createDocument,

  documentExists: ewdDOM.documentNameExists,

  getDocument: ewdDOM.getDocument,

  getDocuments: ewdDOM.getDocuments,

  getDocumentNames: ewdDOM.getDOMs,

  parse: ewdDOM.parse,

  removeDocument: ewdDOM.removeDocument,

  version: ewdDOM.version,

};

