/*
 * email: bigablecat@hotmail.com
 * Date: 2018-04-14
 */

/**
 * @param zTreeId the ztree id used to get the ztree object
 * @param searchField selector of your input for fuzzy search
 * @param isHighLight whether highlight the match words, default true
 * @param isExpand whether to expand the node, default false
 *
 * @returns
 */
let zTreeObj
const isHighLight = false // 设置为true变更名称会出现span标签，不太合适
const isExpand = true
const fuzzySearch = (zTreeId) => {
  zTreeObj = $.fn.zTree.getZTreeObj(zTreeId);//get the ztree object by ztree id
  if ( !zTreeObj ) {
    console.info("fail to get ztree object");
  }
  zTreeObj.setting.view.nameIsHTML = isHighLight; //allow use html in node name for highlight use
}

// keywords filter function
const searchNodeLazy = _keywords => {
  if ( !_keywords ) {
    _keywords = ''; //default blank for _keywords
  }

  // function to find the matching node
  function filterFunc(node) {
    const metaChar = '[\\[\\]\\\\\^\\$\\.\\|\\?\\*\\+\\(\\)]'; //js meta characters
    const rexMeta = new RegExp(metaChar, 'gi');//regular expression to match meta characters
    const nameKey = zTreeObj.setting.data.key.name; //get the key of the node name
    if ( node && node.oldname && node.oldname.length > 0 ) {
      node[nameKey] = node.oldname; //recover oldname of the node if exist
    }
    zTreeObj.updateNode(node); //update node to for modifications take effect
    if ( _keywords.length == 0 ) {
      //return true to show all nodes if the keyword is blank
      zTreeObj.showNode(node);
      zTreeObj.expandNode(node, isExpand);
      return true;
    }
    //transform node name and keywords to lowercase
    if ( node[nameKey] && node[nameKey].toLowerCase().indexOf(_keywords.toLowerCase()) != -1 ) {
      if ( isHighLight ) { //highlight process
        //a new variable 'newKeywords' created to store the keywords information
        //keep the parameter '_keywords' as initial and it will be used in next node
        //process the meta characters in _keywords thus the RegExp can be correctly used in str.replace
        var newKeywords = _keywords.replace(rexMeta, function (matchStr) {
          //add escape character before meta characters
          return '\\' + matchStr;
        });
        node.oldname = node[nameKey]; //store the old name
        var rexGlobal = new RegExp(newKeywords, 'gi');//'g' for global,'i' for ignore case
        //use replace(RegExp,replacement) since replace(/substr/g,replacement) cannot be used here
        node[nameKey] = node.oldname.replace(rexGlobal, function (originalText) {
          //highlight the matching words in node name
          var highLightText =
            '<span style="color: whitesmoke;background-color: darkred;">'
            + originalText
            + '</span>';
          return highLightText;
        });
        zTreeObj.updateNode(node); //update node for modifications take effect
      }
      zTreeObj.showNode(node);//show node with matching keywords
      return true; //return true and show this node
    }

    zTreeObj.hideNode(node); // hide node that not matched
    return false; //return false for node not matched
  }

  var nodesShow = zTreeObj.getNodesByFilter(filterFunc); //get all nodes that would be shown
  processShowNodes(nodesShow, _keywords);//nodes should be reprocessed to show correctly
}

/**
 * reprocess of nodes before showing
 */
const processShowNodes = (nodesShow, _keywords) => {
  if ( nodesShow && nodesShow.length > 0 ) {
    //process the ancient nodes if _keywords is not blank
    if ( _keywords.length > 0 ) {
      $.each(nodesShow, function (n, obj) {
        var pathOfOne = obj.getPath();//get all the ancient nodes including current node
        if ( pathOfOne && pathOfOne.length > 0 ) {
          //i < pathOfOne.length-1 process every node in path except self
          for( var i = 0; i < pathOfOne.length - 1; i++ ) {
            zTreeObj.showNode(pathOfOne[i]); //show node
            zTreeObj.expandNode(pathOfOne[i], true); //expand node
          }
        }
      });
    } else { //show all nodes when _keywords is blank and expand the root nodes
      var rootNodes = zTreeObj.getNodesByParam('level', '0');//get all root nodes
      $.each(rootNodes, function (n, obj) {
        zTreeObj.expandNode(obj, true); //expand all root nodes
      });
    }
  }
}

export { fuzzySearch, searchNodeLazy }
