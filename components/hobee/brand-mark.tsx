import { Text, View } from "react-native";

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <View className="flex-row items-center gap-2">
      <View
        className={`h-9 w-9 items-center justify-center rounded-xl ${
          inverse ? "bg-primary" : "bg-primary"
        }`}
      >
        <Text className="text-base font-black text-white">H</Text>
      </View>
      <View>
        <Text className={`text-base font-black tracking-[1.8px] ${inverse ? "text-white" : "text-foreground"}`}>
          HOBEE
        </Text>
        <Text className={`text-[9px] font-semibold tracking-[1px] ${inverse ? "text-white/75" : "text-muted"}`}>
          LOCAL, LIVED WELL
        </Text>
      </View>
    </View>
  );
}

