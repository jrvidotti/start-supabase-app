import * as React from "react";
import { searchTags } from "~/utils/tags";
import type { Tag } from "~/db";

interface TagsInputProps {
	value: string[];
	onChange: (tags: string[]) => void;
	placeholder?: string;
	disabled?: boolean;
}

export function TagsInput({
	value = [],
	onChange,
	placeholder = "Add tags...",
	disabled = false,
}: TagsInputProps) {
	const [inputValue, setInputValue] = React.useState("");
	const [suggestions, setSuggestions] = React.useState<Tag[]>([]);
	const [showSuggestions, setShowSuggestions] = React.useState(false);
	const [selectedIndex, setSelectedIndex] = React.useState(-1);
	const inputRef = React.useRef<HTMLInputElement>(null);
	const suggestionsRef = React.useRef<HTMLDivElement>(null);

	const debouncedSearchTags = React.useMemo(
		() => debounce(async (term: string) => {
			try {
				const results = await searchTags({ data: term });
				setSuggestions(results.filter(tag => !value.includes(tag.name)));
			} catch (error) {
				console.error("Error searching tags:", error);
				setSuggestions([]);
			}
		}, 300),
		[value]
	);

	React.useEffect(() => {
		debouncedSearchTags(inputValue);
		setSelectedIndex(-1);
	}, [inputValue, debouncedSearchTags]);

	const addTag = (tagName: string) => {
		const trimmedTag = tagName.trim();
		if (trimmedTag && !value.includes(trimmedTag)) {
			onChange([...value, trimmedTag]);
			setInputValue("");
			setShowSuggestions(false);
			setSelectedIndex(-1);
		}
	};

	const removeTag = (tagToRemove: string) => {
		onChange(value.filter(tag => tag !== tagToRemove));
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (disabled) return;

		switch (e.key) {
			case "Enter":
				e.preventDefault();
				if (selectedIndex >= 0 && suggestions[selectedIndex]) {
					addTag(suggestions[selectedIndex].name);
				} else if (inputValue.trim()) {
					addTag(inputValue.trim());
				}
				break;

			case "ArrowDown":
				e.preventDefault();
				setSelectedIndex(prev => 
					prev < suggestions.length - 1 ? prev + 1 : prev
				);
				break;

			case "ArrowUp":
				e.preventDefault();
				setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
				break;

			case "Escape":
				setShowSuggestions(false);
				setSelectedIndex(-1);
				break;

			case "Backspace":
				if (!inputValue && value.length > 0) {
					removeTag(value[value.length - 1]);
				}
				break;

			case "Tab":
				if (showSuggestions && selectedIndex >= 0) {
					e.preventDefault();
					addTag(suggestions[selectedIndex].name);
				}
				break;
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!disabled) {
			setInputValue(e.target.value);
		}
	};

	const handleSuggestionClick = (tag: Tag) => {
		addTag(tag.name);
		inputRef.current?.focus();
	};

	const handleInputFocus = () => {
		setShowSuggestions(true);
		// If input is empty, load all available tags
		if (!inputValue.trim()) {
			debouncedSearchTags("");
		}
	};

	const handleInputBlur = (e: React.FocusEvent) => {
		if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
			setTimeout(() => {
				setShowSuggestions(false);
				setSelectedIndex(-1);
			}, 150);
		}
	};

	return (
		<div className="relative">
			<div className="w-full min-h-[42px] p-2 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 dark:bg-gray-800 dark:border-gray-600">
				<div className="flex flex-wrap gap-1">
					{value.map((tag) => (
						<span
							key={tag}
							className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
						>
							{tag}
							{!disabled && (
								<button
									type="button"
									onClick={() => removeTag(tag)}
									className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
								>
									×
								</button>
							)}
						</span>
					))}
					<input
						ref={inputRef}
						type="text"
						value={inputValue}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						onFocus={handleInputFocus}
						onBlur={handleInputBlur}
						placeholder={value.length === 0 ? placeholder : ""}
						disabled={disabled}
						className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
					/>
				</div>
			</div>

			{showSuggestions && (suggestions.length > 0 || inputValue.trim() === "") && (
				<div
					ref={suggestionsRef}
					className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
				>
					{suggestions.length > 0 ? (
						<>
							<div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
								{inputValue.trim() ? "Matching tags:" : "Available tags:"}
							</div>
							{suggestions.map((tag, index) => (
								<button
									key={tag.id}
									type="button"
									onClick={() => handleSuggestionClick(tag)}
									className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
										index === selectedIndex
											? "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
											: "text-gray-900 dark:text-gray-100"
									}`}
								>
									{tag.name}
								</button>
							))}
						</>
					) : (
						<div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
							{inputValue.trim() ? "No matching tags found. Press Enter to create a new tag." : "No tags available yet."}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

function debounce<T extends (...args: any[]) => any>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func(...args), delay);
	};
}