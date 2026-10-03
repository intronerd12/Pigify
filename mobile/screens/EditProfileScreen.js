import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { Text, TextInput, ActivityIndicator, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { updateUser, uploadUserAvatar } from '../services/api';

const THEME = {
  bg: '#060911',
  cardBg: '#0f172a',
  border: 'rgba(255, 255, 255, 0.08)',
  primary: '#f43f5e',
  rose: '#fb7185',
  emerald: '#10b981',
  cyan: '#06b6d4',
  amber: '#f59e0b',
  text: '#f8fafc',
  textSub: '#94a3b8',
  textMuted: '#64748b',
};

export default function EditProfileScreen({ route, navigation, onUpdateUser }) {
  const user = route.params?.user || {};
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(user?.name || user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [farmName, setFarmName] = useState(user?.farmName || 'Laguna Swine Bio-Facility');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        'Permission Required',
        'Camera roll permission is needed to update your operator badge photo.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Operator name cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      let currentAvatarUrl = user.avatar;

      if (avatar && avatar !== user.avatar && !avatar.startsWith('http')) {
        try {
          const uploadResult = await uploadUserAvatar(user._id || user.id, avatar);
          if (uploadResult?.avatar) {
            currentAvatarUrl = uploadResult.avatar;
          }
        } catch (uploadErr) {
          console.warn('Avatar upload fallback to local URI:', uploadErr?.message);
          currentAvatarUrl = avatar;
        }
      }

      const updateData = {
        name: name.trim(),
        email: email.trim(),
        farmName: farmName.trim(),
        avatar: currentAvatarUrl,
      };

      let finalUser = { ...user, ...updateData };
      try {
        if (user._id || user.id) {
          finalUser = await updateUser(user._id || user.id, updateData);
        }
      } catch (apiErr) {
        console.warn('Backend sync failed, saving locally:', apiErr?.message);
      }

      if (typeof onUpdateUser === 'function') {
        await onUpdateUser(finalUser);
      }

      Alert.alert('Success', 'Operator profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to update operator profile.');
    } finally {
      setLoading(false);
    }
  };

  const initialLetter = name ? name.charAt(0).toUpperCase() : 'O';

  return (
    <View style={styles.container}>
      {/* Top Cyber Telemetry Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#f8fafc" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <View style={styles.brandRow}>
              <View style={styles.pulsingDot} />
              <Text style={styles.brandSubtitle}>OPERATOR CREDENTIAL MANAGEMENT</Text>
            </View>
            <Text style={styles.headerTitle}>Edit Operator Profile</Text>
          </View>
          <View style={{ width: 38 }} />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar & Operator Badge Photo Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer} activeOpacity={0.85}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarLetter}>{initialLetter}</Text>
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={17} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.changePhotoText}>Update Clinical Badge Photo</Text>
            <Text style={styles.roleSubtext}>Pigify Clinical Operator • Level II Diagnostics</Text>
          </View>

          {/* Form Fields Section */}
          <Surface style={styles.formSection} elevation={0}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>OPERATOR FULL NAME</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                mode="outlined"
                textColor="#f8fafc"
                outlineColor="rgba(255, 255, 255, 0.08)"
                activeOutlineColor="#f43f5e"
                style={styles.input}
                left={<TextInput.Icon icon="account" color="#fb7185" />}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>COMMUNICATION EMAIL</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                textColor="#f8fafc"
                outlineColor="rgba(255, 255, 255, 0.08)"
                activeOutlineColor="#f43f5e"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                left={<TextInput.Icon icon="email" color="#06b6d4" />}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>ASSIGNED SWINE FACILITY / BARN</Text>
              <TextInput
                value={farmName}
                onChangeText={setFarmName}
                mode="outlined"
                textColor="#f8fafc"
                outlineColor="rgba(255, 255, 255, 0.08)"
                activeOutlineColor="#f43f5e"
                style={styles.input}
                left={<TextInput.Icon icon="home-analytics" color="#10b981" />}
              />
            </View>
          </Surface>

          {/* Save Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleSave}
            disabled={loading}
            style={styles.saveButtonWrap}
          >
            <LinearGradient
              colors={['#f43f5e', '#be123c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Save Profile Credentials</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  header: {
    backgroundColor: 'rgba(11, 18, 32, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingBottom: 12,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitleWrap: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  brandSubtitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.2,
  },
  content: {
    padding: 16,
    gap: 18,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarImage: {
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 2,
    borderColor: '#f43f5e',
  },
  avatarPlaceholder: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(244, 63, 94, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fb7185',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f43f5e',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME.bg,
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 2,
  },
  roleSubtext: {
    fontSize: 11,
    color: '#06b6d4',
  },
  formSection: {
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    gap: 16,
  },
  inputContainer: {
    gap: 6,
  },
  label: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    fontSize: 14,
  },
  saveButtonWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 6,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
