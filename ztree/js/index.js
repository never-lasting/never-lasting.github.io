// alt 18    q  81
var isAltDown = false;
var menuExpanded = true;

// 去除模板生成的头部
function onBlogLoad() {
	var iframeDoc = document.querySelector('#blog-content').contentWindow.document;
	iframeDoc.querySelector('section.page-header').remove();
	
	
	// 子页面事件反应到主页面
	$(iframeDoc).keyup(function(e) {
		if (e.keyCode == 18) {
			isAlt = false;
		}
	});
	$(iframeDoc).keydown(function(e) {
		if (e.keyCode == 18) {
			isAlt = true;
			return;
		}
		if(e.keyCode == 81 && isAlt) {
			toogleMenu();
		}
	});
}


var zTreeObj;
// zTree 的参数配置，深入使用请参考 API 文档（setting 配置详解）
var setting = {
	treeId: 'tree',
	view: {
		showLine: false,
		showIcon: false,
		selectedMulti: false,
		dblClickExpand: false,
		target: '_self',
		nodeClasses: {
			add: ['node']
		}
	},
	callback: {
		onClick: function(event, treeId, treeNode, clickFlag) {
			if (treeNode.isParent) {
				zTreeObj.expandNode(treeNode, !treeNode.open, false, true);
			} else {
				$('#blog-content').attr('src', treeNode.blogUrl);
			}


		}
	}
};

//zTree 的数据属性，深入使用请参考 API 文档（zTreeNode 节点数据详解）

$(document).ready(function() {

	// fix height
	$('.tree-div').height($('body').height() - $('section.page-header').innerHeight() - $('.searchbox').outerHeight(true) -
		15);
	$('#blog-content').height($('body').height() - $('section.page-header').innerHeight() - 15)

	zTreeObj = $.fn.zTree.init($('#treeDemo'), setting, nodes);
	zTreeObj.expandAll(true);


	// 
	var $nodes = $('a.node');
	for (var i = 0; i < $nodes.length; i++) {
		if (!$($nodes[i]).next().length) {
			$($nodes[i]).addClass('leaf')
		} else {
			$($nodes[i]).css({
				"font-size": "22px",
				"font-weight": "580"
			});
		}
	}

	$('#searchContent').keydown(function(e) {
		if (e.keyCode == 13) {
			updateTree();
		}
	});

	function updateTree() {
		var searchContent = $('#searchContent').val();
		if (!$.trim(searchContent)) {
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
		var children = node.children;
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

	var zenOn = false;

	// $('#zen').click(function(){
	// 	toggleZen(zenOn);
	// });

	// function toggleZen(zen){
	// 	if(zen){
	// 		$('#leftDiv').show();
	// 		$('#rightDiv').removeClass('col-md-12').addClass('col-md-9');
	// 		$('div.container').removeClass('container').addClass('container-fluid');
	// 		zenOn = false;
	// 	} else {
	// 		$('#leftDiv').hide();
	// 		$('#rightDiv').removeClass('col-md-9').addClass('col-md-12');
	// 		$('#blog-content').height('10000px');
	// 		$('div.container-fluid').removeClass('container-fluid').addClass('container');
	// 		zenOn = true;
	// 	}
	// }
	$(document).keyup(function(e) {
		if (e.keyCode == 18) {
			isAlt = false;
		}
	});

	$(document).keydown(function(e) {
		if (e.keyCode == 18) {
			isAlt = true;
			return;
		}
		if(e.keyCode == 81 && isAlt) {
			toogleMenu();
		}
	});
	
	// expande/collapse
	function toogleMenu(){
		if (menuExpanded) {
			zTreeObj.expandAll(false);
			menuExpanded = false;
		} else {
			zTreeObj.expandAll(true);
			menuExpanded = true;
		}
	}

})
