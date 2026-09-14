// PressFX：全局统一的按压反馈组件。
// 应用内所有主要操作按钮统一使用本组件替代 Pressable，提供轻量、克制的
// 按压响应：按下时缩放到 0.97、透明度降至 0.85，抬起时弹回，全部基于 RN 内置 Animated。
//
// 设计约定：
// - API 与 react-native Pressable 兼容：style / children / onPress / disabled 等 props 透传，
//   children 支持函数式渲染（接收 pressed 状态），用法与 Pressable 一致；
// - 动画由单个 Animated.spring 驱动一个 0-1 进度值，scale 与 opacity 均为其插值，
//   保证两者节奏完全同步；按下快速到位（无过冲），抬起带轻微回弹，感知时长在 200ms 量级；
// - disabled 时不播放任何动画，并已按下的会在禁用瞬间平滑复位；
// - useNativeDriver: true；不引入任何第三方依赖。
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import type {
  GestureResponderEvent,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  ViewStyle,
} from 'react-native';

/** 按下时的缩放比例（克制：仅 3%，避免抢戏） */
const PRESSED_SCALE = 0.97;
/** 按下时的不透明度 */
const PRESSED_OPACITY = 0.85;

/** 按下动画参数：速度快、无过冲 */
const PRESS_IN_CONFIG = { toValue: 1, speed: 18, bounciness: 0, useNativeDriver: true } as const;
/** 抬起动画参数：略带回弹的"弹回"感 */
const PRESS_OUT_CONFIG = { toValue: 0, speed: 14, bounciness: 5, useNativeDriver: true } as const;

type PressFXProps = Omit<PressableProps, 'style' | 'children'> & {
  /** 与 Pressable 不同的唯一一点：不支持函数式 style（内部动画样式自行管理），其余一致 */
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode | ((state: PressableStateCallbackType) => React.ReactNode);
};

/**
 * 全局统一按压反馈组件。用法与 Pressable 相同：
 *
 *   <PressFX style={styles.btn} onPress={handleTap} disabled={busy}>
 *     <Text>保存</Text>
 *   </PressFX>
 *
 * 也支持函数式 children 读取 pressed 状态：
 *
 *   <PressFX>{({ pressed }) => <Text style={pressed && styles.textPressed}>保存</Text>}</PressFX>
 */
export function PressFX({ style, children, disabled, onPressIn, onPressOut, ...rest }: PressFXProps) {
  /** 按压进度：0 完全抬起，1 完全按下；scale 与 opacity 都从它插值 */
  const progress = useRef(new Animated.Value(0)).current;

  const animStyle = useMemo(
    () => ({
      opacity: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, PRESSED_OPACITY],
      }),
      transform: [
        {
          scale: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [1, PRESSED_SCALE],
          }),
        },
      ],
    }),
    [progress],
  );

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      if (!disabled) {
        Animated.spring(progress, PRESS_IN_CONFIG).start();
      }
      onPressIn?.(event);
    },
    [disabled, progress, onPressIn],
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      if (!disabled) {
        Animated.spring(progress, PRESS_OUT_CONFIG).start();
      }
      onPressOut?.(event);
    },
    [disabled, progress, onPressOut],
  );

  // 禁用时不保留按压态：动画中切换到 disabled 会平滑复位
  useEffect(() => {
    if (disabled) {
      Animated.spring(progress, PRESS_OUT_CONFIG).start();
    }
  }, [disabled, progress]);

  const renderContent = (state: PressableStateCallbackType) =>
    typeof children === 'function' ? children(state) : children;

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={style}
    >
      {(state) => (
        <Animated.View style={animStyle} collapsable={false}>
          {renderContent(state)}
        </Animated.View>
      )}
    </Pressable>
  );
}

export default PressFX;
