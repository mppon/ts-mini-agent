/** 窗口大小选项 */
export const windowSize = [200, 512, 1024] as const
export type WindowSizeValue = typeof windowSize[number]
