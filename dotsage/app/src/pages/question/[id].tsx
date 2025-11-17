import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navigation from "@components/Navigation";
import { fetchRecentQuestions, voteOnQuestion } from "@lib/polkadot";
import { getAiAnswer } from "@lib/api";
import { getExampleQuestion, isExampleQuestionId, type Question } from "@lib/exampleQuestions";

type Category = "Docs" | "Builders" | "Governance" | "Ecosystem";

export default function QuestionDetail() {
	const router = useRouter();
	const { id } = router.query;
	
	// Parse question ID from route parameter (handle both string and number)
	const questionId = router.isReady && id ? (typeof id === "string" ? Number(id) : Number(id)) : null;

	const [question, setQuestion] = useState<Question | null>(null);
	const [answer, setAnswer] = useState<string>("");
	const [sources, setSources] = useState<Array<{ title: string; url: string }>>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingAnswer, setLoadingAnswer] = useState<boolean>(false);
	const [errorMsg, setErrorMsg] = useState<string>("");
	const [voting, setVoting] = useState<boolean>(false);

	useEffect(() => {
		// Wait for router to be ready
		if (!router.isReady) {
			return;
		}

		if (!questionId || isNaN(questionId) || questionId < 0) {
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
				let found = questions.find((q) => q.id === questionId);
				
				// If not found in real questions, check example questions
				if (!found && isExampleQuestionId(questionId)) {
					found = getExampleQuestion(questionId);
				}
				
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
				// If fetch fails, check if it's an example question
				if (isExampleQuestionId(questionId)) {
					const found = getExampleQuestion(questionId);
					if (found) {
						setQuestion(found);
						
						// Try to fetch AI answer for example question
						setLoadingAnswer(true);
						try {
							const resp = await getAiAnswer({
								text: found.text,
								category: found.category,
							});
							setAnswer(resp.answer);
							setSources(resp.sources ?? []);
						} catch (answerErr) {
							console.error("Failed to fetch answer:", answerErr);
							setErrorMsg("Failed to fetch AI answer. Please try again.");
						} finally {
							setLoadingAnswer(false);
						}
						setLoading(false);
						return;
					}
				}
				
				const errorMessage = err instanceof Error ? err.message : "Failed to fetch question.";
				setErrorMsg(errorMessage);
			} finally {
				setLoading(false);
			}
		})();
	}, [questionId, router.isReady]);

	const onVote = async (isUp: boolean) => {
		if (!question) return;
		
		// Check if this is an example question
		const isExample = isExampleQuestionId(question.id);
		if (isExample) {
			alert("Example questions are read-only. Connect to the blockchain and deploy questions to enable voting.");
			return;
		}
		
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
							<span>
								By: <Link href={`/user/${encodeURIComponent(question.author)}`} style={{ color: "var(--accent)", textDecoration: "none" }}>
									<code style={{ color: "var(--accent)", fontSize: "12px", cursor: "pointer" }}>
										{question.author.length > 24 ? `${question.author.slice(0, 16)}...${question.author.slice(-8)}` : question.author}
									</code>
								</Link>
							</span>
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
					{isExampleQuestionId(question.id) && (
						<div style={{ 
							padding: "8px 12px", 
							background: "rgba(255, 193, 7, 0.1)", 
							border: "1px solid rgba(255, 193, 7, 0.3)", 
							borderRadius: "6px",
							fontSize: "14px",
							color: "var(--text)",
							marginBottom: "8px"
						}}>
							ℹ️ Example question - voting disabled
						</div>
					)}
					<button 
						className="btn secondary" 
						onClick={() => void onVote(true)} 
						disabled={voting || isExampleQuestionId(question.id)}
						style={{ padding: "10px 20px", opacity: isExampleQuestionId(question.id) ? 0.5 : 1 }}
					>
						↑ Upvote
					</button>
					<button 
						className="btn secondary" 
						onClick={() => void onVote(false)} 
						disabled={voting || isExampleQuestionId(question.id)}
						style={{ padding: "10px 20px", opacity: isExampleQuestionId(question.id) ? 0.5 : 1 }}
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

