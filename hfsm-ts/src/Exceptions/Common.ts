namespace UnityHFSM {
    import StateBase = UnityHFSM.StateBase;
    import StateMachineWalker = UnityHFSM.Inspection.StateMachineWalker;
    export namespace Exceptions {
        /**
                * 通用异常生成工具类
                */
        export class Common {
            /**
             * 状态机未初始化异常
             */
            public static NotInitialized<TStateId>(
                fsm: StateBase<TStateId>,
                context?: string,
                problem?: string,
                solution?: string
            ): StateMachineException {
                return this.CreateStateMachineException(
                    fsm,
                    context,
                    problem ?? "活动状态为空，因为状态机尚未初始化。",
                    solution ?? "调用 fsm.SetStartState(...) 和 fsm.Init() 或 fsm.OnEnter() 来初始化状态机。"
                );
            }

            /**
             * 状态未找到异常
             */
            public static StateNotFound<TStateId>(
                fsm: StateBase<TStateId>,
                stateName: string,
                context?: string,
                problem?: string,
                solution?: string
            ): StateMachineException {
                return this.CreateStateMachineException(
                    fsm,
                    context,
                    problem ?? `状态 "${stateName}" 尚未定义或不存在。`,
                    solution ?? "\n" +
                    "1. 检查状态名称和转换的 from/to 名称是否有拼写错误\n" +
                    "2. 在调用 Init / OnEnter / OnLogic / RequestStateChange 等方法前添加此状态"
                );
            }

            /**
             * 缺少起始状态异常
             */
            public static MissingStartState<TStateId>(
                fsm: StateBase<TStateId>,
                context?: string,
                problem?: string,
                solution?: string
            ): StateMachineException {
                return this.CreateStateMachineException(
                    fsm,
                    context,
                    problem ?? "未选择起始状态。状态机需要至少一个状态才能正常工作。",
                    solution ?? "在调用 Init() 或 OnEnter() 前，通过调用 fsm.AddState(...) 确保状态机中至少有一个状态。"
                );
            }

            /**
             * 快速索引器误用异常
             */
            public static QuickIndexerMisusedForGettingState<TStateId>(
                fsm: StateBase<TStateId>,
                stateName: string
            ): StateMachineException {
                return this.CreateStateMachineException(
                    fsm,
                    "通过索引器获取嵌套状态机",
                    "选中的状态不是状态机。",
                    "此方法仅用于快速访问嵌套状态机。要获取选中的状态，请使用 GetState(\"" + stateName + "\")"
                );
            }

            /**
             * 创建状态机异常
             */
            private static CreateStateMachineException<TStateId>(
                fsm: StateBase<TStateId>,
                context?: string,
                problem?: string,
                solution?: string
            ): StateMachineException {
                const path = StateMachineWalker.GetStringPathOfState(fsm);
                const message = ExceptionFormatter.Format(
                    `状态机 '${path}'`,
                    context,
                    problem,
                    solution
                );

                return new StateMachineException(message);
            }
        }
    }
}