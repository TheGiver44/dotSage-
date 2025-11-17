type Category = "Docs" | "Builders" | "Governance" | "Ecosystem";

export type Question = {
	id: number;
	author: string;
	text: string;
	category: Category;
	createdAt: number;
	upvotes: number;
	downvotes: number;
};

// Example questions to show when there are no questions or connection issues
export const EXAMPLE_QUESTIONS: Question[] = [
	{
		id: 1,
		author: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
		text: "How does Polkadot's shared security model work?",
		category: "Docs",
		createdAt: Date.now() - 86400000, // 1 day ago
		upvotes: 12,
		downvotes: 2,
	},
	{
		id: 2,
		author: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
		text: "What's the difference between a parachain and a parathread?",
		category: "Ecosystem",
		createdAt: Date.now() - 172800000, // 2 days ago
		upvotes: 8,
		downvotes: 1,
	},
	{
		id: 3,
		author: "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y",
		text: "How do I build a custom blockchain using the Polkadot SDK?",
		category: "Builders",
		createdAt: Date.now() - 259200000, // 3 days ago
		upvotes: 15,
		downvotes: 0,
	},
	{
		id: 4,
		author: "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3hXF28",
		text: "What is OpenGov and how does it differ from the old governance system?",
		category: "Governance",
		createdAt: Date.now() - 345600000, // 4 days ago
		upvotes: 20,
		downvotes: 3,
	},
	{
		id: 5,
		author: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
		text: "How do I connect my wallet to interact with Polkadot dApps?",
		category: "Builders",
		createdAt: Date.now() - 432000000, // 5 days ago
		upvotes: 6,
		downvotes: 1,
	},
];

/**
 * Get an example question by ID
 */
export function getExampleQuestion(id: number): Question | null {
	return EXAMPLE_QUESTIONS.find((q) => q.id === id) || null;
}

/**
 * Get all example questions for a specific user address
 */
export function getExampleQuestionsForUser(address: string): Question[] {
	return EXAMPLE_QUESTIONS.filter(
		(q) => q.author.toLowerCase() === address.toLowerCase()
	);
}

/**
 * Check if a question ID is from an example question
 */
export function isExampleQuestionId(id: number): boolean {
	return EXAMPLE_QUESTIONS.some((q) => q.id === id);
}

/**
 * Check if an address has example questions
 */
export function hasExampleQuestions(address: string): boolean {
	return EXAMPLE_QUESTIONS.some(
		(q) => q.author.toLowerCase() === address.toLowerCase()
	);
}

