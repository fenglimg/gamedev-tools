namespace UnityHFSM {
    /**
     * 定义可以对状态机的不同状态执行操作的访问者的接口。
     * 这是访问者模式的一部分，允许向现有状态类添加新行为
     * 而无需修改它们的代码。它用于实现分层状态机的动态检查工具。
     */
    import StateMachine = UnityHFSM.StateMachine;
    import StateBase = UnityHFSM.StateBase;

    export namespace Inspection {
        export interface IStateVisitor {
            /**
             * 访问状态机
             */
            VisitStateMachine<TOwnId, TStateId, TEvent>(fsm: StateMachine<TOwnId, TStateId, TEvent>): void;

            /**
             * 访问普通状态
             */
            VisitRegularState<TStateId>(state: StateBase<TStateId>): void;
        }
    }
}