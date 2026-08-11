import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof MaterialIcons>["name"];
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({
  label,
  onPress,
  icon,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
}: PrimaryButtonProps) {
  const isInactive = disabled || loading;
  const variantStyle = variant === "primary" ? styles.primary : variant === "secondary" ? styles.secondary : styles.outline;
  const textStyle = variant === "primary" ? styles.primaryText : styles.darkText;
  const iconColor = variant === "primary" ? "#FFFFFF" : "#17352A";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      onPress={onPress}
      style={({ pressed }) => [styles.base, variantStyle, isInactive && styles.disabled, pressed && !isInactive && styles.pressed, style]}
    >
      {loading ? <ActivityIndicator color={iconColor} size="small" /> : icon ? <MaterialIcons name={icon} size={20} color={iconColor} /> : null}
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, borderRadius: 16, paddingHorizontal: 18 },
  primary: { backgroundColor: "#17352A" },
  secondary: { backgroundColor: "#F5EBCF" },
  outline: { borderWidth: 1, borderColor: "#E8E0D0", backgroundColor: "#FFFFFF" },
  primaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  darkText: { color: "#17352A", fontSize: 16, fontWeight: "800" },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
});

