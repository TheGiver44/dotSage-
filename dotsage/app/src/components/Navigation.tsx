import Link from "next/link";
import { useRouter } from "next/router";
import WalletButton from "./WalletButton";

export default function Navigation() {
	const router = useRouter();
	const currentPath = router.pathname;

	return (
		<nav style={{ 
			display: "flex", 
			justifyContent: "space-between", 
			alignItems: "center",
			marginBottom: "24px",
			padding: "16px 0",
			borderBottom: "1px solid var(--border)"
		}}>
			<div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
				<Link 
					href="/" 
					className="link" 
					style={{ 
						textDecoration: "none",
						fontWeight: currentPath === "/" ? "bold" : "normal",
						color: currentPath === "/" ? "var(--brand)" : "var(--text)"
					}}
				>
					Home
				</Link>
				<span style={{ color: "var(--muted)" }}>|</span>
				<Link 
					href="/ask" 
					className="link" 
					style={{ 
						textDecoration: "none",
						fontWeight: currentPath === "/ask" ? "bold" : "normal",
						color: currentPath === "/ask" ? "var(--brand)" : "var(--text)"
					}}
				>
					Ask
				</Link>
				<span style={{ color: "var(--muted)" }}>|</span>
				<Link 
					href="/explore" 
					className="link" 
					style={{ 
						textDecoration: "none",
						fontWeight: currentPath === "/explore" ? "bold" : "normal",
						color: currentPath === "/explore" ? "var(--brand)" : "var(--text)"
					}}
				>
					Explore
				</Link>
				<span style={{ color: "var(--muted)" }}>|</span>
				<Link 
					href="/analytics" 
					className="link" 
					style={{ 
						textDecoration: "none",
						fontWeight: currentPath === "/analytics" ? "bold" : "normal",
						color: currentPath === "/analytics" ? "var(--brand)" : "var(--text)"
					}}
				>
					Analytics
				</Link>
			</div>
			<WalletButton />
		</nav>
	);
}

