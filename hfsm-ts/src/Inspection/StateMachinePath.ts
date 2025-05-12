namespace UnityHFSM {
    /**
     * 轻量级、可哈希和可比较的类型，表示层次状态机中状态的路径。
     * 它支持每个级别不同的状态ID类型。每个实例表示一个节点，
     * 该节点链接到其父节点的 StateMachinePath。
     * 
     * 与基于字符串的路径相比，此类型不会在状态名称中使用"魔术字符"时
     * 遭受意外命名冲突。
     */
    export namespace Inspection {
        export abstract class StateMachinePath {
            public static readonly Root: StateMachinePath = RootStateMachinePath.instance;

            public readonly parentPath: StateMachinePath;

            public get IsRoot(): boolean {
                return this instanceof RootStateMachinePath;
            }

            public abstract get LastNodeName(): string;

            protected constructor(parentPath: StateMachinePath) {
                this.parentPath = parentPath;
            }

            /**
             * 检查当前路径是否是给定父路径的子路径
             */
            public IsChildPathOf(parent: StateMachinePath): boolean {
                for (let ancestor = this.parentPath; ancestor != null; ancestor = ancestor.parentPath) {
                    if (ancestor === parent) {
                        return true;
                    }
                }
                return false;
            }

            public abstract GetHashCode(): number;
            public abstract Equals(other: StateMachinePath): boolean;
            public abstract toString(): string;

            /**
             * 添加新节点到路径
             */
            public Join<TStateId>(name: TStateId): StateMachinePath {
                return new StateMachinePath_Generic<TStateId>(this, name);
            }
        }

        /**
         * 表示 StateMachinePath 中的状态/状态机。
         */
        export class StateMachinePath_Generic<TStateId> extends StateMachinePath {
            public readonly name: TStateId;

            public get LastNodeName(): string {
                return this.name.toString();
            }

            constructor(name: TStateId);
            constructor(parentPath: StateMachinePath, name: TStateId);
            constructor(parentPathOrName: StateMachinePath | TStateId, name?: TStateId) {
                if (name !== undefined) {
                    super(parentPathOrName as StateMachinePath);
                    this.name = name;
                } else {
                    super(null);
                    this.name = parentPathOrName as TStateId;
                }
            }

            public toString(): string {
                return (this.parentPath?.toString() || "") + "/" + this.name.toString();
            }

            public Equals(path: StateMachinePath): boolean {
                if (path === null || !(path instanceof StateMachinePath_Generic)) {
                    return false;
                }

                const other = path as StateMachinePath_Generic<TStateId>;

                if ((this.parentPath === null && other.parentPath !== null) ||
                    (this.parentPath !== null && other.parentPath === null)) {
                    return false;
                }

                if (this.name !== other.name) {
                    return false;
                }

                return this.parentPath === null || this.parentPath.Equals(other.parentPath);
            }

            public GetHashCode(): number {
                const nameHash = typeof this.name === 'string' ? hashString(this.name) : (this.name as number);

                return this.parentPath === null
                    ? nameHash
                    : combineHash(this.parentPath.GetHashCode(), nameHash);
            }
        }

        /**
         * 表示根状态机的 StateMachinePath。
         */
        export class RootStateMachinePath extends StateMachinePath {
            public static readonly name: string = "Root";
            public static readonly instance: RootStateMachinePath = new RootStateMachinePath();

            public get LastNodeName(): string {
                return RootStateMachinePath.name;
            }

            private constructor() {
                super(null);
            }

            public GetHashCode(): number {
                return hashString(RootStateMachinePath.name);
            }

            public Equals(other: StateMachinePath): boolean {
                return other !== null && other instanceof RootStateMachinePath;
            }

            public toString(): string {
                return RootStateMachinePath.name;
            }
        }
    }

    /**
         * 简单的字符串哈希函数
         */
    function hashString(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    /**
     * 合并两个哈希值
     */
    function combineHash(h1: number, h2: number): number {
        return h1 ^ (h2 + 0x9e3779b9 + (h1 << 6) + (h1 >> 2));
    }
}