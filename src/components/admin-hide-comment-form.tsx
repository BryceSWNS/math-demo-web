import { hideCommentAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

type Props = {
  commentId: string;
  problemId: string;
};

export function AdminHideCommentForm({ commentId, problemId }: Props) {
  return (
    <form action={hideCommentAction} className="admin-form inline-form">
      <input type="hidden" name="commentId" value={commentId} />
      <input type="hidden" name="problemId" value={problemId} />
      <input type="text" name="operatorAlias" placeholder="管理员名" defaultValue="admin" />
      <input type="text" name="hiddenReason" placeholder="隐藏原因" defaultValue="违规内容" />
      <input type="password" name="adminToken" placeholder="admin token" required />
      <SubmitButton text="隐藏评论" pendingText="处理中..." />
    </form>
  );
}
