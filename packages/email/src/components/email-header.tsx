import { Section, Row, Column, Img, Link } from "@react-email/components";

export default function EmailHeader() {
	return (
		<Section style={section}>
			<Row>
				<Column style={logoColumn}>
					<Img
						alt="IGG Technik logo"
						height="42"
						src="https://iggtechnik.de/assets/logos/full.png"
						style={logo}
					/>
				</Column>
				<Column align="right" style={linkColumn}>
					<Link href="https://iggtechnik.de" style={link}>
						iggtechnik.de
					</Link>
				</Column>
			</Row>
		</Section>
	);
}

const section = {
	padding: "40px 32px",
};

const logoColumn = {
	verticalAlign: "middle" as const,
};

const logo = {
	display: "block",
	margin: "0",
};

const linkColumn = {
	verticalAlign: "middle" as const,
	textAlign: "right" as const,
};

const link = {
	color: "#666666",
	fontSize: "14px",
	textDecoration: "none",
};
