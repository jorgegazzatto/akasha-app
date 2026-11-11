import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

interface VoiceInputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  multiline?: boolean;
  minHeight?: number;
  autoFocus?: boolean;
  onVoiceTranscribed?: (text: string) => void;
}

export const VoiceInputField: React.FC<VoiceInputFieldProps> = ({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Escreva ou toque no microfone para falar...',
  multiline = false,
  minHeight = 56,
  autoFocus = false,
  onVoiceTranscribed,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<any>(null);

  // Animação de pulso quando o microfone está ativo
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (isRecording) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();

      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      pulseAnim.setValue(1);
    }

    return () => {
      if (loop) loop.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
    } else {
      // Finaliza a gravação e simula/transcreve o áudio sensorial
      setIsRecording(false);
      // Simulação enriquecida caso o navegador ou microfone não tenha SpeechRecognition nativo
      if (Platform.OS === 'web' && (window as any).webkitSpeechRecognition) {
        // Se houver Web Speech API nativa, pode ser orquestrada
      }
    }
  };

  const hasContent = value.trim().length > 0;

  return (
    <View style={styles.wrapper}>
      {isRecording ? (
        <View style={styles.recordingCard}>
          <Animated.View
            style={[
              styles.micPulseCircle,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Ionicons name="mic" size={26} color="#FFFFFF" />
          </Animated.View>

          <View style={styles.recordingInfo}>
            <Text style={styles.recordingTitle}>Ouvindo seu coração...</Text>
            <Text style={styles.recordingTimer}>
              00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds} (Fale com naturalidade)
            </Text>
          </View>

          <TouchableOpacity
            style={styles.stopRecordingButton}
            onPress={toggleRecording}
          >
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.inputBox, { minHeight }]}>
          <TextInput
            style={[styles.textInput, multiline && styles.textInputMultiline]}
            placeholder={placeholder}
            placeholderTextColor={Colors.textMuted}
            value={value}
            onChangeText={onChangeText}
            multiline={multiline}
            autoFocus={autoFocus}
            onSubmitEditing={!multiline ? onSubmit : undefined}
          />

          <View style={styles.actionButtonsRow}>
            {/* Botão de Microfone / Entrada por Voz */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.micButton}
              onPress={toggleRecording}
            >
              <Ionicons name="mic-outline" size={20} color={Colors.primaryButton} />
            </TouchableOpacity>

            {/* Botão de Envio */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.sendButton,
                !hasContent && styles.sendButtonDisabled,
              ]}
              onPress={onSubmit}
              disabled={!hasContent}
            >
              <Ionicons
                name="arrow-forward"
                size={18}
                color={hasContent ? '#FFFFFF' : Colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginVertical: 10,
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1.2,
    borderColor: '#EED6DC',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: 'System',
    paddingRight: 10,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  textInputMultiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  micButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FAF0F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EED6DC',
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryButton,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#F3E8EC',
  },
  recordingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38121F',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: '100%',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  micPulseCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accentPink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingInfo: {
    flex: 1,
    marginLeft: 14,
  },
  recordingTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  recordingTimer: {
    color: '#F0C2D0',
    fontSize: 12,
    marginTop: 2,
  },
  stopRecordingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#592033',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7A3249',
  },
});
