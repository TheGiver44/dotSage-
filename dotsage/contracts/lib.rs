#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod dotsage_questions {
	use ink::prelude::string::String;
	use ink::prelude::vec::Vec;
		use scale::{Decode, Encode};
		// Avoid requiring TypeInfo on custom structs by storing SCALE-encoded bytes in Mapping.
		use scale_info::TypeInfo;

		#[derive(Encode, Decode, TypeInfo, Clone, Copy, PartialEq, Eq, Debug)]
	pub enum Category {
		Docs,
		Builders,
		Governance,
		Ecosystem,
	}

		#[derive(Encode, Decode, Clone, Debug)]
	pub struct Question {
		pub id: u32,
		pub author: AccountId,
		pub text: String,
		pub category: Category,
		pub created_at: u64,
		pub upvotes: u32,
		pub downvotes: u32,
	}

	#[ink(event)]
	pub struct QuestionAsked {
		#[ink(topic)]
		pub id: u32,
		#[ink(topic)]
		pub author: AccountId,
		pub category: Category,
	}

	#[ink(event)]
	pub struct QuestionVoted {
		#[ink(topic)]
		pub id: u32,
		#[ink(topic)]
		pub voter: AccountId,
		pub is_up: bool,
	}

	/// Main contract storage structure
	/// Uses Mapping for efficient key-value storage with SCALE encoding for cost optimization
	#[ink(storage)]
	pub struct DotsageQuestions {
		/// Auto-incrementing ID for questions (prevents collisions)
		next_id: u32,
		/// Storage mapping: question_id -> SCALE-encoded Question bytes
		/// Using Vec<u8> instead of Question directly avoids requiring TypeInfo on custom types
		questions: ink::storage::Mapping<u32, Vec<u8>>,
	}

	impl DotsageQuestions {
		/// Constructor: Initializes the contract with empty state
		#[ink(constructor)]
		pub fn new() -> Self {
			Self {
				next_id: 0,
				questions: ink::storage::Mapping::default(),
			}
		}

		/// Creates a new question and stores it on-chain.
		/// 
		/// # Arguments
		/// * `text` - Question text (truncated to 256 chars to prevent storage bloat)
		/// * `category` - Question category enum (Docs, Builders, Governance, Ecosystem)
		/// * `created_at` - Unix timestamp in milliseconds
		/// 
		/// # Returns
		/// The unique question ID assigned to this question
		/// 
		/// # Events
		/// Emits `QuestionAsked` event with question ID, author, and category
		#[ink(message)]
		pub fn ask_question(&mut self, text: String, category: Category, created_at: u64) -> u32 {
			let caller = self.env().caller();

			// limit text size to prevent bloat (truncate to 256 chars)
			let mut limited = text;
			if limited.len() > 256 {
				limited.truncate(256);
			}

			let id = self.next_id;
			self.next_id = self
				.next_id
				.checked_add(1)
				.expect("question id overflow");

			let q = Question {
				id,
				author: caller,
				text: limited,
				category,
				created_at,
				upvotes: 0,
				downvotes: 0,
			};
			let encoded = q.encode();
			self.questions.insert(id, &encoded);

			self.env().emit_event(QuestionAsked {
				id,
				author: caller,
				category,
			});

			id
		}

		/// Votes on a question (upvote or downvote).
		/// 
		/// # Arguments
		/// * `question_id` - The ID of the question to vote on
		/// * `is_up` - true for upvote, false for downvote
		/// 
		/// # Returns
		/// true if vote was successful, false if question doesn't exist
		/// 
		/// # Events
		/// Emits `QuestionVoted` event with question ID, voter, and vote direction
		#[ink(message)]
		pub fn vote(&mut self, question_id: u32, is_up: bool) -> bool {
			let voter = self.env().caller();
			let mut q: Question = match self.questions.get(question_id).and_then(|b| Decode::decode(&mut &b[..]).ok()) {
				Some(found) => found,
				None => return false,
			};

			if is_up {
				q.upvotes = q.upvotes.saturating_add(1);
			} else {
				q.downvotes = q.downvotes.saturating_add(1);
			}

			self.questions.insert(question_id, &q.encode());
			self.env().emit_event(QuestionVoted {
				id: question_id,
				voter,
				is_up,
			});
			true
		}

		/// Retrieves a single question by ID.
		/// 
		/// Returns a compact tuple to avoid requiring TypeInfo on custom types.
		/// Tuple format: (id, author, text, category_index, created_at, upvotes, downvotes)
		/// 
		/// # Arguments
		/// * `question_id` - The ID of the question to retrieve
		/// 
		/// # Returns
		/// Some(tuple) if question exists, None otherwise
		#[ink(message)]
		pub fn get_question(&self, question_id: u32) -> Option<(u32, AccountId, String, u32, u64, u32, u32)> {
			self.questions
				.get(question_id)
				.and_then(|b| {
					let decoded: Result<Question, scale::Error> = Decode::decode(&mut &b[..]);
					decoded.ok()
				})
				.map(|q: Question| {
				let cat_index: u32 = match q.category {
					Category::Docs => 0,
					Category::Builders => 1,
					Category::Governance => 2,
					Category::Ecosystem => 3,
				};
				(q.id, q.author, q.text, cat_index, q.created_at, q.upvotes, q.downvotes)
			})
		}

		/// Retrieves multiple questions with pagination support.
		/// 
		/// # Arguments
		/// * `offset` - Starting question ID (0-indexed)
		/// * `limit` - Maximum number of questions to return
		/// 
		/// # Returns
		/// Vector of question tuples in the same format as get_question
		/// Returns questions from offset to (offset + limit)
		/// 
		/// # Note
		/// This is a simple linear scan. For production, consider implementing
		/// indexed queries or off-chain indexing for better performance.
		#[ink(message)]
		pub fn get_questions(&self, offset: u32, limit: u32) -> Vec<(u32, AccountId, String, u32, u64, u32, u32)> {
			let mut items: Vec<(u32, AccountId, String, u32, u64, u32, u32)> = Vec::new();
			let start = offset;
			let end = offset.saturating_add(limit);
			let max_id = self.next_id;
			let real_end = end.min(max_id);
			let mut current = start;
			while current < real_end {
				if let Some(q) = self
					.questions
					.get(current)
					.and_then(|b| {
						let decoded: Result<Question, scale::Error> = Decode::decode(&mut &b[..]);
						decoded.ok()
					}) {
					let cat_index: u32 = match q.category {
						Category::Docs => 0,
						Category::Builders => 1,
						Category::Governance => 2,
						Category::Ecosystem => 3,
					};
					items.push((q.id, q.author, q.text, cat_index, q.created_at, q.upvotes, q.downvotes));
				}
				current = current.saturating_add(1);
			}
			items
		}
	}
}


