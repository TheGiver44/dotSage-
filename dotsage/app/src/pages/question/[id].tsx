import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navigation from "@components/Navigation";
import { fetchRecentQuestions, voteOnQuestion } from "@lib/polkadot";
import { getAiAnswer } from "@lib/api";

type Category = "Docs" | "Builders" | "Governance" | "Ecosystem";

type Question = {
	id: number;
	author: string;
	text: string;
	category: Category;
	createdAt: number;
	upvotes: number;
	downvotes: number;
};

export default function QuestionDetail() {
	const router = useRouter();
	const { id } = router.query;
	const questionId = id ? Number(id) : null;

	const [question, setQuestion] = useState<Question | null>(null);
	const [answer, setAnswer] = useState<string>("");
	const [sources, setSources] = useState<Array<{ title: string; url: string }>>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingAnswer, setLoadingAnswer] = useState<boolean>(false);
	const [errorMsg, setErrorMsg] = useState<string>("");
	const [voting, setVoting] = useState<boolean>(false);

	useEffect(() => {
		if (!questionId || isNaN(questionId)) {
			setLoading(false);
			setErrorMsg("Invalid question ID");
			return;
		}

		void (async () => {
			setLoading(true);
			setErrorMsg("");
			try {
				// Fetch questions and find the one with matching ID
				const questions = await fetchRecentQuestions({ offset: 0, limit: 100 });
				const found = questions.find((q) => q.id === questionId);
				
				if (!found) {
					setErrorMsg("Question not found");
					setLoading(false);
					return;
				}

				setQuestion(found);
				
				// Automatically fetch AI answer for this question
				setLoadingAnswer(true);
				try {
					const resp = await getAiAnswer({
						text: found.text,
						category: found.category,
					});
					setAnswer(resp.answer);
					setSources(resp.sources ?? []);
				} catch (err) {
					console.error("Failed to fetch answer:", err);
					setErrorMsg("Failed to fetch AI answer. Please try again.");
				} finally {
					setLoadingAnswer(false);
				}
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : "Failed to fetch question.";
				setErrorMsg(errorMessage);
			} finally {
				setLoading(false);
			}
		})();
	}, [questionId]);

	const onVote = async (isUp: boolean) => {
		if (!question) return;
		
		setVoting(true);
		try {
			await voteOnQuestion({ id: question.id, isUp });
			// Optimistic update
			setQuestion({
				...question,
				upvotes: isUp ? question.upvotes + 1 : question.upvotes,
				downvotes: !isUp ? question.downvotes + 1 : question.downvotes,
			});
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Voting failed. Ensure wallet is connected.";
			alert(`Voting failed: ${errorMessage}`);
		} finally {
			setVoting(false);
		}
	};

	if (loading) {
		return (
			<div className="container">
				<Navigation />
				<div style={{ padding: 48, textAlign: "center" }}>
					<div style={{ 
						display: "inline-block",
						width: "48px",
						height: "48px",
						border: "4px solid rgba(255, 62, 165, 0.2)",
						borderTopColor: "var(--brand)",
						borderRadius: "50%",
						animation: "spin 1s linear infinite",
						marginBottom: "16px"
					}}></div>
					<p style={{ color: "var(--muted)", fontSize: "18px" }}>Loading question...</p>
				</div>
				<style jsx>{`
					@keyframes spin {
						to { transform: rotate(360deg); }
					}
				`}</style>
			</div>
		);
	}

	if (errorMsg && !question) {
		return (
			<div className="container">
				<Navigation />
				<div className="card" style={{ padding: "24px", marginTop: "24px" }}>
					<h2 style={{ marginTop: 0, color: "var(--brand)" }}>⚠️ Error</h2>
					<p style={{ color: "var(--text)", whiteSpace: "pre-line" }}>{errorMsg}</p>
					<Link href="/explore" className="btn secondary" style={{ textDecoration: "none", marginTop: "16px", display: "inline-block" }}>
						Back to Explore
					</Link>
				</div>
			</div>
		);
	}

	if (!question) {
		return null;
	}

	const score = question.upvotes - question.downvotes;

	return (
		<div className="container">
			<Navigation />

			<Link href="/explore" style={{ color: "var(--brand)", textDecoration: "none", fontSize: "14px", marginBottom: "16px", display: "inline-block" }}>
				← Back to Explore
			</Link>

			<div className="card" style={{ padding: "24px", marginTop: "24px" }}>
				{/* Question Header */}
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
					<div>
						<div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
							<span style={{ color: "var(--brand)", fontWeight: "bold", fontSize: "20px" }}>#{question.id}</span>
							<span className="badge" style={{ fontSize: "12px" }}>{question.category}</span>
						</div>
						<p style={{ fontSize: "18px", lineHeight: "1.6", margin: "8px 0", color: "var(--text)" }}>{question.text}</p>
						<div style={{ display: "flex", gap: "16px", marginTop: "12px", fontSize: "14px", color: "var(--muted)", flexWrap: "wrap" }}>
							<span>By: <code style={{ color: "var(--accent)", fontSize: "12px" }}>{question.author.slice(0, 16)}...{question.author.slice(-8)}</code></span>
							<span>{new Date(question.createdAt).toLocaleString()}</span>
						</div>
					</div>
					<div style={{ textAlign: "right" }}>
						<div style={{ fontSize: "24px", fontWeight: "bold", color: score >= 0 ? "var(--brand)" : "var(--muted)", marginBottom: "4px" }}>
							{score >= 0 ? "+" : ""}{score}
						</div>
						<div style={{ fontSize: "12px", color: "var(--muted)" }}>
							↑ {question.upvotes} / ↓ {question.downvotes}
						</div>
					</div>
				</div>

				{/* Voting Buttons */}
				<div style={{ display: "flex", gap: "12px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
					<button 
						className="btn secondary" 
						onClick={() => void onVote(true)} 
						disabled={voting}
						style={{ padding: "10px 20px" }}
					>
						↑ Upvote
					</button>
					<button 
						className="btn secondary" 
						onClick={() => void onVote(false)} 
						disabled={voting}
						style={{ padding: "10px 20px" }}
					>
						↓ Downvote
					</button>
				</div>
			</div>

			{/* Answer Section */}
			<div className="card" style={{ padding: "24px", marginTop: "24px" }}>
				<h2 style={{ marginTop: 0, color: "var(--brand)" }}>🤖 AI Answer</h2>
				
				{loadingAnswer ? (
					<div style={{ padding: "24px", textAlign: "center" }}>
						<div style={{ 
							display: "inline-block",
							width: "32px",
							height: "32px",
							border: "3px solid rgba(255, 62, 165, 0.2)",
							borderTopColor: "var(--brand)",
							borderRadius: "50%",
							animation: "spin 1s linear infinite",
							marginBottom: "8px"
						}}></div>
						<p style={{ color: "var(--muted)" }}>Generating answer...</p>
					</div>
				) : answer ? (
					<>
						<div 
							style={{ 
								lineHeight: "1.6",
								color: "var(--text)",
								marginBottom: "16px"
							}}
							dangerouslySetInnerHTML={{ __html: answer }}
						/>
						{sources.length > 0 && (
							<div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
								<strong style={{ color: "var(--accent)" }}>Sources:</strong>
								<ul style={{ marginTop: "8px" }}>
									{sources.map((s, i) => (
										<li key={i} style={{ margin: "4px 0" }}>
											<a className="link" href={s.url} target="_blank" rel="noreferrer">
												{s.title}
											</a>
										</li>
									))}
								</ul>
							</div>
						)}
					</>
				) : errorMsg ? (
					<div style={{ padding: "16px", backgroundColor: "rgba(255, 62, 165, 0.1)", border: "1px solid var(--brand)", borderRadius: "8px" }}>
						<p style={{ color: "var(--text)", margin: 0 }}>{errorMsg}</p>
					</div>
				) : (
					<p style={{ color: "var(--muted)" }}>No answer available.</p>
				)}
			</div>
		</div>
	);
}

