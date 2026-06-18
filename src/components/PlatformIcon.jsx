import { FontAwesome5 } from "@expo/vector-icons";
import { colors, plataforms } from "../constants/colors";

export default function PlatformIcon({ platform, size = 11 }) {
	const icons = {
		Instagram: { name: "instagram", color: plataforms.instagram },
		TikTok: { name: "tiktok", color: colors.text },
		YouTube: { name: "youtube", color: plataforms.youtube },
	};
	const icon = icons[platform] || { name: "globe", color: colors.inactive };
	return <FontAwesome5 name={icon.name} size={size} color={icon.color} />;
}
