namespace UnityHFSM {
    export interface ITransitionListener {
        BeforeTransition(): void;
        AfterTransition(): void;
    }
} 