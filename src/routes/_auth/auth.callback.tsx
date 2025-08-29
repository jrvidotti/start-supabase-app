import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMutation } from "../../hooks/useMutation";
import { exchangeCodeFn } from "../../utils/auth";

export const Route = createFileRoute("/_auth/auth/callback")({
  validateSearch: (search) => ({
    code: (search?.code as string) || "",
  }),
  component: AuthCallbackComp,
});

function AuthCallbackComp() {
  const router = useRouter();
  const { code } = Route.useSearch();

  const exchangeMutation = useMutation({
    fn: exchangeCodeFn,
    onSuccess: async (ctx) => {
      if (ctx.data?.success) {
        // Invalidate router to refresh user context
        await router.invalidate();
        // Redirect to home after successful confirmation
        setTimeout(() => {
          router.navigate({ to: "/" });
        }, 2000);
      }
    },
  });

  useEffect(() => {
    if (code && exchangeMutation.status === "idle") {
      exchangeMutation.mutate({ data: { code } });
    }
  }, [code, exchangeMutation]);

  if (!code) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-black flex items-start justify-center p-8">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold mb-4">
              Invalid confirmation link
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The confirmation link appears to be invalid or expired.
            </p>
            <Link to="/login" className="text-blue-500 hover:underline">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (exchangeMutation.status === "pending") {
    return (
      <div className="fixed inset-0 bg-white dark:bg-black flex items-start justify-center p-8">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold mb-4">
              Confirming your account...
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Please wait while we verify your email.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (exchangeMutation.data?.error) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-black flex items-start justify-center p-8">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold mb-4">Confirmation failed</h1>
            <p className="text-red-400 mb-4">
              {exchangeMutation.data?.message}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The confirmation link may be expired or invalid.
            </p>
            <Link to="/login" className="text-blue-500 hover:underline">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (exchangeMutation.data?.success) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-black flex items-start justify-center p-8">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-4">Email confirmed!</h1>
            <p className="text-green-600 dark:text-green-400 mb-4">
              Your account has been successfully verified and you are now logged
              in.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Redirecting you to the home page...
            </p>
            <Link to="/" className="text-blue-500 hover:underline">
              Continue to Home →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
