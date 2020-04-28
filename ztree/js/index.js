var zTreeObj;
// zTree 的参数配置，深入使用请参考 API 文档（setting 配置详解）
var setting = {

	view: {
		showLine: false,
		showIcon: false,
		selectedMulti: false,
		dblClickExpand: false
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


	// $('#searchContent').keyup(function() {
	// 	uodateTree();
	// });
	// $('#tagSelect').change(function() {
	// 	updateTree();
	// });

	function updateTree(){
		var searchContent = $('#searchContent').val();
		var tag = $('#tagSelect').val();
		
	}



	function search() {
		var searchContent = $('#searchContent').val();
		var tag = $('#tagSelect').val();
		var allNodes = zTreeObj.getNodes();
		if (!searchContent && !tag) {
			zTreeObj.showNodes(allNodes);
			return;
		}
		var searchNodes = zTreeObj.getNodesByFilter(nodeFilter, false);
		zTreeObj.hideNodes(allNodes);
		zTreeObj.showNodes(searchNodes);
	}

	function nodeFilter(node) {
		var searchContent = $('#searchContent').val();
		var tag = $('#tagSelect').val();
		if (searchContent && tag) {
			return node.name.toLocaleUpperCase().indexOf(searchContent.toLocaleUpperCase()) > -1 && node.tags ? node.tags.indexOf(tag) > -1 : false;
		}
		if (searchContent) {
			return node.name.toUpperCase().indexOf(searchContent.toUpperCase()) > -1;
		}
		return node.tags ? node.tags.indexOf(tag) > -1 : false;

	}
});
