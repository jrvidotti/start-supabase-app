import type { ErrorComponentProps } from "@tanstack/react-router";
import {
  createFileRoute,
  ErrorComponent,
  useNavigate,
} from "@tanstack/react-router";
import { NotFound } from "~/components/NotFound";
import { PostForm, type PostFormData } from "~/components/PostForm";
import { useMutation } from "~/hooks/useMutation";
import { fetchPost, updatePost, deletePost } from "~/utils/posts";
import type { Tag } from "~/db";

export const Route = createFileRoute("/_authed/my-posts/$postId")({
  loader: ({ params: { postId } }) => fetchPost({ data: postId }),
  errorComponent: PostErrorComponent,
  component: PostComponent,
  notFoundComponent: () => {
    return <NotFound>Post not found</NotFound>;
  },
});

function PostErrorComponent({ error }: ErrorComponentProps) {
  return <ErrorComponent error={error} />;
}

function PostComponent() {
  const post = Route.useLoaderData();
  const navigate = useNavigate();

  const updateMutation = useMutation({
    fn: updatePost,
    onSuccess: () => {
      navigate({ to: "/my-posts" });
    },
  });

  const deleteMutation = useMutation({
    fn: deletePost,
    onSuccess: () => {
      navigate({ to: "/my-posts" });
    },
  });

  const handleSubmit = (data: PostFormData) => {
    updateMutation.mutate({
      data: {
        id: post.id,
        title: data.title,
        body: data.body || undefined,
        status: data.status,
        tags: data.tags,
      },
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate({ data: post.id });
  };

  return (
    <PostForm
      key={post.id}
      title="Edit Post"
      initialData={{
        title: post.title,
        body: post.body || "",
        status: post.status,
        tags: post.tags?.map((tag: Tag) => tag.name) || [],
      }}
      submitButtonText="Save Changes"
      onSubmit={handleSubmit}
      isSubmitting={updateMutation.status === "pending"}
      error={
        updateMutation.status === "error"
          ? `Failed to save post: ${updateMutation.error?.message}`
          : undefined
      }
      showDeleteButton={true}
      onDelete={handleDelete}
      isDeletingButtonText="Delete Post"
      isDeleting={deleteMutation.status === "pending"}
      deleteError={
        deleteMutation.status === "error"
          ? `Failed to delete post: ${deleteMutation.error?.message}`
          : undefined
      }
    />
  );
}
