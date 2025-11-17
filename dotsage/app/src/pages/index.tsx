import Link from "next/link";
import Image from "next/image";
import Navigation from "@components/Navigation";

export default function Home() {
	return (
		<div className="container">
			<Navigation />
			<div className="hero" style={{ textAlign: "center", padding: "48px 24px" }}>
				<div className="logo-container">
					<Image 
						src="/images/logo.png" 
						alt="DotSage Logo" 
						width={200} 
						height={200}
						style={{ maxWidth: "200px", height: "auto" }}
						priority
					/>
				</div>
				<div className="kicker" style={{ justifyContent: "center" }}>
					<span className="badge">DotSage</span>
					<span>AI-Powered Polkadot Learning Chatbot</span>
				</div>
				<h1 className="title" style={{ fontSize: "56px", marginTop: "24px" }}>
					Bring Web2 Applications to Web3
				</h1>
				<p className="subtitle" style={{ fontSize: "20px", maxWidth: "700px", margin: "24px auto" }}>
					Ask anything about Polkadot. Get AI-generated answers grounded in official docs. 
					Log questions on-chain. Vote and explore trending topics.
				</p>
				<div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "32px", flexWrap: "wrap" }}>
					<Link href="/ask" className="btn" style={{ textDecoration: "none", fontSize: "18px", padding: "16px 32px" }}>
						Start Asking
					</Link>
					<Link href="/explore" className="btn secondary" style={{ textDecoration: "none", fontSize: "18px", padding: "16px 32px" }}>
						Explore Questions
					</Link>
					<Link href="/analytics" className="btn secondary" style={{ textDecoration: "none", fontSize: "18px", padding: "16px 32px" }}>
						📊 Analytics
					</Link>
				</div>
			</div>

			<section style={{ marginTop: "64px" }}>
				<div className="card" style={{ padding: "32px" }}>
					<h2 style={{ marginTop: 0, fontSize: "32px", color: "var(--brand)", textAlign: "center", marginBottom: "32px" }}>🎬 Demo Videos</h2>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "32px" }}>
						<div className="video-container">
							<iframe
								src="https://www.youtube.com/embed/4JksX48qTH8"
								title="DotSage Demo Video 1"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							/>
						</div>
						<div className="video-container">
							<iframe
								src="https://www.youtube.com/embed/9obNyBCh7iY"
								title="DotSage Demo Video 2"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							/>
						</div>
						<div className="video-container">
							<iframe
								src="https://www.youtube.com/embed/G5wayIs7jts"
								title="DotSage Demo Video 3"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							/>
						</div>
					</div>
					<h2 style={{ marginTop: "48px", fontSize: "32px", color: "var(--brand)" }}>About the Hackathon</h2>
					<div style={{ lineHeight: "1.8", fontSize: "16px" }}>
						<p>
							One of Web3's key promises is to deliver a <strong>decentralized and fair internet</strong> where users control their own data, identity, and destiny. 
							So far, the smart contracts-driven Web3 applications centered around cryptocurrency, payments, decentralized finance, and memes have dominated 
							the Web3 and Blockchain technology narrative. <strong>Polkadot is set out to expand Web3's horizons</strong> through its Rust-powered SDK and Web3 Cloud architecture.
						</p>
						<p>
							In this <strong>6-week hackathon</strong>, use any of the Polkadot ecosystem's SDKs, APIs, Tools, and Infrastructure to build apps or proofs of concept 
							to compete for a <strong>$40K prize pool</strong>. Our motto: <em>radically open, radically useful</em>.
						</p>
					</div>
				</div>
			</section>

			<section style={{ marginTop: "48px" }}>
				<h2 style={{ fontSize: "28px", marginBottom: "24px" }}>Hackathon Themes</h2>
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
					<div className="card" style={{ padding: "24px" }}>
						<h3 style={{ marginTop: 0, color: "var(--brand)", fontSize: "22px" }}>User-centric Apps</h3>
						<p style={{ lineHeight: "1.7" }}>
							Staying true to the principles of Web3, build apps that prioritize the user's interests and have real-world impact using the 
							decentralized Polkadot Technology Stack and its ecosystem projects, Polkadot and/or Parachain APIs, tools, and infrastructure.
						</p>
					</div>

					<div className="card" style={{ padding: "24px" }}>
						<h3 style={{ marginTop: 0, color: "var(--brand)", fontSize: "22px" }}>Build a Blockchain</h3>
						<p style={{ lineHeight: "1.7" }}>
							The Polkadot SDK enables you to seamlessly build and deploy custom blockchains to the Polkadot Cloud for use cases that cannot 
							be realized through smart contracts. With Polkadot SDK's ready-to-use blockchain templates, you can explore novel Web3 use cases.
						</p>
					</div>

					<div className="card" style={{ padding: "24px" }}>
						<h3 style={{ marginTop: 0, color: "var(--brand)", fontSize: "22px" }}>Polkadot Tinkerers</h3>
						<p style={{ lineHeight: "1.7" }}>
							We leave this one open to your imagination. Tinker with Polkadot's libraries, apps, privacy tech, on-chain compute, and cross-chain magic, 
							do data crunching/visualizations, improve UX of existing apps and also vibe code! Also, create proof of concepts with the Polkadot technology 
							stack and bring your ideas to life.
						</p>
					</div>
				</div>
			</section>

			<section style={{ marginTop: "64px" }}>
				<div className="card" style={{ padding: "32px", background: "linear-gradient(180deg, rgba(255,62,165,0.1), rgba(255,179,219,0.15))" }}>
					<h2 style={{ marginTop: 0, fontSize: "28px" }}>How DotSage Works</h2>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginTop: "24px" }}>
						<div>
							<h4 style={{ color: "var(--brand)", marginBottom: "8px" }}>1. Ask</h4>
							<p style={{ margin: 0, lineHeight: "1.6" }}>Ask any question about Polkadot, governance, parachains, or the ecosystem.</p>
						</div>
						<div>
							<h4 style={{ color: "var(--brand)", marginBottom: "8px" }}>2. Get AI Answer</h4>
							<p style={{ margin: 0, lineHeight: "1.6" }}>Receive concise, source-linked answers powered by AI and grounded in official documentation.</p>
						</div>
						<div>
							<h4 style={{ color: "var(--brand)", marginBottom: "8px" }}>3. Log On-Chain</h4>
							<p style={{ margin: 0, lineHeight: "1.6" }}>Store your question on-chain using ink! smart contracts for permanent, queryable records.</p>
						</div>
						<div>
							<h4 style={{ color: "var(--brand)", marginBottom: "8px" }}>4. Vote & Explore</h4>
							<p style={{ margin: 0, lineHeight: "1.6" }}>Community votes on answer usefulness and surfaces trending questions.</p>
						</div>
					</div>
				</div>
			</section>

			<section style={{ marginTop: "48px", textAlign: "center" }}>
				<div className="card" style={{ padding: "32px" }}>
					<h2 style={{ marginTop: 0, fontSize: "28px" }}>Built with Polkadot</h2>
					<p style={{ fontSize: "16px", lineHeight: "1.8", maxWidth: "600px", margin: "0 auto" }}>
						DotSage uses <strong>ink! smart contracts</strong> on a contracts-enabled Polkadot SDK chain to store questions and vote counts. 
						The frontend uses <strong>@polkadot/api</strong> and <strong>@polkadot/api-contract</strong> to interact with the blockchain, 
						demonstrating how Web2 applications can seamlessly integrate Web3 capabilities.
					</p>
					<div style={{ marginTop: "32px" }}>
						<Link href="/ask" className="btn" style={{ textDecoration: "none", fontSize: "18px", padding: "16px 32px" }}>
							Try DotSage Now
						</Link>
					</div>
				</div>
			</section>

			<footer style={{ marginTop: "64px", padding: "32px 0", textAlign: "center", borderTop: "1px solid var(--border)", color: "var(--muted)" }}>
				<p style={{ margin: 0 }}>
					Check out the <a href="#" className="link" target="_blank" rel="noreferrer">Resources tab</a> to find the Polkadot hackathon guide 
					and join our official support channel if you have any questions!
				</p>
			</footer>
		</div>
	);
}
