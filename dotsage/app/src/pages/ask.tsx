import { useCallback, useMemo, useState } from "react";
import { z } from "zod";
import { logQuestionOnChain } from "@lib/polkadot";
import { getAiAnswer } from "@lib/api";
import Navigation from "@components/Navigation";

type Category = "Docs" | "Builders" | "Governance" | "Ecosystem";

const questionSchema = z.object({
	text: z.string().min(5).max(1000),
	category: z.enum(["Docs", "Builders", "Governance", "Ecosystem"]),
});

export default function Ask() {
	const [questionText, setQuestionText] = useState<string>("");
	const [category, setCategory] = useState<Category>("Docs");
	const [answer, setAnswer] = useState<string>("");
	const [sources, setSources] = useState<Array<{ title: string; url: string }>>([]);
	const [loadingAnswer, setLoadingAnswer] = useState<boolean>(false);
	const [logging, setLogging] = useState<boolean>(false);
	const [txHash, setTxHash] = useState<string>("");
	const [errorMsg, setErrorMsg] = useState<string>("");

	const isLogDisabled = useMemo<boolean>(() => !answer || logging, [answer, logging]);

	const onAsk = useCallback(async () => {
		setErrorMsg("");
		setAnswer("");
		setSources([]);
		setTxHash("");
		const parsed = questionSchema.safeParse({ text: questionText, category });
		if (!parsed.success) {
			setErrorMsg("Please enter a valid question (min 5 chars).");
			return;
		}
		setLoadingAnswer(true);
		try {
			const resp = await getAiAnswer({
				text: questionText,
				category,
			});
			setAnswer(resp.answer);
			setSources(resp.sources ?? []);
		} catch (err) {
			setErrorMsg("Failed to fetch AI answer.");
		} finally {
			setLoadingAnswer(false);
		}
	}, [questionText, category]);

	const onLog = useCallback(async () => {
		if (!answer) return;
		setLogging(true);
		setErrorMsg("");
		try {
			const now = Date.now();
			const resultHash = await logQuestionOnChain({
				text: questionText,
				category,
				createdAtMs: now,
			});
			setTxHash(resultHash);
			setErrorMsg(""); // Clear any previous errors
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to log on-chain. Ensure wallet is connected and approved.";
			setErrorMsg(errorMessage);
			console.error("Log question error:", err);
		} finally {
			setLogging(false);
		}
	}, [answer, questionText, category]);

	return (
		<div className="container">
			<Navigation />

			<div className="hero">
				<div className="kicker">
					<span className="badge">DotSage</span>
					<span>AI answers backed by on-chain community signals</span>
				</div>
				<h1 className="title">Ask anything about Polkadot.</h1>
				<p className="subtitle">Get concise, source-linked answers. Log questions on-chain. Vote and explore trending topics.</p>
				<div className="row">
					<textarea
						className="textarea"
						value={questionText}
						onChange={(e) => setQuestionText(e.target.value)}
						placeholder="How does OpenGov's referendum track system work?"
						rows={6}
					/>
					<div>
						<label>
							Category:&nbsp;
							<select className="select" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
								<option value="Docs">Docs / Protocol</option>
								<option value="Builders">Builders / SDK</option>
								<option value="Governance">Governance / OpenGov</option>
								<option value="Ecosystem">Ecosystem / Parachains</option>
							</select>
						</label>
					</div>
					<div>
						<button className="btn" onClick={onAsk} disabled={loadingAnswer}>
							{loadingAnswer ? "Getting Answer..." : "Get Answer"}
						</button>
					</div>
				</div>
			</div>

			{errorMsg ? (
				<div style={{ padding: "16px", backgroundColor: "rgba(255, 62, 165, 0.1)", border: "1px solid var(--brand)", borderRadius: "8px", marginTop: "12px" }}>
					<strong style={{ color: "var(--brand)", fontSize: "16px" }}>⚠️ Error:</strong>
					<div style={{ marginTop: "8px", color: "var(--text)", whiteSpace: "pre-line" }}>{errorMsg}</div>
					{errorMsg.includes("Cannot connect to blockchain") || errorMsg.includes("Connection timeout") ? (
						<div style={{ marginTop: "12px", padding: "12px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "6px" }}>
							<strong style={{ color: "var(--accent)" }}>Quick Fix:</strong>
							<ol style={{ margin: "8px 0", paddingLeft: "24px", lineHeight: "1.8" }}>
								<li>Open a terminal and run:
									<code style={{ display: "block", marginTop: "4px", padding: "8px", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "4px", fontSize: "14px" }}>
										substrate-contracts-node --dev --tmp
									</code>
								</li>
								<li>Wait for the node to start (you'll see "Running JSON-RPC server" message)</li>
								<li>Refresh this page and try again</li>
							</ol>
						</div>
					) : errorMsg.includes("Insufficient balance") ? (
						<div style={{ marginTop: "12px", padding: "12px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "6px" }}>
							<strong style={{ color: "var(--accent)" }}>How to Fund Your Account:</strong>
							<ol style={{ margin: "8px 0", paddingLeft: "24px", lineHeight: "1.8" }}>
								<li><strong>For Local Development:</strong>
									<ul style={{ margin: "4px 0", paddingLeft: "20px" }}>
										<li>Open <a href="https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:9944" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>Polkadot.js Apps</a> and connect to your local node</li>
										<li>Go to the "Accounts" tab and use the faucet or transfer tokens from another account</li>
										<li>For dev nodes, accounts often start with tokens - check your account balance</li>
									</ul>
								</li>
								<li><strong>For Testnets:</strong>
									<ul style={{ margin: "4px 0", paddingLeft: "20px" }}>
										<li>Use the testnet faucet to get test tokens</li>
										<li>Or transfer tokens from another account that has a balance</li>
									</ul>
								</li>
								<li>Once funded, refresh this page and try again</li>
							</ol>
						</div>
					) : (
						<div style={{ marginTop: "12px", fontSize: "0.9em", color: "var(--muted)" }}>
							<strong>Tips:</strong>
							<ul style={{ margin: "4px 0", paddingLeft: "20px", lineHeight: "1.6" }}>
								<li>Click the <strong>"Connect Wallet"</strong> button in the top right to connect your wallet</li>
								<li>If you have multiple extensions (Talisman, Polkadot.js), the app will use accounts from all of them</li>
								<li>Make sure you have at least one account in your wallet extension</li>
								<li>Make sure the contracts node is running at ws://127.0.0.1:9944</li>
							</ul>
						</div>
					)}
				</div>
			) : null}

			{answer ? (
				<section style={{ marginTop: 24 }}>
					<div className="card">
						<h3 style={{ marginTop: 0 }}>Answer</h3>
						<div 
							style={{ 
								lineHeight: "1.6",
								color: "var(--text)"
							}}
							dangerouslySetInnerHTML={{ __html: answer }}
						/>
						{sources.length > 0 ? (
							<div style={{ marginTop: 12, color: "var(--text)" }}>
								<strong>Sources:</strong>
								<ul>
									{sources.map((s, i) => (
										<li key={i}>
											<a className="link" href={s.url} target="_blank" rel="noreferrer">
												{s.title}
											</a>
										</li>
									))}
								</ul>
							</div>
						) : null}
						<div style={{ marginTop: 12, display: "flex", gap: 8 }}>
							<button className="btn secondary" onClick={onLog} disabled={isLogDisabled}>
								{logging ? "Logging..." : "Log this question to Polkadot"}
							</button>
							{txHash ? (
								<p style={{ margin: 0 }}>
									Tx hash: <code>{txHash}</code>
								</p>
							) : null}
						</div>
					</div>
				</section>
			) : null}
		</div>
	);
}

