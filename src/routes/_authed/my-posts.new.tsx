import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PostForm, type PostFormData } from "~/components/PostForm";
import { useMutation } from "~/hooks/useMutation";
import { createPost } from "~/utils/posts";

export const Route = createFileRoute("/_authed/my-posts/new")({
  component: NewPostComponent,
});

function NewPostComponent() {
  const navigate = useNavigate();

  const createMutation = useMutation({
    fn: createPost,
    onSuccess: () => {
      navigate({ to: "/my-posts" });
    },
  });

  const handleSubmit = (data: PostFormData) => {
    createMutation.mutate({
      data: {
        title: data.title,
        body: data.body || undefined,
        status: data.status,
        tags: data.tags,
        featured_image: data.featured_image,
      },
    });
  };

  return (
    <PostForm
      title="Create New Post"
      submitButtonText="Create Post"
      onSubmit={handleSubmit}
      isSubmitting={createMutation.status === "pending"}
      error={
        createMutation.status === "error"
          ? `Failed to create post: ${createMutation.error?.message}`
          : undefined
      }
    />
  );
}
