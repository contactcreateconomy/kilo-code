import { redirect } from "next/navigation";

/**
 * Sign-up page redirects to sign-in.
 *
 * Authentication is handled entirely through the sign-in page which
 * supports both email/password sign-in and OAuth (Google, GitHub).
 * New users are automatically created on first OAuth sign-in.
 */
export default function SignUpPage() {
  redirect("/auth/signin");
}
