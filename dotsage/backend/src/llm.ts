import { z } from "zod";
import Groq from "groq-sdk";

const askInput = z.object({
	text: z.string(),
	category: z.enum(["Docs", "Builders", "Governance", "Ecosystem"]),
});

export type AskInput = z.infer<typeof askInput>;

// Polkadot documentation sources by category
const DOC_SOURCES: Record<string, Array<{ title: string; url: string }>> = {
	Docs: [
		{ title: "Polkadot Wiki - Learn", url: "https://wiki.polkadot.network/" },
		{ title: "Polkadot Documentation", url: "https://docs.polkadot.network/" },
		{ title: "Substrate Documentation", url: "https://docs.substrate.io/" },
	],
	Builders: [
		{ title: "Polkadot Builders Guide", url: "https://wiki.polkadot.network/docs/build-index" },
		{ title: "ink! Smart Contracts", url: "https://use.ink/" },
		{ title: "Polkadot.js API", url: "https://polkadot.js.org/docs/" },
	],
	Governance: [
		{ title: "OpenGov Overview", url: "https://wiki.polkadot.network/docs/learn-governance" },
		{ title: "Referenda Guide", url: "https://wiki.polkadot.network/docs/maintain-guides-democracy" },
		{ title: "Governance Best Practices", url: "https://wiki.polkadot.network/docs/learn-governance" },
	],
	Ecosystem: [
		{ title: "Parachains Overview", url: "https://wiki.polkadot.network/docs/learn-parachains" },
		{ title: "Polkadot Ecosystem", url: "https://polkadot.network/ecosystem/" },
		{ title: "Parachain Teams", url: "https://wiki.polkadot.network/docs/learn-parachains" },
	],
};

function convertMarkdownToHTML(text: string): string {
	// Simple markdown to HTML converter
	let html = text
		// Headers
		.replace(/^### (.*$)/gim, '<h3>$1</h3>')
		.replace(/^## (.*$)/gim, '<h3>$1</h3>')
		.replace(/^# (.*$)/gim, '<h3>$1</h3>')
		// Bold
		.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
		// Bullet points
		.replace(/^\* (.*$)/gim, '<li>$1</li>')
		.replace(/^- (.*$)/gim, '<li>$1</li>')
		// Wrap consecutive list items in <ul>
		.replace(/(<li>.*<\/li>\n?)+/gim, '<ul>$&</ul>')
		// Links
		.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
		// Paragraphs (wrap text blocks)
		.split('\n\n')
		.map(para => {
			if (para.trim().startsWith('<')) {
				return para; // Already HTML
			}
			return para.trim() ? `<p>${para.trim()}</p>` : '';
		})
		.join('\n');
	
	return html;
}

function getSystemPrompt(category: string): string {
	return `You are DotSage, an AI assistant specialized in answering questions about Polkadot, Substrate, and the Web3 ecosystem. 

Your role:
- Provide accurate, concise answers based on Polkadot documentation and best practices
- Focus on the ${category} category context
- Cite relevant documentation when possible
- If you're unsure, say so rather than guessing
- Keep answers clear and actionable

Answer format (IMPORTANT - use clean HTML formatting):
- Use <h3> tags for main section headings
- Use <ul><li> for bullet lists (NOT markdown *)
- Use <strong> for emphasis (NOT markdown **)
- Use <p> tags to wrap paragraphs
- Do NOT use markdown syntax (*, **, #, etc.)
- Keep formatting clean and HTML-based
- Be concise but comprehensive (aim for 300-500 words)
- Include technical details when relevant`;
}

async function callGroq(question: string, category: string): Promise<string> {
	const apiKey = process.env.GROQ_API_KEY;
	if (!apiKey) {
		console.error("GROQ_API_KEY not found in process.env. Available env vars:", Object.keys(process.env).filter(k => k.includes('GROQ')));
		throw new Error("GROQ_API_KEY not set. Please create a .env file in the backend directory with: GROQ_API_KEY=your_key_here");
	}

	const groq = new Groq({ apiKey });
	
	const systemPrompt = getSystemPrompt(category);
	
	try {
		const completion = await groq.chat.completions.create({
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: question },
			],
			model: "llama-3.3-70b-versatile", // Fast and capable model
			temperature: 0.7,
			max_tokens: 500,
		});

		const answer = completion.choices[0]?.message?.content;
		if (!answer) {
			throw new Error("No response from AI model");
		}
		
		// Convert markdown to HTML if needed (fallback)
		return convertMarkdownToHTML(answer);
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : String(error);
		throw new Error(`AI API error: ${errorMsg}`);
	}
}

export async function getAnswer(input: AskInput): Promise<{ answer: string; sources: Array<{ title: string; url: string }> }> {
	const parsed = askInput.parse(input);
	
	// Get category-specific sources
	const sources = DOC_SOURCES[parsed.category] || DOC_SOURCES.Docs;
	
	try {
		// Call Groq API for real AI responses
		const answer = await callGroq(parsed.text, parsed.category);
		return { answer, sources };
	} catch (error) {
		// Fallback to a helpful message if AI fails
		const errorMsg = error instanceof Error ? error.message : "Unknown error";
		console.error("AI call failed:", errorMsg);
		
		// Return a fallback answer that guides the user
		const fallbackAnswer = `I encountered an issue generating an AI response: ${errorMsg}. 

For "${parsed.text}", I recommend checking the Polkadot documentation:
- Visit the official wiki: https://wiki.polkadot.network/
- Check the ${parsed.category} category resources
- Search for related topics in the documentation

If you have a GROQ_API_KEY set, please check that it's valid and the API is accessible.`;
		
		return { answer: fallbackAnswer, sources };
	}
}


