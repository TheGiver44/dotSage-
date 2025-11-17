import { useState, useEffect, useCallback } from "react";

export type WalletAccount = {
	address: string;
	name?: string;
	source: string;
};

export type WalletState = {
	isConnected: boolean;
	account: WalletAccount | null;
	accounts: WalletAccount[];
	extensionName: string | null;
	error: string | null;
};

export function useWallet() {
	const [state, setState] = useState<WalletState>({
		isConnected: false,
		account: null,
		accounts: [],
		extensionName: null,
		error: null,
	});

	const connectWallet = useCallback(async () => {
		if (typeof window === "undefined") {
			setState((prev) => ({ ...prev, error: "Wallet connection requires a browser environment" }));
			return;
		}

		try {
			const { web3Enable, web3Accounts } = await import("@polkadot/extension-dapp");
			
			// Enable all extensions
			const extensions = await web3Enable("DotSage");
			
			if (!extensions || extensions.length === 0) {
				setState((prev) => ({
					...prev,
					error: "No wallet extensions found. Please install Polkadot.js Extension or Talisman.",
					isConnected: false,
					account: null,
					accounts: [],
				}));
				return;
			}

			// Get all accounts from all extensions
			const allAccounts = await web3Accounts();
			
			if (!allAccounts || allAccounts.length === 0) {
				setState((prev) => ({
					...prev,
					error: "No accounts found. Please create or import an account in your wallet extension.",
					isConnected: false,
					account: null,
					accounts: [],
					extensionName: extensions[0]?.name || null,
				}));
				return;
			}

			// Map accounts to our format
			const mappedAccounts: WalletAccount[] = allAccounts.map((acc) => ({
				address: acc.address,
				name: acc.meta.name,
				source: acc.meta.source,
			}));

			// Use the first account by default
			const selectedAccount = mappedAccounts[0];

			setState({
				isConnected: true,
				account: selectedAccount,
				accounts: mappedAccounts,
				extensionName: extensions[0]?.name || null,
				error: null,
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
			setState((prev) => ({
				...prev,
				error: errorMessage,
				isConnected: false,
				account: null,
				accounts: [],
			}));
		}
	}, []);

	const disconnectWallet = useCallback(() => {
		setState({
			isConnected: false,
			account: null,
			accounts: [],
			extensionName: null,
			error: null,
		});
	}, []);

	// Check wallet connection on mount
	useEffect(() => {
		if (typeof window !== "undefined") {
			// Try to reconnect if previously connected
			const checkConnection = async () => {
				try {
					const { web3Accounts } = await import("@polkadot/extension-dapp");
					const accounts = await web3Accounts();
					if (accounts && accounts.length > 0) {
						const mappedAccounts: WalletAccount[] = accounts.map((acc) => ({
							address: acc.address,
							name: acc.meta.name,
							source: acc.meta.source,
						}));
						setState({
							isConnected: true,
							account: mappedAccounts[0],
							accounts: mappedAccounts,
							extensionName: accounts[0]?.meta.source || null,
							error: null,
						});
					}
				} catch {
					// Silently fail - user can connect manually
				}
			};
			void checkConnection();
		}
	}, []);

	return {
		...state,
		connectWallet,
		disconnectWallet,
	};
}

