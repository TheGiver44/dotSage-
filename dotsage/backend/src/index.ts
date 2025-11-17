import "dotenv/config";
import express from "express";
import { z } from "zod";
import { getAnswer } from "./llm.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

// Minimal CORS to allow local frontend to call the API from the browser.
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
	if (req.method === "OPTIONS") {
		res.sendStatus(200);
		return;
	}
	next();
});

const askSchema = z.object({
	text: z.string().min(5).max(2000),
	category: z.enum(["Docs", "Builders", "Governance", "Ecosystem"]),
});

app.post("/ask", async (req, res) => {
	const parsed = askSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({ error: "Invalid payload" });
		return;
	}
	try {
		const { text, category } = parsed.data;
		const { answer, sources } = await getAnswer({ text, category });
		res.json({ answer, sources });
	} catch (err) {
		res.status(500).json({ error: "Failed to generate answer" });
	}
});

const port = Number(process.env.PORT ?? 8788);
app.listen(port, () => {
	// eslint-disable-next-line no-console
	console.log(`DotSage backend listening on http://localhost:${port}`);
});


