namespace UnityHFSM {
    import StateMachine = UnityHFSM.StateMachine;
    /**
     * 通过 StateMachineWalker 递归遍历状态机状态的对象接口。
     */
    export namespace Inspection {


        export interface IStateMachineHierarchyVisitor {
            /**
             * 访问状态机
             */
            VisitStateMachine<TOwnId, TStateId, TEvent>(
                fsmPath: StateMachinePath,
                fsm: StateMachine<TOwnId, TStateId, TEvent>
            ): void;

            /**
             * 访问普通状态
             */
            VisitRegularState<TStateId>(
                statePath: StateMachinePath,
                state: StateBase<TStateId>
            ): void;

            /**
             * 当当前状态机及其所有子状态（和子状态机）都被访问后调用。
             */
            ExitStateMachine<TOwnId, TStateId, TEvent>(
                fsmPath: StateMachinePath,
                fsm: StateMachine<TOwnId, TStateId, TEvent>
            ): void;
        }
    }
}