import { useWallet } from "@lib/useWallet";

export default function WalletButton() {
	const { isConnected, account, accounts, extensionName, error, connectWallet, disconnectWallet } = useWallet();

	const formatAddress = (address: string): string => {
		if (address.length <= 13) return address;
		return `${address.slice(0, 6)}...${address.slice(-6)}`;
	};

	if (isConnected && account) {
		return (
			<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
				<div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", fontSize: "14px" }}>
					<span style={{ color: "var(--text)", fontWeight: "600" }}>
						{account.name || formatAddress(account.address)}
					</span>
					<span style={{ color: "var(--muted)", fontSize: "12px" }}>
						{extensionName || account.source} {accounts.length > 1 && `(${accounts.length} accounts)`}
					</span>
				</div>
				<button
					className="btn secondary"
					onClick={disconnectWallet}
					style={{ padding: "8px 16px", fontSize: "14px" }}
					title="Disconnect wallet"
				>
					Disconnect
				</button>
			</div>
		);
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
			<button
				className="btn"
				onClick={connectWallet}
				style={{ padding: "10px 20px", fontSize: "14px" }}
			>
				🔗 Connect Wallet
			</button>
			{error && (
				<div style={{ fontSize: "12px", color: "var(--brand)", maxWidth: "250px", textAlign: "right" }}>
					{error}
				</div>
			)}
			{!error && (
				<div style={{ fontSize: "11px", color: "var(--muted)", textAlign: "right" }}>
					Supports Talisman & Polkadot.js
				</div>
			)}
		</div>
	);
}

