namespace UnityHFSM.Exceptions {
    /**
     * 状态机专用异常类
     */
    export class StateMachineException extends Error {
        constructor(message: string) {
            super(message);
            this.name = "StateMachineException";
        }
    }
}