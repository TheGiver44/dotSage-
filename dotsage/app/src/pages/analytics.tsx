import { useEffect, useState } from "react";
import Navigation from "@components/Navigation";
import { fetchRecentQuestions } from "@lib/polkadot";

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

type Analytics = {
	totalQuestions: number;
	totalUsers: number;
	totalVotes: number;
	categoryCounts: Record<Category, number>;
	categoryVotes: Record<Category, { upvotes: number; downvotes: number }>;
	topQuestions: Question[];
	topUsers: Array<{ address: string; questionCount: number; votes: number }>;
	recentActivity: Question[];
};

export default function Analytics() {
	const [analytics, setAnalytics] = useState<Analytics | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [errorMsg, setErrorMsg] = useState<string>("");

	useEffect(() => {
		void (async () => {
			setLoading(true);
			setErrorMsg("");
			try {
				// Fetch all questions (limit to 100 for now)
				const questions = await fetchRecentQuestions({ offset: 0, limit: 100 });

				// Calculate analytics
				const uniqueUsers = new Set(questions.map((q) => q.author));
				const totalVotes = questions.reduce((sum, q) => sum + q.upvotes + q.downvotes, 0);

				// Category counts
				const categoryCounts: Record<Category, number> = {
					Docs: 0,
					Builders: 0,
					Governance: 0,
					Ecosystem: 0,
				};

				const categoryVotes: Record<Category, { upvotes: number; downvotes: number }> = {
					Docs: { upvotes: 0, downvotes: 0 },
					Builders: { upvotes: 0, downvotes: 0 },
					Governance: { upvotes: 0, downvotes: 0 },
					Ecosystem: { upvotes: 0, downvotes: 0 },
				};

				questions.forEach((q) => {
					categoryCounts[q.category]++;
					categoryVotes[q.category].upvotes += q.upvotes;
					categoryVotes[q.category].downvotes += q.downvotes;
				});

				// Top questions by score
				const topQuestions = [...questions]
					.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
					.slice(0, 5);

				// Top users
				const userStats = new Map<string, { questionCount: number; votes: number }>();
				questions.forEach((q) => {
					const current = userStats.get(q.author) || { questionCount: 0, votes: 0 };
					userStats.set(q.author, {
						questionCount: current.questionCount + 1,
						votes: current.votes + q.upvotes + q.downvotes,
					});
				});

				const topUsers = Array.from(userStats.entries())
					.map(([address, stats]) => ({ address, ...stats }))
					.sort((a, b) => b.questionCount - a.questionCount || b.votes - a.votes)
					.slice(0, 5);

				// Recent activity (last 5)
				const recentActivity = [...questions].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

				setAnalytics({
					totalQuestions: questions.length,
					totalUsers: uniqueUsers.size,
					totalVotes,
					categoryCounts,
					categoryVotes,
					topQuestions,
					topUsers,
					recentActivity,
				});
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : "Failed to fetch analytics.";
				setErrorMsg(errorMessage);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	if (loading) {
		return (
			<div className="container">
				<Navigation />
				<div style={{ textAlign: "center", padding: "48px" }}>
					<p style={{ color: "var(--muted)", fontSize: "18px" }}>Loading analytics...</p>
				</div>
			</div>
		);
	}

	if (errorMsg) {
		return (
			<div className="container">
				<Navigation />
				<div className="card" style={{ padding: "24px", marginTop: "24px" }}>
					<h2 style={{ marginTop: 0, color: "var(--brand)" }}>⚠️ Error</h2>
					<p style={{ color: "var(--text)", whiteSpace: "pre-line" }}>{errorMsg}</p>
				</div>
			</div>
		);
	}

	if (!analytics) {
		return null;
	}

	const formatAddress = (address: string) => {
		return `${address.slice(0, 8)}...${address.slice(-8)}`;
	};

	return (
		<div className="container">
			<Navigation />

			<h1 className="title">📊 Analytics Dashboard</h1>
			<p className="subtitle">Community insights and statistics about DotSage.</p>

			{/* Key Metrics */}
			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginTop: "24px" }}>
				<div className="card" style={{ padding: "20px", textAlign: "center" }}>
					<div style={{ fontSize: "32px", fontWeight: "bold", color: "var(--brand)", marginBottom: "8px" }}>
						{analytics.totalQuestions}
					</div>
					<div style={{ color: "var(--muted)", fontSize: "14px" }}>Total Questions</div>
				</div>

				<div className="card" style={{ padding: "20px", textAlign: "center" }}>
					<div style={{ fontSize: "32px", fontWeight: "bold", color: "var(--accent)", marginBottom: "8px" }}>
						{analytics.totalUsers}
					</div>
					<div style={{ color: "var(--muted)", fontSize: "14px" }}>Unique Users</div>
				</div>

				<div className="card" style={{ padding: "20px", textAlign: "center" }}>
					<div style={{ fontSize: "32px", fontWeight: "bold", color: "var(--brand)", marginBottom: "8px" }}>
						{analytics.totalVotes}
					</div>
					<div style={{ color: "var(--muted)", fontSize: "14px" }}>Total Votes</div>
				</div>

				<div className="card" style={{ padding: "20px", textAlign: "center" }}>
					<div style={{ fontSize: "32px", fontWeight: "bold", color: "var(--accent)", marginBottom: "8px" }}>
						{analytics.totalQuestions > 0 ? ((analytics.totalVotes / analytics.totalQuestions) * 100).toFixed(1) : 0}%
					</div>
					<div style={{ color: "var(--muted)", fontSize: "14px" }}>Engagement Rate</div>
				</div>
			</div>

			{/* Category Breakdown */}
			<div className="card" style={{ padding: "24px", marginTop: "24px" }}>
				<h2 style={{ marginTop: 0, color: "var(--brand)", fontSize: "24px" }}>📁 Category Breakdown</h2>
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginTop: "16px" }}>
					{(Object.keys(analytics.categoryCounts) as Category[]).map((category) => {
						const count = analytics.categoryCounts[category];
						const votes = analytics.categoryVotes[category];
						const percentage = analytics.totalQuestions > 0 ? ((count / analytics.totalQuestions) * 100).toFixed(1) : 0;
						return (
							<div
								key={category}
								style={{
									padding: "16px",
									background: "rgba(255, 62, 165, 0.1)",
									borderRadius: "10px",
									border: "1px solid var(--border)",
								}}
							>
								<div style={{ fontWeight: "bold", color: "var(--accent)", marginBottom: "8px" }}>{category}</div>
								<div style={{ color: "var(--text)", fontSize: "18px", marginBottom: "4px" }}>{count} questions</div>
								<div style={{ color: "var(--muted)", fontSize: "12px" }}>{percentage}% of total</div>
								<div style={{ color: "var(--muted)", fontSize: "12px", marginTop: "8px" }}>
									↑ {votes.upvotes} / ↓ {votes.downvotes} votes
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Top Questions */}
			<div className="card" style={{ padding: "24px", marginTop: "24px" }}>
				<h2 style={{ marginTop: 0, color: "var(--brand)", fontSize: "24px" }}>⭐ Top Questions</h2>
				{analytics.topQuestions.length === 0 ? (
					<p style={{ color: "var(--muted)", marginTop: "16px" }}>No questions yet.</p>
				) : (
					<div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px", marginTop: "16px" }}>
						{analytics.topQuestions.map((q) => (
							<div
								key={q.id}
								style={{
									padding: "16px",
									background: "rgba(255, 62, 165, 0.05)",
									borderRadius: "8px",
									border: "1px solid var(--border)",
								}}
							>
								<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
									<span style={{ color: "var(--accent)", fontWeight: "bold" }}>#{q.id} — {q.category}</span>
									<span style={{ color: "var(--muted)", fontSize: "14px" }}>
										Score: <strong style={{ color: "var(--brand)" }}>{q.upvotes - q.downvotes}</strong> (↑{q.upvotes} / ↓{q.downvotes})
									</span>
								</div>
								<p style={{ color: "var(--text)", margin: 0 }}>{q.text}</p>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Top Users */}
			<div className="card" style={{ padding: "24px", marginTop: "24px" }}>
				<h2 style={{ marginTop: 0, color: "var(--brand)", fontSize: "24px" }}>👥 Top Contributors</h2>
				{analytics.topUsers.length === 0 ? (
					<p style={{ color: "var(--muted)", marginTop: "16px" }}>No users yet.</p>
				) : (
					<div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px", marginTop: "16px" }}>
						{analytics.topUsers.map((user, index) => (
							<div
								key={user.address}
								style={{
									padding: "16px",
									background: "rgba(255, 62, 165, 0.05)",
									borderRadius: "8px",
									border: "1px solid var(--border)",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<div>
									<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
										<span style={{ fontSize: "20px" }}>{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}</span>
										<code style={{ color: "var(--accent)", fontSize: "14px" }}>{formatAddress(user.address)}</code>
									</div>
								</div>
								<div style={{ textAlign: "right" }}>
									<div style={{ color: "var(--text)", fontWeight: "bold" }}>{user.questionCount} questions</div>
									<div style={{ color: "var(--muted)", fontSize: "12px" }}>{user.votes} total votes received</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Recent Activity */}
			<div className="card" style={{ padding: "24px", marginTop: "24px" }}>
				<h2 style={{ marginTop: 0, color: "var(--brand)", fontSize: "24px" }}>🕐 Recent Activity</h2>
				{analytics.recentActivity.length === 0 ? (
					<p style={{ color: "var(--muted)", marginTop: "16px" }}>No recent activity.</p>
				) : (
					<div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px", marginTop: "16px" }}>
						{analytics.recentActivity.map((q) => (
							<div
								key={q.id}
								style={{
									padding: "16px",
									background: "rgba(255, 62, 165, 0.05)",
									borderRadius: "8px",
									border: "1px solid var(--border)",
								}}
							>
								<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
									<span style={{ color: "var(--accent)", fontWeight: "bold" }}>#{q.id} — {q.category}</span>
									<span style={{ color: "var(--muted)", fontSize: "14px" }}>{new Date(q.createdAt).toLocaleString()}</span>
								</div>
								<p style={{ color: "var(--text)", margin: 0 }}>{q.text}</p>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

