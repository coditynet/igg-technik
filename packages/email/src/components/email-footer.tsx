import { Section, Text, Hr, Tailwind } from "@react-email/components";

export default function EmailFooter() {
	return (
		<Tailwind>
			<Section className="px-[32px] py-[20px]">
				<Hr className="border-[#e5e7eb] my-[20px]" />
				<Text className="text-[#999999] text-[12px] leading-[18px] m-0">
					<strong className="text-[#666666]">Hinweis:</strong> Diese Daten
					wurden automatisch ausgelesen und könnten fehlerhaft sein. Sie können
					die Veranstaltung nur bearbeiten, bis sie vom Technik-Team akzeptiert
					wurde.
				</Text>
			</Section>
		</Tailwind>
	);
}
