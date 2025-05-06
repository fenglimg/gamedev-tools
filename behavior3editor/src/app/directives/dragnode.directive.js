(function() {
  'use strict';

  angular
    .module('app')
    .directive('b3DragNode', dragNode);

  dragNode.$inject = [
    '$window'
  ];

  function dragNode($window) {
    var directive = {
      restrict    : 'A',
      link        : link,
    };
    return directive;

    function link(scope, element, attrs) {
      // 使用原生 DOM 属性
      var el = element[0];
      el.draggable = true;
      
      element.on('mousedown', function(e) {
        // 在鼠标点击时准备数据，避免 dataTransfer 问题
        scope.nodeToDrag = attrs.name;
      });
      
      element.on('dragstart', function(e) {
        if (!e.dataTransfer) {
          console.warn('使用替代方法传递拖拽数据');
          // 在全局变量中存储拖拽数据
          $window._currentDragNode = scope.nodeToDrag || attrs.name;
          
          // 尝试设置一个基本的拖拽图像
          var canvas = $window.editor.preview(attrs.name);
          if (canvas && e.dataTransfer) {
            try {
              e.dataTransfer.setDragImage(canvas, canvas.width/2, canvas.height/2);
            } catch (imgErr) {}
          }
          return;
        }
        
        try {
          // 设置常规数据
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', attrs.name);
          
          // 尝试存储多种格式
          try { e.dataTransfer.setData('name', attrs.name); } catch(err1) {}
          try { e.dataTransfer.setData('text', attrs.name); } catch(err2) {}
          try { e.dataTransfer.setData('application/x-behavior3', attrs.name); } catch(err3) {}
          
          // 设置全局备份
          $window._currentDragNode = attrs.name;
          
          // 设置拖拽图像
          var dragCanvas = $window.editor.preview(attrs.name);
          if (dragCanvas) {
            try {
              e.dataTransfer.setDragImage(dragCanvas, dragCanvas.width/2, dragCanvas.height/2);
            } catch (imgErr) {}
          }
        } catch (err) {
          console.warn('使用备用拖拽方式');
          $window._currentDragNode = attrs.name;
        }
      });
    }
  }

})();


// .directive('draggableNode', function($window) {
//   return {
//     restrict: 'A',
//     link: function(scope, element, attributes, controller) {
//       angular.element(element).attr("draggable", "true");
//       element.bind("dragstart", function(e) {
//         var img = $window.app.editor.preview(attributes.id.replace('node-', ''));
  
//         e.dataTransfer.setData('text', attributes.id);
//         e.dataTransfer.setDragImage(img, img.width/2, img.height/2);
//       });
//     }
//   }
// })
