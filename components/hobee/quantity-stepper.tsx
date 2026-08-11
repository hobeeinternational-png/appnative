import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  size?: "compact" | "regular";
};

export function QuantityStepper({ value, onChange, min = 1, max, size = "regular" }: QuantityStepperProps) {
  const compact = size === "compact";
  const buttonStyle = compact ? styles.compactButton : styles.button;
  const iconSize = compact ? 16 : 20;

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="ลดจำนวนสินค้า"
        accessibilityState={{ disabled: value <= min }}
        disabled={value <= min}
        onPress={() => onChange(value - 1)}
        style={({ pressed }) => [buttonStyle, value <= min && styles.inactive, pressed && value > min && styles.pressed]}
      >
        <MaterialIcons name="remove" size={iconSize} color="#17352A" />
      </Pressable>
      <Text style={[styles.value, compact && styles.compactValue]}>{value}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="เพิ่มจำนวนสินค้า"
        accessibilityState={{ disabled: value >= max }}
        disabled={value >= max}
        onPress={() => onChange(value + 1)}
        style={({ pressed }) => [buttonStyle, value >= max && styles.inactive, pressed && value < max && styles.pressed]}
      >
        <MaterialIcons name="add" size={iconSize} color="#17352A" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 16, borderWidth: 1, borderColor: "#E8E0D0", padding: 5, backgroundColor: "#FFFFFF" },
  compactContainer: { gap: 5, borderRadius: 999, padding: 3 },
  button: { height: 34, width: 34, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#F5EBCF" },
  compactButton: { height: 26, width: 26, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: "#F5EBCF" },
  value: { minWidth: 22, textAlign: "center", color: "#17352A", fontSize: 16, fontWeight: "800" },
  compactValue: { minWidth: 16, fontSize: 14 },
  inactive: { opacity: 0.35 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.94 }] },
});

