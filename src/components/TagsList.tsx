interface TagsListProps {
	tags: Array<{ name: string; id?: string }>;
	className?: string;
}

export function TagsList({ tags, className = "" }: TagsListProps) {
	if (!tags || tags.length === 0) {
		return null;
	}

	return (
		<div className={`flex flex-wrap gap-1 ${className}`}>
			{tags.map((tag, index) => (
				<span
					key={tag.id || `${tag.name}-${index}`}
					className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
				>
					{tag.name}
				</span>
			))}
		</div>
	);
}
