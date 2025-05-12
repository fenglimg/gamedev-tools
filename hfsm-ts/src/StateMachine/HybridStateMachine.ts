namespace UnityHFSM {
    /**
     * 一种既像普通状态又像状态机的StateMachine，
     * 它允许您在执行进入、逻辑等操作时运行自定义代码，
     * 并且还会执行其活动子状态的代码
     * 它对于分层状态机特别方便，因为它允许您将子状态中的
     * 通用代码分解到HybridStateMachine中，从而消除重复代码。
     * HybridStateMachine还可以被视为围绕普通StateMachine的状态包装器/装饰器。
     */
    export class HybridStateMachine<TOwnId, TStateId, TEvent> extends StateMachine<TOwnId, TStateId, TEvent> {
        private beforeOnEnter: (machine: HybridStateMachine<TOwnId, TStateId, TEvent>) => void;
        private afterOnEnter: (machine: HybridStateMachine<TOwnId, TStateId, TEvent>) => void;
        private beforeOnLogic: (machine: HybridStateMachine<TOwnId, TStateId, TEvent>) => void;
        private afterOnLogic: (machine: HybridStateMachine<TOwnId, TStateId, TEvent>) => void;
        private beforeOnExit: (machine: HybridStateMachine<TOwnId, TStateId, TEvent>) => void;
        private afterOnExit: (machine: HybridStateMachine<TOwnId, TStateId, TEvent>) => void;

        // 延迟初始化
        private actionStorage: ActionStorage<TEvent>;

        public timer: Timer;

        /**
         * 初始化HybridStateMachine类的新实例。
         * @param beforeOnEnter 在运行子状态的OnEnter之前调用的函数。
         * @param afterOnEnter 在运行子状态的OnEnter之后调用的函数。
         * @param beforeOnLogic 在运行子状态的OnLogic之前调用的函数。
         * @param afterOnLogic 在运行子状态的OnLogic之后调用的函数。
         * @param beforeOnExit 在运行子状态的OnExit之前调用的函数。
         * @param afterOnExit 在运行子状态的OnExit之后调用的函数。
         * @param needsExitTime (仅用于分层状态):
         *    确定状态机作为父状态机的状态是否允许在转换时立即退出（false），
         *    或者它是否应该等到发生显式退出转换（true）。
         * @param isGhostState 是否是"ghost"状态（只是用来快速过渡到另一个状态的状态）。
         * @param rememberLastState (仅用于分层状态):
         *    如果为true，状态机在进入时将返回到其上次活动状态，而不是其原始起始状态。
         */
        constructor(
            beforeOnEnter: (machine: HybridStateMachine<TOwnId, TStateId, TEvent>) => void = null,
            afterOnEnter: (machine: HybridStateMachine<TOwnId, TStateId, TEvent>) => void = null,

            beforeOnLogic: (machine: HybridStateMachine<TOwnId, TStateId, TEvent>) => void = null,
            afterOnLogic: (machine: HybridStateMachine<TOwnId, TStateId, TEvent>) => void = null,

            beforeOnExit: (machine: HybridStateMachine<TOwnId, TStateId, TEvent>) => void = null,
            afterOnExit: (machine: HybridStateMachine<TOwnId, TStateId, TEvent>) => void = null,

            needsExitTime: boolean = false,
            isGhostState: boolean = false,
            rememberLastState: boolean = false
        ) {
            super(needsExitTime, isGhostState, rememberLastState);

            this.beforeOnEnter = beforeOnEnter;
            this.afterOnEnter = afterOnEnter;
            this.beforeOnLogic = beforeOnLogic;
            this.afterOnLogic = afterOnLogic;
            this.beforeOnExit = beforeOnExit;
            this.afterOnExit = afterOnExit;

            this.timer = new Timer();
        }

        public override onEnter(): void {
            this.beforeOnEnter?.call(null, this);
            super.onEnter();

            this.timer.reset();
            this.afterOnEnter?.call(null, this);
        }

        public override onLogic(): void {
            this.beforeOnLogic?.call(null, this);
            super.onLogic();
            this.afterOnLogic?.call(null, this);
        }

        public override onExit(): void {
            this.beforeOnExit?.call(null, this);
            super.onExit();
            this.afterOnExit?.call(null, this);
        }

        public override onAction(trigger: TEvent): void {
            this.actionStorage?.runAction(trigger);
            super.onAction(trigger);
        }

        public override onAction<TData>(trigger: TEvent, data: TData): void {
            this.actionStorage?.runAction<TData>(trigger, data);
            super.onAction<TData>(trigger, data);
        }

        /**
         * 添加可以用OnAction()调用的操作。操作类似于内置事件
         * OnEnter / OnLogic / ... 但由用户定义。
         * 该操作在子状态的操作之前运行。
         * @param trigger 操作的名称
         * @param action 运行操作时应调用的函数
         * @returns 自身（用于链式调用）
         */
        public addAction(trigger: TEvent, action: () => void): HybridStateMachine<TOwnId, TStateId, TEvent> {
            this.actionStorage = this.actionStorage ?? new ActionStorage<TEvent>();
            this.actionStorage.addAction(trigger, action);

            // 流畅接口
            return this;
        }

        /**
         * 添加可以用OnAction<T>()调用的操作。此重载允许您
         * 运行接受一个数据参数的函数。
         * 该操作在子状态的操作之前运行。
         * @param trigger 操作的名称
         * @param action 运行操作时应调用的函数
         * @typeparam TData 函数参数的数据类型
         * @returns 自身（用于链式调用）
         */
        public addAction<TData>(trigger: TEvent, action: (data: TData) => void): HybridStateMachine<TOwnId, TStateId, TEvent> {
            this.actionStorage = this.actionStorage ?? new ActionStorage<TEvent>();
            this.actionStorage.addAction<TData>(trigger, action);

            // 流畅接口
            return this;
        }
    }

    /**
     * @inheritdoc
     */
    export class HybridStateMachine2<TStateId, TEvent> extends HybridStateMachine<TStateId, TStateId, TEvent> {
        /**
         * @inheritdoc
         */
        constructor(
            beforeOnEnter: (machine: HybridStateMachine<TStateId, TStateId, TEvent>) => void = null,
            afterOnEnter: (machine: HybridStateMachine<TStateId, TStateId, TEvent>) => void = null,

            beforeOnLogic: (machine: HybridStateMachine<TStateId, TStateId, TEvent>) => void = null,
            afterOnLogic: (machine: HybridStateMachine<TStateId, TStateId, TEvent>) => void = null,

            beforeOnExit: (machine: HybridStateMachine<TStateId, TStateId, TEvent>) => void = null,
            afterOnExit: (machine: HybridStateMachine<TStateId, TStateId, TEvent>) => void = null,

            needsExitTime: boolean = false,
            isGhostState: boolean = false,
            rememberLastState: boolean = false
        ) {
            super(
                beforeOnEnter, afterOnEnter,
                beforeOnLogic, afterOnLogic,
                beforeOnExit, afterOnExit,
                needsExitTime,
                isGhostState,
                rememberLastState
            );
        }
    }

    /**
     * @inheritdoc
     */
    export class HybridStateMachine1<TStateId> extends HybridStateMachine<TStateId, TStateId, string> {
        /**
         * @inheritdoc
         */
        constructor(
            beforeOnEnter: (machine: HybridStateMachine<TStateId, TStateId, string>) => void = null,
            afterOnEnter: (machine: HybridStateMachine<TStateId, TStateId, string>) => void = null,

            beforeOnLogic: (machine: HybridStateMachine<TStateId, TStateId, string>) => void = null,
            afterOnLogic: (machine: HybridStateMachine<TStateId, TStateId, string>) => void = null,

            beforeOnExit: (machine: HybridStateMachine<TStateId, TStateId, string>) => void = null,
            afterOnExit: (machine: HybridStateMachine<TStateId, TStateId, string>) => void = null,

            needsExitTime: boolean = false,
            isGhostState: boolean = false,
            rememberLastState: boolean = false
        ) {
            super(
                beforeOnEnter, afterOnEnter,
                beforeOnLogic, afterOnLogic,
                beforeOnExit, afterOnExit,
                needsExitTime,
                isGhostState,
                rememberLastState
            );
        }
    }

    /**
     * @inheritdoc
     */
    export class HybridStateMachine0 extends HybridStateMachine<string, string, string> {
        /**
         * @inheritdoc
         */
        constructor(
            beforeOnEnter: (machine: HybridStateMachine<string, string, string>) => void = null,
            afterOnEnter: (machine: HybridStateMachine<string, string, string>) => void = null,

            beforeOnLogic: (machine: HybridStateMachine<string, string, string>) => void = null,
            afterOnLogic: (machine: HybridStateMachine<string, string, string>) => void = null,

            beforeOnExit: (machine: HybridStateMachine<string, string, string>) => void = null,
            afterOnExit: (machine: HybridStateMachine<string, string, string>) => void = null,

            needsExitTime: boolean = false,
            isGhostState: boolean = false,
            rememberLastState: boolean = false
        ) {
            super(
                beforeOnEnter, afterOnEnter,
                beforeOnLogic, afterOnLogic,
                beforeOnExit, afterOnExit,
                needsExitTime,
                isGhostState,
                rememberLastState
            );
        }
    }
} 