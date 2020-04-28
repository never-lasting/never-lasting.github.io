var zTreeObj;
// zTree 的参数配置，深入使用请参考 API 文档（setting 配置详解）
var setting = {
	
	view : {
		showLine : false,
		showIcon : false,
		selectedMulti : false
	}
};

//zTree 的数据属性，深入使用请参考 API 文档（zTreeNode 节点数据详解）

$(document).ready(function(){
    zTreeObj = $.fn.zTree.init($("#treeDemo"), setting, nodes);
	zTreeObj.expandAll(true);
});