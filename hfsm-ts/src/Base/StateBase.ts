namespace UnityHFSM {
    import IVisitableState = UnityHFSM.Inspection.IVisitableState;
    import IStateVisitor = UnityHFSM.Inspection.IStateVisitor;

    /**
     * 所有状态的基类。
     */
    export class StateBase<TStateId = string> implements IVisitableState {
        public readonly needsExitTime: boolean;
        public readonly isGhostState: boolean;
        public name: TStateId;

        public fsm: IStateTimingManager;

        /**
         * 初始化 StateBase 类的新实例。
         * @param needsExitTime 确定状态是否允许在转换时立即退出(false)，
         *                     或者状态机是否应该等待状态准备好进行状态更改(true)。
         * @param isGhostState 如果为 true，则此状态成为幽灵状态，
         *                    即状态机不希望停留的状态。这意味着如果
         *                    fsm 转换到此状态，它将立即测试所有传出转换，
         *                    而不是等待下一个 OnLogic 调用。
         */
        constructor(needsExitTime: boolean, isGhostState: boolean = false) {
            this.needsExitTime = needsExitTime;
            this.isGhostState = isGhostState;
        }

        /**
         * 在设置 name 和 fsm 等值后，调用以初始化状态。
         */
        public Init(): void {
            // 默认实现为空
        }

        /**
         * 当状态机转换到此状态（进入此状态）时调用。
         */
        public OnEnter(): void {
            // 默认实现为空
        }

        /**
         * 当此状态处于活动状态时调用。
         */
        public OnLogic(): void {
            // 默认实现为空
        }

        /**
         * 当状态机从此状态转换到另一个状态（退出此状态）时调用。
         */
        public OnExit(): void {
            // 默认实现为空
        }

        /**
         * (仅当 needsExitTime 为 true 时):
         * 当应该发生从此状态到另一个状态的状态转换时调用。
         * 如果它可以退出，应该调用 fsm.StateCanExit()
         * 如果它不能立即退出，应该稍后在 OnLogic() 等中调用 fsm.StateCanExit()。
         */
        public OnExitRequest(): void {
            // 默认实现为空
        }

        /**
         * 返回层次结构中所有活动状态的字符串表示，
         * 例如 "/Move/Jump/Falling"。
         * 相比之下，状态机的 ActiveStateName 属性只返回
         * 其活动状态的名称，而不是任何嵌套状态的名称。
         */
        public GetActiveHierarchyPath(): string {
            return this.name as string;
        }

        /**
         * 接受一个可以对当前状态执行操作的访问者。
         * 此方法是访问者模式的一部分，它允许向状态机状态添加新行为
         * 而无需修改其类结构。它用于实现分层状态机的动态检查工具。
         */
        public AcceptVisitor(visitor: IStateVisitor): void {
            visitor.VisitRegularState(this);
        }
    }
} 