import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'

import { colors } from '../../utils/colorsUtil'

function getInitials(name) {
  const parts = name?.split(' ')
  if (parts?.length === 1 && name?.length > 1) {
    return `${name[0]}${name[1]}`.toUpperCase()
  }

  const initials = parts?.map((part) => part?.[0])?.join('')
  return initials?.toUpperCase() || ''
}

export function Avatar({ name, size = 50, imageUrl, style }) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Text style={[styles.text]} allowFontScaling={false}>
          {getInitials(name)}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.seaBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.darkBlue2,
    fontWeight: '500',
  },
})
