namespace UnityHFSM {
    export namespace Inspection {
        export interface IVisitableState {
            /**
             * 接受一个可以对当前状态执行操作的访问者。
             * 此方法是访问者模式的一部分，它允许向状态机状态添加新行为
             * 而无需修改其类结构。它用于实现分层状态机的动态检查工具。
             */
            AcceptVisitor(visitor: IStateVisitor): void;
        }
    }
}