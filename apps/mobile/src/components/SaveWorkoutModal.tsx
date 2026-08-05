import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Colors from "../constants/Colors";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  /** When set, modal updates an existing saved workout */
  initialName?: string | null;
  isUpdate?: boolean;
};

export function SaveWorkoutModal({
  visible,
  onClose,
  onSave,
  initialName = null,
  isUpdate = false,
}: Props) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(initialName?.trim() ?? "");
    setError(null);
    setSaving(false);
  }, [visible, initialName]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give it a name");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(trimmed);
      setName("");
      onClose();
    } catch (e: any) {
      setError(e?.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>
            {isUpdate ? "Update workout" : "Save workout"}
          </Text>
          <Text style={styles.hint}>
            {isUpdate
              ? "Keep the name or rename — then save your changes."
              : "Name it so you can run it again later."}
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Leg Day"
            placeholderTextColor={Colors.textMuted}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.row}>
            <Pressable style={styles.cancelBtn} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.saveBtn, saving && styles.saveDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveText}>
                  {isUpdate ? "Update" : "Save"}
                </Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderTopColor: Colors.highlight,
    borderLeftColor: Colors.highlight,
    borderBottomColor: Colors.shadowDark,
    borderRightColor: Colors.shadowDark,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: 13,
    marginBottom: 14,
  },
  input: {
    backgroundColor: Colors.inset,
    borderRadius: 12,
    borderWidth: 2,
    borderTopColor: Colors.shadowDark,
    borderLeftColor: Colors.shadowDark,
    borderBottomColor: Colors.highlight,
    borderRightColor: Colors.highlight,
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: {
    color: Colors.accent4,
    marginTop: 8,
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 18,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: Colors.textMuted,
    fontSize: 15,
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: Colors.ctaStart,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
    minWidth: 88,
    alignItems: "center",
  },
  saveDisabled: {
    opacity: 0.7,
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
