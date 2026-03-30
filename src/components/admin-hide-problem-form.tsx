import { hideProblemAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

type Props = {
  problemId: string;
};

export function AdminHideProblemForm({ problemId }: Props) {
  return (
    <form action={hideProblemAction} className="admin-form inline-form">
      <input type="hidden" name="problemId" value={problemId} />
      <input type="text" name="operatorAlias" placeholder="管理员名" defaultValue="admin" />
      <input type="password" name="adminToken" placeholder="admin token" required />
      <SubmitButton text="隐藏题目" pendingText="处理中..." />
    </form>
  );
}
