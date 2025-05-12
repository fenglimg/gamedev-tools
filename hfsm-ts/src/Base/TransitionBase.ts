namespace UnityHFSM {
    /**
     * 所有转换的基类。
     */
    export class TransitionBase<TStateId = string> implements ITransitionListener {
        public readonly from: TStateId;
        public readonly to: TStateId;

        public readonly forceInstantly: boolean;
        public isExitTransition: boolean;

        public fsm: IStateMachine<TStateId>;

        /**
         * 初始化 TransitionBase 类的新实例。
         * @param from 活动状态的名称/标识符。
         * @param to 下一个状态的名称/标识符。
         * @param forceInstantly 如果 forceInstantly 为 true，则忽略活动状态的 needsExitTime => 强制即时转换
         */
        constructor(from: TStateId, to: TStateId, forceInstantly: boolean = false) {
            this.from = from;
            this.to = to;
            this.forceInstantly = forceInstantly;
            this.isExitTransition = false;
        }

        /**
         * 在设置 fsm 等值后调用以初始化转换。
         */
        public Init(): void {
            // 默认实现为空
        }

        /**
         * 当状态机进入 from 状态时调用。
         */
        public OnEnter(): void {
            // 默认实现为空
        }

        /**
         * 调用以确定状态机是否应该转换到 to 状态。
         * @returns 如果状态机应该更改状态/转换，则为 true。
         */
        public ShouldTransition(): boolean {
            return true;
        }

        /**
         * 转换发生前调用的回调方法。
         */
        public BeforeTransition(): void {
            // 默认实现为空
        }

        /**
         * 转换发生后调用的回调方法。
         */
        public AfterTransition(): void {
            // 默认实现为空
        }
    }
} 