import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Navigation from "@components/Navigation";
import { fetchRecentQuestions, voteOnQuestion, subscribeToContractEvents } from "@lib/polkadot";
import { EXAMPLE_QUESTIONS, type Question } from "@lib/exampleQuestions";

type Category = "Docs" | "Builders" | "Governance" | "Ecosystem";

type SortOption = "trending" | "newest" | "oldest" | "most_votes" | "highest_score";

export default function Explore() {
	const [questions, setQuestions] = useState<Question[]>([]);
	const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [errorMsg, setErrorMsg] = useState<string>("");
	const [showExamples, setShowExamples] = useState<boolean>(false);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [selectedCategory, setSelectedCategory] = useState<Category | "All">("All");
	const [sortBy, setSortBy] = useState<SortOption>("trending");

	useEffect(() => {
		void (async () => {
			setLoading(true);
			setErrorMsg("");
			setShowExamples(false);
			try {
				const data = await fetchRecentQuestions({ offset: 0, limit: 20 });
				if (data.length === 0) {
					// No questions found, show examples
					setShowExamples(true);
					setQuestions(EXAMPLE_QUESTIONS);
				} else {
					setQuestions(data);
					setFilteredQuestions(data);
				}
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : "Failed to fetch questions.";
				// If it's a connection error, show error. Otherwise show examples.
				if (errorMessage.includes("Cannot connect") || errorMessage.includes("Connection timeout") || errorMessage.includes("ECONNREFUSED") || errorMessage.includes("failed")) {
					setErrorMsg(errorMessage);
				} else {
					// For other errors (like contract not deployed or no questions), show examples
					setShowExamples(true);
					setQuestions(EXAMPLE_QUESTIONS);
					setFilteredQuestions(EXAMPLE_QUESTIONS);
					setErrorMsg(""); // Clear error to show examples
				}
			} finally {
				setLoading(false);
			}
		})();

		// Subscribe to real-time contract events for live updates
		// This enables the UI to update automatically when new questions are asked or votes are cast
		if (typeof window !== "undefined") {
			try {
				const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:9944";
				const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
				
				if (wsUrl && contractAddress && !wsUrl.includes("xxxxxxxx") && !contractAddress.includes("xxxxxxxx")) {
					const unsubscribe = subscribeToContractEvents(
						{ wsUrl, contractAddress },
						// Handle new question event
						(event) => {
							// Refresh questions list when new question is asked
							fetchRecentQuestions({ offset: 0, limit: 20 })
								.then((data) => {
									if (data.length > 0) {
										setQuestions(data);
										setFilteredQuestions(data);
										setShowExamples(false);
									}
								})
								.catch(() => {
									// Silently fail - user can manually refresh
								});
						},
						// Handle vote event
						(event) => {
							// Optimistically update vote counts
							setQuestions((prev) =>
								prev.map((q) =>
									q.id === event.id
										? {
												...q,
												upvotes: event.isUp ? q.upvotes + 1 : q.upvotes,
												downvotes: !event.isUp ? q.downvotes + 1 : q.downvotes,
										  }
										: q
								)
							);
							setFilteredQuestions((prev) =>
								prev.map((q) =>
									q.id === event.id
										? {
												...q,
												upvotes: event.isUp ? q.upvotes + 1 : q.upvotes,
												downvotes: !event.isUp ? q.downvotes + 1 : q.downvotes,
										  }
										: q
								)
							);
						}
					);

					// Cleanup subscription on unmount
					return () => {
						unsubscribe();
					};
				}
			} catch (error) {
				// Silently fail - polling will still work
				console.debug("Event subscription failed:", error);
			}
		}
	}, []);

	const onVote = useCallback(
		async (id: number, isUp: boolean) => {
			try {
				await voteOnQuestion({ id, isUp });
				// optimistic update
				setQuestions((prev) =>
					prev.map((q) =>
						q.id === id
							? {
									...q,
									upvotes: isUp ? q.upvotes + 1 : q.upvotes,
									downvotes: !isUp ? q.downvotes + 1 : q.downvotes,
							  }
							: q
					)
				);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : "Voting failed. Ensure wallet is connected and the contracts node is running.";
				alert(`Voting failed: ${errorMessage}`);
			}
		},
		[]
	);

	const shareQuestion = useCallback((question: Question) => {
		const shareText = `Check out this Polkadot question on DotSage:\n\n"${question.text}"\n\nCategory: ${question.category}\nScore: ${question.upvotes - question.downvotes} (↑${question.upvotes} / ↓${question.downvotes})\n\n`;
		const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/explore?q=${question.id}` : "";
		
		if (navigator.share) {
			navigator.share({
				title: `Question #${question.id} - DotSage`,
				text: shareText,
				url: shareUrl,
			}).catch(() => {
				// Fallback to clipboard
				copyToClipboard(shareText + shareUrl);
			});
		} else {
			// Fallback to clipboard
			copyToClipboard(shareText + shareUrl);
		}
	}, []);

	const copyToClipboard = useCallback((text: string) => {
		if (typeof window !== "undefined" && navigator.clipboard) {
			navigator.clipboard.writeText(text).then(() => {
				alert("Question link copied to clipboard!");
			}).catch(() => {
				alert("Failed to copy to clipboard");
			});
		}
	}, []);

	// Filter and sort questions
	useEffect(() => {
		let filtered = [...questions];

		// Filter by category
		if (selectedCategory !== "All") {
			filtered = filtered.filter((q) => q.category === selectedCategory);
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter((q) => q.text.toLowerCase().includes(query));
		}

		// Sort questions
		filtered.sort((a, b) => {
			switch (sortBy) {
				case "trending": {
					// Trending: combination of score and recency
					const scoreA = a.upvotes - a.downvotes;
					const scoreB = b.upvotes - b.downvotes;
					const timeA = Date.now() - a.createdAt;
					const timeB = Date.now() - b.createdAt;
					// Higher score + more recent = more trending
					const trendingScoreA = scoreA * (1 + 1 / (1 + timeA / 86400000)); // Days
					const trendingScoreB = scoreB * (1 + 1 / (1 + timeB / 86400000));
					return trendingScoreB - trendingScoreA;
				}
				case "newest":
					return b.createdAt - a.createdAt;
				case "oldest":
					return a.createdAt - b.createdAt;
				case "most_votes":
					return (b.upvotes + b.downvotes) - (a.upvotes + a.downvotes);
				case "highest_score":
					return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
				default:
					return 0;
			}
		});

		setFilteredQuestions(filtered);
	}, [questions, searchQuery, selectedCategory, sortBy]);

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
					<p style={{ color: "var(--muted)", fontSize: "18px" }}>Loading questions...</p>
				</div>
				<style jsx>{`
					@keyframes spin {
						to { transform: rotate(360deg); }
					}
				`}</style>
			</div>
		);
	}
	
	if (errorMsg) {
		return (
			<div className="container">
				<Navigation />
				<div className="card" style={{ padding: "24px", marginTop: "24px" }}>
					<h2 style={{ marginTop: 0, color: "var(--brand)" }}>⚠️ Connection Error</h2>
					<p style={{ color: "var(--text)", whiteSpace: "pre-line", marginBottom: "16px" }}>{errorMsg}</p>
					{(errorMsg.includes("Cannot connect to blockchain") || errorMsg.includes("Connection timeout")) && (
						<div style={{ padding: "16px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "8px", marginTop: "16px" }}>
							<strong style={{ color: "var(--accent)" }}>Quick Fix:</strong>
							<ol style={{ margin: "8px 0", paddingLeft: "24px", lineHeight: "1.8" }}>
								<li>Open a terminal and run:
									<code style={{ display: "block", marginTop: "4px", padding: "8px", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "4px", fontSize: "14px" }}>
										substrate-contracts-node --dev --tmp
									</code>
								</li>
								<li>Wait for the node to start (you'll see "Running JSON-RPC server" message)</li>
								<li>Refresh this page</li>
							</ol>
						</div>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="container">
			<Navigation />

			<h1 className="title">Explore</h1>
			<p className="subtitle">Trending and recent questions from the community.</p>
			
			{/* Search, Filter, and Sort Controls */}
			<div className="card" style={{ padding: "20px", marginTop: "24px", marginBottom: "24px" }}>
				<div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
					{/* Search Bar */}
					<div>
						<label htmlFor="search" style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "14px", fontWeight: 600 }}>
							🔍 Search Questions
						</label>
						<input
							id="search"
							type="text"
							placeholder="Search by question text..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							style={{
								width: "100%",
								padding: "12px 16px",
								color: "var(--text)",
								background: "var(--card)",
								border: "1px solid var(--border)",
								borderRadius: "10px",
								outline: "none",
								fontSize: "16px",
							}}
							onFocus={(e) => {
								e.target.style.borderColor = "var(--brand)";
								e.target.style.boxShadow = "0 0 0 3px rgba(255,62,165,0.22)";
							}}
							onBlur={(e) => {
								e.target.style.borderColor = "var(--border)";
								e.target.style.boxShadow = "none";
							}}
						/>
					</div>

					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
						{/* Category Filter */}
						<div>
							<label htmlFor="category" style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "14px", fontWeight: 600 }}>
								📁 Category
							</label>
							<select
								id="category"
								value={selectedCategory}
								onChange={(e) => setSelectedCategory(e.target.value as Category | "All")}
								className="select"
								style={{ width: "100%", fontSize: "16px" }}
							>
								<option value="All">All Categories</option>
								<option value="Docs">Docs</option>
								<option value="Builders">Builders</option>
								<option value="Governance">Governance</option>
								<option value="Ecosystem">Ecosystem</option>
							</select>
						</div>

						{/* Sort Options */}
						<div>
							<label htmlFor="sort" style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "14px", fontWeight: 600 }}>
								🔀 Sort By
							</label>
							<select
								id="sort"
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value as SortOption)}
								className="select"
								style={{ width: "100%", fontSize: "16px" }}
							>
								<option value="trending">🔥 Trending</option>
								<option value="newest">🆕 Newest</option>
								<option value="oldest">⏰ Oldest</option>
								<option value="most_votes">📊 Most Votes</option>
								<option value="highest_score">⭐ Highest Score</option>
							</select>
						</div>
					</div>

					{/* Results Count */}
					<div style={{ color: "var(--muted)", fontSize: "14px", paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
						{filteredQuestions.length === 0 ? (
							<span>No questions found matching your criteria.</span>
						) : (
							<span>
								Showing <strong style={{ color: "var(--accent)" }}>{filteredQuestions.length}</strong> of{" "}
								<strong style={{ color: "var(--accent)" }}>{questions.length}</strong> question{questions.length !== 1 ? "s" : ""}
							</span>
						)}
					</div>
				</div>
			</div>

			{showExamples && (
				<div className="card" style={{ padding: "16px", marginTop: "24px", marginBottom: "24px", backgroundColor: "rgba(255, 62, 165, 0.1)", border: "1px solid var(--brand)" }}>
					<p style={{ margin: 0, color: "var(--text)" }}>
						<strong>📝 Note:</strong> These are example questions. Connect to the blockchain to see real questions from the community.
					</p>
				</div>
			)}
			{questions.length === 0 && !showExamples ? (
				<div className="card" style={{ padding: "32px", marginTop: "24px", textAlign: "center" }}>
					<p style={{ color: "var(--muted)", fontSize: "18px" }}>No questions yet.</p>
					<p style={{ color: "var(--muted)", marginTop: "8px" }}>Be the first to ask a question!</p>
					<Link href="/ask" className="btn" style={{ textDecoration: "none", marginTop: "16px", display: "inline-block" }}>
						Ask a Question
					</Link>
				</div>
			) : filteredQuestions.length === 0 ? (
				<div className="card" style={{ padding: "32px", marginTop: "24px", textAlign: "center" }}>
					<p style={{ color: "var(--muted)", fontSize: "18px" }}>No questions match your search criteria.</p>
					<p style={{ color: "var(--muted)", marginTop: "8px" }}>Try adjusting your filters or search query.</p>
				</div>
			) : (
				<div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginTop: 24 }}>
					{filteredQuestions.map((q) => (
						<div key={q.id} className="card" style={{ padding: 20 }}>
							<div style={{ display: "flex", justifyContent: "space-between" }}>
								<span>
									<strong>#{q.id}</strong> — <em>{q.category}</em>
								</span>
								<span>
									{new Date(q.createdAt).toLocaleString()}
								</span>
							</div>
							<p style={{ marginTop: 8, marginBottom: 8 }}>{q.text}</p>
							<div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "12px" }}>
								By: <Link href={`/user/${encodeURIComponent(q.author)}`} style={{ color: "var(--accent)", textDecoration: "none" }}>
									<code style={{ color: "var(--accent)", fontSize: "11px", cursor: "pointer" }}>
										{q.author.length > 18 ? `${q.author.slice(0, 12)}...${q.author.slice(-6)}` : q.author}
									</code>
								</Link>
							</div>
							<div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
								<button 
									className="btn secondary" 
									onClick={() => void onVote(q.id, true)} 
									style={{ padding: "8px 16px", fontSize: "14px" }}
									disabled={showExamples}
									title={showExamples ? "Example questions cannot be voted on" : ""}
								>
									↑ Upvote
								</button>
								<button 
									className="btn secondary" 
									onClick={() => void onVote(q.id, false)} 
									style={{ padding: "8px 16px", fontSize: "14px" }}
									disabled={showExamples}
									title={showExamples ? "Example questions cannot be voted on" : ""}
								>
									↓ Downvote
								</button>
								<Link 
									href={`/question/${q.id}`}
									className="btn secondary"
									style={{ padding: "8px 16px", fontSize: "14px", textDecoration: "none", display: "inline-block" }}
									title="View question details and answer"
								>
									💬 View Details
								</Link>
								<button 
									className="btn secondary" 
									onClick={() => shareQuestion(q)} 
									style={{ padding: "8px 16px", fontSize: "14px" }}
									title="Share this question"
								>
									🔗 Share
								</button>
								<span className="score" style={{ marginLeft: "auto" }}>
									Score: <strong>{q.upvotes - q.downvotes}</strong> (↑{q.upvotes} / ↓{q.downvotes})
								</span>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}


