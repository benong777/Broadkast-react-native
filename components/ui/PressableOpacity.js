import React from 'react'
import { Pressable, Animated, PressableProps, ViewProps } from 'react-native'

export function PressableOpacity({ children, rootStyle, ...props }) {
  const animated = React.useRef(new Animated.Value(1))

  const fadeIn = React.useCallback(() => {
    Animated.timing(animated.current, {
      toValue: 0.4,
      duration: 100,
      useNativeDriver: true,
    }).start()
  }, [])

  const fadeOut = React.useCallback(() => {
    Animated.timing(animated.current, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }, [])

  return (
    <Animated.View style={[{ opacity: animated.current }, rootStyle]}>
      <Pressable onPressIn={fadeIn} onPressOut={fadeOut} {...props}>
        {children}
      </Pressable>
    </Animated.View>
  )
}
