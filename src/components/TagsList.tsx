import { Badge } from "~/components/ui/badge";

interface TagsListProps {
	tags: string[];
	className?: string;
}

export function TagsList({ tags, className = "" }: TagsListProps) {
	if (!tags || tags.length === 0) {
		return null;
	}

	return (
		<div className={`flex flex-wrap gap-1 ${className}`}>
			{tags.map((tag, index) => (
				<Badge
					key={`${tag}-${index}`}
					variant="secondary"
					className="text-xs"
				>
					{tag}
				</Badge>
			))}
		</div>
	);
}
