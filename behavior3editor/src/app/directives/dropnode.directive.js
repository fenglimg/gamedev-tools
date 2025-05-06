(function () {
  'use strict';

  angular
    .module('app')
    .directive('b3DropNode', dropNode);

  dropNode.$inject = [
    '$window'
  ];

  function dropNode($window) {
    var directive = {
      restrict: 'A',
      link: link,
    };
    return directive;

    function link(scope, element, attrs) {
      element.bind('dragover', function (e) {
        if (e.preventDefault) {
          e.preventDefault();
        }
        return false;
      });
      element.bind('drop', function (e) {
        if (e.preventDefault) {
          e.preventDefault();
        }
        if (e.stopPropagation) {
          e.stopPropagation();
        }

        // 尝试从多个来源获取节点名称
        var name;
        try {
          if (e.dataTransfer) {
            name = e.dataTransfer.getData('name') ||
              e.dataTransfer.getData('text/plain') ||
              e.dataTransfer.getData('text') ||
              e.dataTransfer.getData('application/x-behavior3');
          }
        } catch (err) { }

        // 如果无法从 dataTransfer 获取数据，尝试使用全局备份
        if (!name && $window._currentDragNode) {
          name = $window._currentDragNode;
          // 用完即删
          $window._currentDragNode = null;
        }

        if (name) {
          var project = $window.editor.project.get();
          var tree = project.trees.getSelected();
          var point = tree.view.getLocalPoint(e.clientX, e.clientY);
          tree.blocks.add(name, point.x, point.y);

          $window.editor._game.canvas.focus();
        } else {
          console.warn('未能获取拖放的节点名称');
        }
      });
    }
  }

})();
