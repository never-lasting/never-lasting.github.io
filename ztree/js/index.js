var zTreeObj;
// zTree 的参数配置，深入使用请参考 API 文档（setting 配置详解）
var setting = {
	treeId : 'tree',
	view: {
		showLine: false,
		showIcon: false,
		selectedMulti: false,
		dblClickExpand: false,
		target: '_self'
	},
	callback: {
		onClick: function(event, treeId, treeNode, clickFlag) {
			zTreeObj.expandNode(treeNode, !treeNode.open, false, true);
		}
	}
};

//zTree 的数据属性，深入使用请参考 API 文档（zTreeNode 节点数据详解）

$(document).ready(function() {
	zTreeObj = $.fn.zTree.init($('#treeDemo'), setting, nodes);
	zTreeObj.expandAll(true);


	$('#searchContent').keydown(function(e) {
		if (e.keyCode == 13) {
			updateTree();
		}
	});

	function updateTree() {
		var searchContent = $('#searchContent').val();
		if(!$.trim(searchContent)){
			zTreeObj.showNodes(zTreeObj.getNodesByParam('isHidden', true));
			return;
		}
		var notMatchNodes = zTreeObj.getNodesByFilter(notMatchFilter);
		zTreeObj.showNodes(zTreeObj.getNodesByParam('isHidden', true));
		zTreeObj.hideNodes(notMatchNodes);
	}
	
	function notMatchFilter(node) {
		var searchContent = $('#searchContent').val();
		// var tag = $('#tagSelect').val();
		var children =  node.children;
		if (children) {
			for (var i = 0; i < children.length; i++) {
				var notMatch = notMatchFilter(children[i]);
				if (!notMatch) {
					return false;
				}
			}
			return true;
		}
		return node.name.toUpperCase().indexOf(searchContent.toUpperCase()) == -1;
	}
	
	
	
	
})	