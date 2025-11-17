import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navigation from "@components/Navigation";
import { fetchRecentQuestions, voteOnQuestion } from "@lib/polkadot";

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

export default function UserProfile() {
	const router = useRouter();
	const { address } = router.query;
	
	// Parse user address from route parameter (decode URL-encoded addresses)
	const userAddress = router.isReady && address ? decodeURIComponent(String(address)) : null;

	const [questions, setQuestions] = useState<Question[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [errorMsg, setErrorMsg] = useState<string>("");
	const [stats, setStats] = useState<{
		questionCount: number;
		totalVotes: number;
		totalScore: number;
		categories: Record<Category, number>;
	} | null>(null);

	useEffect(() => {
		// Wait for router to be ready
		if (!router.isReady) {
			return;
		}

		if (!userAddress || userAddress.trim().length === 0) {
			setLoading(false);
			setErrorMsg("Invalid user address");
			return;
		}

		void (async () => {
			setLoading(true);
			setErrorMsg("");
			try {
				// Fetch all questions and filter by user address
				const allQuestions = await fetchRecentQuestions({ offset: 0, limit: 100 });
				const userQuestions = allQuestions.filter((q) => q.author.toLowerCase() === userAddress.toLowerCase());

				if (userQuestions.length === 0) {
					setErrorMsg("No questions found for this user.");
					setLoading(false);
					return;
				}

				setQuestions(userQuestions.sort((a, b) => b.createdAt - a.createdAt));

				// Calculate stats
				const totalVotes = userQuestions.reduce((sum, q) => sum + q.upvotes + q.downvotes, 0);
				const totalScore = userQuestions.reduce((sum, q) => sum + (q.upvotes - q.downvotes), 0);
				
				const categories: Record<Category, number> = {
					Docs: 0,
					Builders: 0,
					Governance: 0,
					Ecosystem: 0,
				};

				userQuestions.forEach((q) => {
					categories[q.category]++;
				});

				setStats({
					questionCount: userQuestions.length,
					totalVotes,
					totalScore,
					categories,
				});
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : "Failed to fetch user questions.";
				setErrorMsg(errorMessage);
			} finally {
				setLoading(false);
			}
		})();
	}, [userAddress, router.isReady]);

	const formatAddress = (addr: string) => {
		return `${addr.slice(0, 12)}...${addr.slice(-8)}`;
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
					<p style={{ color: "var(--muted)", fontSize: "18px" }}>Loading profile...</p>
				</div>
				<style jsx>{`
					@keyframes spin {
						to { transform: rotate(360deg); }
					}
				`}</style>
			</div>
		);
	}

	if (errorMsg && questions.length === 0) {
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

	if (!userAddress || !stats) {
		return null;
	}

	return (
		<div className="container">
			<Navigation />

			<Link href="/explore" style={{ color: "var(--brand)", textDecoration: "none", fontSize: "14px", marginBottom: "16px", display: "inline-block" }}>
				← Back to Explore
			</Link>

			{/* User Profile Header */}
			<div className="card" style={{ padding: "24px", marginTop: "24px" }}>
				<h1 style={{ marginTop: 0, color: "var(--brand)" }}>👤 User Profile</h1>
				<code style={{ 
					color: "var(--accent)", 
					fontSize: "16px", 
					background: "rgba(255, 62, 165, 0.1)",
					padding: "8px 12px",
					borderRadius: "6px",
					display: "inline-block",
					marginTop: "8px"
				}}>
					{formatAddress(userAddress)}
				</code>

				{/* Stats */}
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginTop: "24px" }}>
					<div style={{ padding: "16px", background: "rgba(255, 62, 165, 0.1)", borderRadius: "8px", textAlign: "center" }}>
						<div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--brand)", marginBottom: "4px" }}>
							{stats.questionCount}
						</div>
						<div style={{ fontSize: "12px", color: "var(--muted)" }}>Questions Asked</div>
					</div>
					<div style={{ padding: "16px", background: "rgba(255, 62, 165, 0.1)", borderRadius: "8px", textAlign: "center" }}>
						<div style={{ fontSize: "24px", fontWeight: "bold", color: stats.totalScore >= 0 ? "var(--brand)" : "var(--muted)", marginBottom: "4px" }}>
							{stats.totalScore >= 0 ? "+" : ""}{stats.totalScore}
						</div>
						<div style={{ fontSize: "12px", color: "var(--muted)" }}>Total Score</div>
					</div>
					<div style={{ padding: "16px", background: "rgba(255, 62, 165, 0.1)", borderRadius: "8px", textAlign: "center" }}>
						<div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--accent)", marginBottom: "4px" }}>
							{stats.totalVotes}
						</div>
						<div style={{ fontSize: "12px", color: "var(--muted)" }}>Total Votes</div>
					</div>
				</div>

				{/* Category Breakdown */}
				<div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--border)" }}>
					<h3 style={{ marginTop: 0, color: "var(--accent)", fontSize: "18px" }}>Category Breakdown</h3>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px", marginTop: "12px" }}>
						{(Object.keys(stats.categories) as Category[]).map((category) => {
							const count = stats.categories[category];
							if (count === 0) return null;
							return (
								<div key={category} style={{ padding: "12px", background: "rgba(255, 62, 165, 0.05)", borderRadius: "6px", textAlign: "center" }}>
									<div style={{ fontSize: "18px", fontWeight: "bold", color: "var(--brand)", marginBottom: "4px" }}>
										{count}
									</div>
									<div style={{ fontSize: "12px", color: "var(--muted)" }}>{category}</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* User's Questions */}
			<div style={{ marginTop: "24px" }}>
				<h2 style={{ color: "var(--brand)", fontSize: "24px", marginBottom: "16px" }}>
					Questions ({questions.length})
				</h2>
				<div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
					{questions.map((q) => (
						<div key={q.id} className="card" style={{ padding: "20px" }}>
							<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
								<span style={{ color: "var(--accent)", fontWeight: "bold" }}>
									#{q.id} — <em>{q.category}</em>
								</span>
								<span style={{ color: "var(--muted)", fontSize: "14px" }}>
									{new Date(q.createdAt).toLocaleString()}
								</span>
							</div>
							<p style={{ marginTop: 8, marginBottom: 12 }}>{q.text}</p>
							<div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
								<Link 
									href={`/question/${q.id}`}
									className="btn secondary"
									style={{ padding: "8px 16px", fontSize: "14px", textDecoration: "none", display: "inline-block" }}
								>
									💬 View Details
								</Link>
								<span className="score">
									Score: <strong>{q.upvotes - q.downvotes}</strong> (↑{q.upvotes} / ↓{q.downvotes})
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

