import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { palette, spacing, typography } from '../tokens';

export function WelcomeScreen() {
  const [name, setName] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon name="waving-hand" size={28} color={palette.secondary} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>What should we call you?</Text>
        <Text style={styles.subtitle}>
          This stays entirely on your device. It’s just how the local AI will address you.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Cire"
          placeholderTextColor={palette.muted}
          value={name}
          onChangeText={setName}
          autoFocus={true}
          cursorColor={palette.primary}
          selectionColor={palette.secondary}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !name.trim() && styles.buttonDisabled]}
          disabled={!name.trim()}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, !name.trim() && styles.buttonTextDisabled]}>
            Continue
          </Text>
          <Icon
            name="arrow-forward"
            size={20}
            color={!name.trim() ? palette.muted : palette.surface}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: spacing.xl,
    alignItems: 'flex-start',
  },
  iconContainer: {
    backgroundColor: palette.surface,
    padding: spacing.md,
    borderRadius: 100, // Makes it a perfect circle
    elevation: 2, // Subtle MD3 shadow for Android
    shadowColor: palette.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  title: {
    color: palette.ink,
    fontSize: 34,
    fontFamily: typography.primaryBold,
    lineHeight: 42,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: palette.body,
    fontSize: 16,
    fontFamily: typography.primaryRegular,
    lineHeight: 24,
    marginBottom: spacing.xxxl,
  },
  input: {
    fontSize: 28,
    color: palette.ink,
    borderBottomWidth: 2,
    borderBottomColor: palette.primary,
    paddingVertical: spacing.md,
    fontFamily: typography.primaryMedium,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xxxl,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    backgroundColor: palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 100,
    gap: spacing.sm,
    elevation: 4,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: palette.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    color: palette.surface,
    fontSize: 16,
    fontFamily: typography.primaryMedium,
  },
  buttonTextDisabled: {
    color: palette.muted,
  },
});