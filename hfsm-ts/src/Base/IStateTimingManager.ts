namespace UnityHFSM {
    /**
     * 提供每个父状态机必须提供的功能子集的抽象层，
     * 以实现转换的计时机制。
     * 它很有用，因为它允许父状态机可互换且独立于
     * 子状态的实现细节。
     * 
     * 特别是，这意味着子状态不必提供其父状态机
     * 所需的全部泛型类型参数。
     * 否则，具有每个层级不同类型的分层状态机将
     * 无法实现。
     */
    export interface IStateTimingManager {
        /**
         * 继承自 StateMachine.StateCanExit
         */
        StateCanExit(): void;

        HasPendingTransition: boolean;

        ParentFsm: IStateTimingManager;
    }
} 