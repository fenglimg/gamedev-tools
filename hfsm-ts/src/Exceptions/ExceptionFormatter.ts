namespace UnityHFSM.Exceptions {
    /**
     * 异常信息格式化工具类
     */
    export class ExceptionFormatter {
        /**
         * 格式化异常信息
         */
        public static Format(
            location?: string,
            context?: string,
            problem?: string,
            solution?: string
        ): string {
            let message = "\n";

            if (location) {
                message += `位置: ${location}\n`;
            }

            if (context) {
                message += `上下文: ${context}\n`;
            }

            if (problem) {
                message += `问题: ${problem}\n`;
            }

            if (solution) {
                message += `解决方案: ${solution}\n`;
            }

            return message;
        }
    }
} 