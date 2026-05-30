import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal } from 'react-native';
import { X, Plus } from 'lucide-react-native';
import { initDB } from '@/lib/db/schema';

interface AddCategoryModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: (categoryName: string) => void;
}

export default function AddCategoryModal({ isVisible, onClose, onSuccess }: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const db = await initDB();
      const id = Math.random().toString(36).substring(2, 11);
      await db.runAsync(
        "INSERT INTO categories (id, nom) VALUES (?, ?)",
        [id, name.trim()]
      );
      onSuccess(name.trim());
      setName('');
      onClose();
    } catch (error) {
      console.error("Error adding category:", error);
      // If error (like duplicate), we still close or show error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Nouvelle catégorie</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="#6B6B6B" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Nom de la catégorie</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Électronique, Boissons..."
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>

          <TouchableOpacity 
            style={[styles.saveBtn, (!name.trim() || loading) && styles.saveBtnDisabled]} 
            onPress={handleSave}
            disabled={!name.trim() || loading}
          >
            <Text style={styles.saveBtnText}>{loading ? 'Enregistrement...' : 'Ajouter'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  content: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A0A0A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: '#0A0A0A',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
