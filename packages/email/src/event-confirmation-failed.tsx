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

interface EventConfirmationFailedProps {
	eventUrl?: string;
	errorMessage?: string;
}

export default function EventConfirmationFailed({
	eventUrl = "https://example.com/event/abc123",
	errorMessage = "Veranstaltungsdetails konnten nicht extrahiert werden",
}: EventConfirmationFailedProps) {
	return (
		<Html>
			<Head />
			<Preview>Ihre Veranstaltung konnte nicht verarbeiteted werden</Preview>
			<Body style={main}>
				<EmailHeader />
				<Container style={container}>
					<Heading style={heading}>
						Ihre Veranstaltung konnte nicht verarbeiteted werden
					</Heading>

					<div style={error}>
						<Text style={errorText}>{errorMessage}</Text>
					</div>

					<Text style={message}>
						Bitte verwenden Sie den untenstehenden Link, um Ihre
						Veranstaltungsdetails manuell hinzuzufügen.
					</Text>

					<Button style={button} href={eventUrl}>
						Veranstaltungsdetails hinzufügen
					</Button>

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

const error = {
	backgroundColor: "#fee2e2",
	borderLeft: "3px solid #dc2626",
	borderRadius: "4px",
	padding: "12px 16px",
	margin: "0 0 20px",
};

const errorText = {
	color: "#991b1b",
	fontSize: "13px",
	margin: "0",
	fontFamily: "monospace",
};

const message = {
	color: "#666666",
	fontSize: "14px",
	margin: "0 0 24px",
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
