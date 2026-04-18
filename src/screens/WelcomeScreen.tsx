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
import { useNavigation } from '@react-navigation/native';
import { palette, spacing, typography } from '../tokens';
import { useWalletStore } from '../store/useWalletStore';

export function WelcomeScreen() {
  const [name, setName] = useState('');
  const navigation = useNavigation<any>();
  const setUserName = useWalletStore((state) => state.setUserName);

  const handleContinue = () => {
    setUserName(name.trim()); // Persists to SQLite — next launch skips Welcome
    navigation.replace('MainTabs');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>What should we call you?</Text>
        <Text style={styles.subtitle}>
          This stays entirely on your device. It’s just how the local AI will address you.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Sayr"
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
          onPress={handleContinue}
        >
          <Text style={[styles.buttonText, !name.trim() && styles.buttonTextDisabled]}>
            Continue
          </Text>
          <Icon
            name="arrow-forward"
            size={24}
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 140,
  },
  title: {
    color: palette.ink,
    fontSize: 36,
    fontFamily: typography.primaryBold,
    lineHeight: 44,
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
    fontSize: 32,
    color: palette.ink,
    borderBottomWidth: 2,
    borderBottomColor: palette.primary,
    paddingVertical: spacing.md,
    fontFamily: typography.primaryBold,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xxxl,
    flexDirection: 'row',
    justifyContent: 'flex-end', // Pushes the button to the bottom right
    width: '100%',
  },
  button: {
    backgroundColor: palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32, // Gives the button a distinct pill shape without stretching it
    borderRadius: 32,
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
    fontSize: 18,
    fontFamily: typography.primaryBold,
  },
  buttonTextDisabled: {
    color: palette.muted,
  },
});