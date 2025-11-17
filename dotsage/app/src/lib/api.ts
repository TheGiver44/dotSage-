export type AskRequest = {
	text: string;
	category: "Docs" | "Builders" | "Governance" | "Ecosystem";
};

export type AskResponse = {
	answer: string;
	sources?: Array<{ title: string; url: string }>;
};

export async function getAiAnswer(req: AskRequest): Promise<AskResponse> {
	const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8788";
	const res = await fetch(`${baseUrl}/ask`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(req),
	});
	if (!res.ok) {
		throw new Error("Backend error");
	}
	const data = (await res.json()) as AskResponse;
	return data;
}


