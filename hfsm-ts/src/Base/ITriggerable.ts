namespace UnityHFSM {
    /**
     * 可以接收事件（触发器）的状态接口，例如状态机。
     */
    export interface ITriggerable<TEvent = string> {
        /**
         * 当触发器被激活时调用。
         * @param trigger 触发器的名称/标识符
         */
        Trigger(trigger: TEvent): void;
    }
} 