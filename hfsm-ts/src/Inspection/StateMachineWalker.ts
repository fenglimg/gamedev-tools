namespace UnityHFSM {
    export namespace Inspection {
        /**
         * 用于遍历层次状态机的实用工具类。
         */
        export class StateMachineWalker {
            /**
             * 递归遍历层次结构，访问每个状态。
             */
            private static HierarchyWalker = class implements IStateVisitor {
                private path: StateMachinePath;
                private readonly hierarchyVisitor: IStateMachineHierarchyVisitor;

                constructor(hierarchyVisitor: IStateMachineHierarchyVisitor) {
                    this.hierarchyVisitor = hierarchyVisitor;
                }

                public VisitStateMachine<TOwnId, TStateId, TEvent>(fsm: StateMachine<TOwnId, TStateId, TEvent>): void {
                    // 将此状态机推入路径
                    this.path = this.path == null
                        ? StateMachinePath.Root
                        : new StateMachinePath_Generic<TOwnId>(this.path, fsm.name);

                    this.hierarchyVisitor.VisitStateMachine(this.path, fsm);

                    for (const state of fsm.GetAllStates()) {
                        state.AcceptVisitor(this);
                    }

                    this.hierarchyVisitor.ExitStateMachine(this.path, fsm);

                    // 从路径中弹出状态机
                    this.path = this.path.parentPath;
                }

                public VisitRegularState<TStateId>(state: StateBase<TStateId>): void {
                    const statePath = new StateMachinePath_Generic<TStateId>(this.path, state.name);
                    this.hierarchyVisitor.VisitRegularState(statePath, state);
                }
            };

            /**
             * 提取到活动状态的路径。
             */
            private static ActiveStateVisitor = class implements IStateVisitor {
                public activePath: StateMachinePath;

                public VisitStateMachine<TOwnId, TStateId, TEvent>(fsm: StateMachine<TOwnId, TStateId, TEvent>): void {
                    this.activePath = this.activePath == null
                        ? StateMachinePath.Root
                        : new StateMachinePath_Generic<TOwnId>(this.activePath, fsm.name);

                    fsm.ActiveState.AcceptVisitor(this);
                }

                public VisitRegularState<TStateId>(state: StateBase<TStateId>): void {
                    this.activePath = new StateMachinePath_Generic<TStateId>(this.activePath, state.name);
                }
            };

            /**
             * 从根提取到给定状态的路径。
             */
            private static StatePathExtractor = class <TStartStateId> implements IStateVisitor {
                public path: StateMachinePath;

                constructor(state: StateBase<TStartStateId>) {
                    this.VisitParent(state.fsm);
                    state.AcceptVisitor(this);
                }

                private VisitParent(parent: IStateTimingManager): void {
                    if (parent == null)
                        return;

                    // 构造从根到此状态父级的路径
                    this.VisitParent(parent.ParentFsm);
                    // 将此状态添加到路径
                    (parent as unknown as IVisitableState)?.AcceptVisitor(this);
                }

                public VisitStateMachine<TOwnId, TStateId, TEvent>(fsm: StateMachine<TOwnId, TStateId, TEvent>): void {
                    if (fsm.IsRootFsm) {
                        this.path = StateMachinePath.Root;
                    } else {
                        this.AddToPath(fsm.name);
                    }
                }

                public VisitRegularState<TStateId>(state: StateBase<TStateId>): void {
                    this.AddToPath(state.name);
                }

                private AddToPath<TStateId>(name: TStateId): void {
                    this.path = this.path == null
                        ? new StateMachinePath_Generic<TStateId>(name)
                        : new StateMachinePath_Generic<TStateId>(this.path, name);
                }
            };

            /**
             * StatePathExtractor 的优化变体，仅当需要字符串路径时使用。
             */
            private static StringStatePathExtractor = class <TStartStateId> implements IStateVisitor {
                public path: string;

                constructor(state: StateBase<TStartStateId>) {
                    this.VisitParent(state.fsm);
                    state.AcceptVisitor(this);
                }

                private VisitParent(parent: IStateTimingManager): void {
                    if (parent == null)
                        return;

                    // 构造从根到此状态父级的路径
                    this.VisitParent(parent.ParentFsm);
                    // 将此状态添加到路径
                    (parent as unknown as IVisitableState)?.AcceptVisitor(this);
                }

                public VisitStateMachine<TOwnId, TStateId, TEvent>(fsm: StateMachine<TOwnId, TStateId, TEvent>): void {
                    if (fsm.IsRootFsm) {
                        this.path = RootStateMachinePath.name;
                    } else {
                        this.AddToPath(fsm.name);
                    }
                }

                public VisitRegularState<TStateId>(state: StateBase<TStateId>): void {
                    this.AddToPath(state.name);
                }

                private AddToPath<TStateId>(name: TStateId): void {
                    this.path = this.path == null
                        ? name.toString()
                        : this.path + "/" + name;
                }
            };

            /**
             * 以前序方式递归遍历状态机，在每个状态机/子状态/子状态机上调用访问者方法。
             */
            public static Walk<TOwnId, TStateId, TEvent>(
                fsm: StateMachine<TOwnId, TStateId, TEvent>,
                visitor: IStateMachineHierarchyVisitor
            ): void {
                new StateMachineWalker.HierarchyWalker(visitor).VisitStateMachine(fsm);
            }

            /**
             * 获取层次结构中最低活动状态的路径。
             */
            public static GetActiveStatePath<TOwnId, TStateId, TEvent>(
                fsm: StateMachine<TOwnId, TStateId, TEvent>
            ): StateMachinePath {
                const visitor = new StateMachineWalker.ActiveStateVisitor();
                visitor.VisitStateMachine(fsm);
                return visitor.activePath;
            }

            /**
             * 获取从根状态机到给定状态的路径。
             */
            public static GetPathOfState<TStateId>(state: StateBase<TStateId>): StateMachinePath {
                const visitor = new StateMachineWalker.StatePathExtractor<TStateId>(state);
                return visitor.path;
            }

            /**
             * GetPathOfState 方法的优化变体，返回从根状态机到给定状态的字符串路径。
             */
            public static GetStringPathOfState<TStateId>(state: StateBase<TStateId>): string {
                const visitor = new StateMachineWalker.StringStatePathExtractor<TStateId>(state);
                return visitor.path;
            }
        }
    }
}