namespace UnityHFSM {
    /**
     * 支持自定义操作的状态接口。操作类似于
     * 内置事件 OnEnter / OnLogic / ... 但由用户定义。
     */
    export interface IActionable<TEvent = string> {
        OnAction(trigger: TEvent): void;
        OnAction<TData>(trigger: TEvent, data: TData): void;
    }
}