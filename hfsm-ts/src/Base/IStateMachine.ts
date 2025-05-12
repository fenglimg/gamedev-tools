namespace UnityHFSM {
    /**
     * 提供每个父状态机必须提供的功能子集的抽象层，
     * 以实现转换的计时机制。除了 IStateTimingManager 提供的方法外，
     * 这个接口还提供对当前和待处理状态的访问，这对转换很有用。
     */
    export interface IStateMachine<TStateId> extends IStateTimingManager {
        /**
         * 挂起的（延迟的）转换的目标状态。
         * 如果没有待处理的转换或待处理退出转换时返回 null。
         */
        PendingState: StateBase<TStateId>;

        /**
         * @inheritdoc PendingState
         */
        PendingStateName: TStateId;

        /**
         * 状态机的当前活动状态。
         * 
         * 注意，当一个状态"活动"时，"ActiveState"可能不会返回对该状态的引用。
         * 根据使用的类，它可能例如返回对包装状态的引用。
         */
        ActiveState: StateBase<TStateId>;

        /**
         * @inheritdoc ActiveState
         */
        ActiveStateName: TStateId;

        GetState(name: TStateId): StateBase<TStateId>;
    }
} 