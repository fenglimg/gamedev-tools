namespace UnityHFSM {
    /**
     * "快捷"方法
     * - 这些方法旨在减少用户需要编写的样板代码，尤其是对于简单的状态和转换。
     * - 它们通过在后台创建新的 State / Transition 实例并设置所需的字段来实现这一点。
     * - 它们还可以通过为您选择最佳类型来优化某些情况，例如为空状态使用 StateBase 而不是 State 实例。
     */
    export class StateMachineShortcuts {
        /**
         * 添加普通状态的快捷方法。
         * 它在底层创建一个新的 State 实例。=> 有关更多信息，请参见 State。
         * 对于没有逻辑的空状态，它会创建一个新的 StateBase 以获得最佳性能。
         */
        public static addState<TOwnId, TStateId, TEvent>(
            fsm: StateMachine<TOwnId, TStateId, TEvent>,
            name: TStateId,
            onEnter: (state: State<TStateId, TEvent>) => void = null,
            onLogic: (state: State<TStateId, TEvent>) => void = null,
            onExit: (state: State<TStateId, TEvent>) => void = null,
            canExit: (state: State<TStateId, TEvent>) => boolean = null,
            needsExitTime: boolean = false,
            isGhostState: boolean = false
        ): void {
            // 优化空状态
            if (onEnter == null && onLogic == null && onExit == null && canExit == null) {
                fsm.addState(name, new StateBase<TStateId>(needsExitTime, isGhostState));
                return;
            }

            fsm.addState(name, new State<TStateId, TEvent>(
                onEnter,
                onLogic,
                onExit,
                canExit,
                needsExitTime,
                isGhostState
            ));
        }

        /**
         * 添加常规状态转换的快捷方法。
         * 它在底层创建一个新的 Transition 实例。
         * 
         * 当不需要条件或回调时，它会创建一个 TransitionBase 以获得最佳性能，
         * 否则创建一个 Transition 对象。
         */
        public static addTransition<TOwnId, TStateId, TEvent>(
            fsm: StateMachine<TOwnId, TStateId, TEvent>,
            from: TStateId,
            to: TStateId,
            condition: (transition: Transition<TStateId>) => boolean = null,
            onTransition: (transition: Transition<TStateId>) => void = null,
            afterTransition: (transition: Transition<TStateId>) => void = null,
            forceInstantly: boolean = false
        ): void {
            fsm.addTransition(StateMachineShortcuts.createOptimizedTransition(
                from,
                to,
                condition,
                onTransition,
                afterTransition,
                forceInstantly
            ));
        }

        /**
         * 添加可以从任何状态发生的常规转换的快捷方法。
         * 它在底层创建一个新的 Transition 实例。
         * 
         * 当不需要条件或回调时，它会创建一个 TransitionBase 以获得最佳性能，
         * 否则创建一个 Transition 对象。
         */
        public static addTransitionFromAny<TOwnId, TStateId, TEvent>(
            fsm: StateMachine<TOwnId, TStateId, TEvent>,
            to: TStateId,
            condition: (transition: Transition<TStateId>) => boolean = null,
            onTransition: (transition: Transition<TStateId>) => void = null,
            afterTransition: (transition: Transition<TStateId>) => void = null,
            forceInstantly: boolean = false
        ): void {
            fsm.addTransitionFromAny(StateMachineShortcuts.createOptimizedTransition(
                null,
                to,
                condition,
                onTransition,
                afterTransition,
                forceInstantly
            ));
        }

        /**
         * 添加两个状态之间的新触发器转换的快捷方法，该转换仅在
         * 指定的触发器被激活时才检查。
         * 它在底层创建一个新的 Transition 实例。
         * 
         * 当不需要条件或回调时，它会创建一个 TransitionBase 以获得最佳性能，
         * 否则创建一个 Transition 对象。
         */
        public static addTriggerTransition<TOwnId, TStateId, TEvent>(
            fsm: StateMachine<TOwnId, TStateId, TEvent>,
            trigger: TEvent,
            from: TStateId,
            to: TStateId,
            condition: (transition: Transition<TStateId>) => boolean = null,
            onTransition: (transition: Transition<TStateId>) => void = null,
            afterTransition: (transition: Transition<TStateId>) => void = null,
            forceInstantly: boolean = false
        ): void {
            fsm.addTriggerTransition(trigger, StateMachineShortcuts.createOptimizedTransition(
                from,
                to,
                condition,
                onTransition,
                afterTransition,
                forceInstantly
            ));
        }

        /**
         * 添加可以从任何可能状态发生的新触发器转换的快捷方法，
         * 但仅在指定的触发器被激活时才检查。
         * 它在底层创建一个新的 Transition 实例。
         * 
         * 当不需要条件或回调时，它会创建一个 TransitionBase 以获得最佳性能，
         * 否则创建一个 Transition 对象。
         */
        public static addTriggerTransitionFromAny<TOwnId, TStateId, TEvent>(
            fsm: StateMachine<TOwnId, TStateId, TEvent>,
            trigger: TEvent,
            to: TStateId,
            condition: (transition: Transition<TStateId>) => boolean = null,
            onTransition: (transition: Transition<TStateId>) => void = null,
            afterTransition: (transition: Transition<TStateId>) => void = null,
            forceInstantly: boolean = false
        ): void {
            fsm.addTriggerTransitionFromAny(trigger, StateMachineShortcuts.createOptimizedTransition(
                null,
                to,
                condition,
                onTransition,
                afterTransition,
                forceInstantly
            ));
        }

        /**
         * 添加两个转换的快捷方法：
         * 如果转换实例的条件为真，则从"from"状态转换到"to"状态。
         * 否则，它执行相反方向的转换，即从"to"到"from"。
         * 
         * 对于反向转换，afterTransition 回调在转换之前调用，
         * onTransition 回调在之后调用。如果这不是所需的行为，
         * 则通过创建两个单独的转换来复制双向转换的行为。
         * 
         * 当不需要条件或回调时，它会创建一个 TransitionBase 以获得最佳性能，
         * 否则创建一个 Transition 对象。
         */
        public static addTwoWayTransition<TOwnId, TStateId, TEvent>(
            fsm: StateMachine<TOwnId, TStateId, TEvent>,
            from: TStateId,
            to: TStateId,
            condition: (transition: Transition<TStateId>) => boolean,
            onTransition: (transition: Transition<TStateId>) => void = null,
            afterTransition: (transition: Transition<TStateId>) => void = null,
            forceInstantly: boolean = false
        ): void {
            fsm.addTwoWayTransition(new Transition<TStateId>(
                from,
                to,
                condition,
                onTransition,
                afterTransition,
                forceInstantly
            ));
        }

        /**
         * 添加两个仅在指定触发器被激活时才检查的转换的快捷方法：
         * 如果条件函数为真，则fsm从"from"状态转换到"to"状态。
         * 否则，它执行相反方向的转换，即从"to"到"from"。
         * 
         * 当不需要条件或回调时，它会创建一个 TransitionBase 以获得最佳性能，
         * 否则创建一个 Transition 对象。
         */
        public static addTwoWayTriggerTransition<TOwnId, TStateId, TEvent>(
            fsm: StateMachine<TOwnId, TStateId, TEvent>,
            trigger: TEvent,
            from: TStateId,
            to: TStateId,
            condition: (transition: Transition<TStateId>) => boolean,
            onTransition: (transition: Transition<TStateId>) => void = null,
            afterTransition: (transition: Transition<TStateId>) => void = null,
            forceInstantly: boolean = false
        ): void {
            fsm.addTwoWayTriggerTransition(
                trigger,
                new Transition<TStateId>(
                    from,
                    to,
                    condition,
                    onTransition,
                    afterTransition,
                    forceInstantly
                )
            );
        }

        /**
         * 添加一个新的退出转换的快捷方法。
         * 它表示一个退出点，允许fsm退出并允许父fsm继续到下一个状态。
         * 它只在父fsm有待处理的转换时才检查。
         * 
         * 当不需要条件或回调时，它会创建一个 TransitionBase 以获得最佳性能，
         * 否则创建一个 Transition 对象。
         */
        public static addExitTransition<TOwnId, TStateId, TEvent>(
            fsm: StateMachine<TOwnId, TStateId, TEvent>,
            from: TStateId,
            condition: (transition: Transition<TStateId>) => boolean = null,
            onTransition: (transition: Transition<TStateId>) => void = null,
            afterTransition: (transition: Transition<TStateId>) => void = null,
            forceInstantly: boolean = false
        ): void {
            fsm.addExitTransition(StateMachineShortcuts.createOptimizedTransition(
                from,
                null,
                condition,
                onTransition,
                afterTransition,
                forceInstantly
            ));
        }

        /**
         * 添加一个可以从任何状态发生的新退出转换的快捷方法。
         * 它表示一个退出点，允许fsm退出并允许父fsm继续到下一个状态。
         * 它只在父fsm有待处理的转换时才检查。
         * 
         * 当不需要条件或回调时，它会创建一个 TransitionBase 以获得最佳性能，
         * 否则创建一个 Transition 对象。
         */
        public static addExitTransitionFromAny<TOwnId, TStateId, TEvent>(
            fsm: StateMachine<TOwnId, TStateId, TEvent>,
            condition: (transition: Transition<TStateId>) => boolean = null,
            onTransition: (transition: Transition<TStateId>) => void = null,
            afterTransition: (transition: Transition<TStateId>) => void = null,
            forceInstantly: boolean = false
        ): void {
            fsm.addExitTransitionFromAny(StateMachineShortcuts.createOptimizedTransition(
                null,
                null,
                condition,
                onTransition,
                afterTransition,
                forceInstantly
            ));
        }

        /**
         * 添加一个新的退出转换的快捷方法，该转换仅在指定的触发器被激活时才检查。
         * 它表示一个退出点，允许fsm退出并允许父fsm继续到下一个状态。
         * 它只在父fsm有待处理的转换时才检查。
         * 
         * 当不需要条件或回调时，它会创建一个 TransitionBase 以获得最佳性能，
         * 否则创建一个 Transition 对象。
         */
        public static addExitTriggerTransition<TOwnId, TStateId, TEvent>(
            fsm: StateMachine<TOwnId, TStateId, TEvent>,
            trigger: TEvent,
            from: TStateId,
            condition: (transition: Transition<TStateId>) => boolean = null,
            onTransition: (transition: Transition<TStateId>) => void = null,
            afterTransition: (transition: Transition<TStateId>) => void = null,
            forceInstantly: boolean = false
        ): void {
            fsm.addExitTriggerTransition(
                trigger,
                StateMachineShortcuts.createOptimizedTransition(
                    from,
                    null,
                    condition,
                    onTransition,
                    afterTransition,
                    forceInstantly
                )
            );
        }

        /**
         * 添加一个可以从任何可能状态发生的新退出触发器转换的快捷方法，
         * 并且仅在指定的触发器被激活时才检查。
         * 它表示一个退出点，允许fsm退出并允许父fsm继续到下一个状态。
         * 它只在父fsm有待处理的转换时才检查。
         * 
         * 当不需要条件或回调时，它会创建一个 TransitionBase 以获得最佳性能，
         * 否则创建一个 Transition 对象。
         */
        public static addExitTriggerTransitionFromAny<TOwnId, TStateId, TEvent>(
            fsm: StateMachine<TOwnId, TStateId, TEvent>,
            trigger: TEvent,
            condition: (transition: Transition<TStateId>) => boolean = null,
            onTransition: (transition: Transition<TStateId>) => void = null,
            afterTransition: (transition: Transition<TStateId>) => void = null,
            forceInstantly: boolean = false
        ): void {
            fsm.addExitTriggerTransitionFromAny(
                trigger,
                StateMachineShortcuts.createOptimizedTransition(
                    null,
                    null,
                    condition,
                    onTransition,
                    afterTransition,
                    forceInstantly
                )
            );
        }

        /**
         * 根据是否提供了条件或回调，创建优化的转换。
         * 如果没有提供条件或回调，则使用 TransitionBase，否则使用 Transition。
         */
        private static createOptimizedTransition<TStateId>(
            from: TStateId,
            to: TStateId,
            condition: (transition: Transition<TStateId>) => boolean = null,
            onTransition: (transition: Transition<TStateId>) => void = null,
            afterTransition: (transition: Transition<TStateId>) => void = null,
            forceInstantly: boolean = false
        ): TransitionBase<TStateId> {
            if (condition == null && onTransition == null && afterTransition == null) {
                let result = new TransitionBase<TStateId>();
                result.from = from;
                result.to = to;
                result.forceInstantly = forceInstantly;
                return result;
            } else {
                return new Transition<TStateId>(
                    from,
                    to,
                    condition,
                    onTransition,
                    afterTransition,
                    forceInstantly
                );
            }
        }
    }
} 