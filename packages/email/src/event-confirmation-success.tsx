import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Text,
} from "@react-email/components";
import EmailHeader from "./components/email-header";
import EmailFooter from "./components/email-footer";

interface EventConfirmationSuccessProps {
	eventUrl?: string;
	title?: string;
	description?: string;
	location?: string;
	startDate?: string;
	endDate?: string;
}

export default function EventConfirmationSuccess({
	eventUrl = "https://example.com/event/abc123",
	title = "Team Meeting",
	description,
	location,
	startDate = "January 15, 2024 at 10:00",
	endDate,
}: EventConfirmationSuccessProps) {
	return (
		<Html>
			<Head />
			<Preview>Ihre Veranstaltung wurde erfolgreich hinzugefügt</Preview>
			<Body style={main}>
				<EmailHeader />
				<Container style={container}>
					<Heading style={heading}>
						Ihre Veranstaltung wurde erfolgreich hinzugefügt
					</Heading>

					<div style={infoBox}>
						<div style={fieldRow}>
							<Text style={fieldLabel}>Titel:</Text>
							<Text style={fieldValue}>{title || "Nicht angegeben"}</Text>
						</div>
						<div style={fieldRow}>
							<Text style={fieldLabel}>Beschreibung:</Text>
							<Text style={fieldValue}>{description || "Nicht angegeben"}</Text>
						</div>
						<div style={fieldRow}>
							<Text style={fieldLabel}>Ort:</Text>
							<Text style={fieldValue}>{location || "Nicht angegeben"}</Text>
						</div>
						<div style={fieldRow}>
							<Text style={fieldLabel}>Startdatum:</Text>
							<Text style={fieldValue}>{startDate || "Nicht angegeben"}</Text>
						</div>
						<div style={fieldRow}>
							<Text style={fieldLabel}>Enddatum:</Text>
							<Text style={fieldValue}>{endDate || "Nicht angegeben"}</Text>
						</div>
					</div>

					<Button style={button} href={eventUrl}>
						Veranstaltung ansehen
					</Button>

					<Text style={footer}>
						Sie können die Details jederzeit über den obigen Link aktualisieren
					</Text>

					<Text style={linkFallback}>
						Falls der Button nicht funktioniert, verwenden Sie bitte diesen
						Link:
						<br />
						<a href={eventUrl} style={link}>
							{eventUrl}
						</a>
					</Text>
				</Container>
				<EmailFooter />
			</Body>
		</Html>
	);
}

const main = {
	backgroundColor: "#ffffff",
	fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const container = {
	margin: "40px auto",
	padding: "40px 20px",
	maxWidth: "560px",
};

const heading = {
	color: "#000000",
	fontSize: "20px",
	fontWeight: "600" as const,
	margin: "0 0 30px",
	lineHeight: "1.4",
};

const infoBox = {
	backgroundColor: "#f9fafb",
	borderRadius: "8px",
	padding: "20px",
	margin: "0 0 24px",
};

const fieldRow = {
	marginBottom: "12px",
};

const fieldLabel = {
	color: "#6b7280",
	fontSize: "13px",
	fontWeight: "500" as const,
	margin: "0 0 4px",
	textTransform: "uppercase" as const,
	letterSpacing: "0.5px",
};

const fieldValue = {
	color: "#000000",
	fontSize: "15px",
	fontWeight: "400" as const,
	margin: "0",
};

const button = {
	backgroundColor: "#000000",
	borderRadius: "6px",
	color: "#ffffff",
	fontSize: "14px",
	fontWeight: "500" as const,
	textDecoration: "none",
	textAlign: "center" as const,
	display: "inline-block",
	padding: "12px 24px",
	margin: "0 0 24px",
};

const footer = {
	color: "#999999",
	fontSize: "12px",
	margin: "0 0 16px",
};

const linkFallback = {
	color: "#666666",
	fontSize: "13px",
	margin: "0",
	lineHeight: "1.6",
};

const link = {
	color: "#0d0d0d",
	textDecoration: "underline",
	wordBreak: "break-all" as const,
};
