import { SubmitButton } from "@/components/submit-button";
import { SUBJECT_LABELS, type Subject } from "@/lib/domain/subjects";
import type { ProblemRecord } from "@/lib/domain/types";

type Props = {
  formAction: (formData: FormData) => Promise<void>;
  mode: "create" | "edit";
  initialProblem?: ProblemRecord;
  initialSubject?: Subject;
};

function toOptionsRaw(problem?: ProblemRecord) {
  if (!problem) return "";
  return problem.options.map((opt) => `${opt.key}. ${opt.text}`).join("\n");
}

function toTagsRaw(problem?: ProblemRecord) {
  if (!problem) return "";
  return problem.tags.join(",");
}

export function ProblemForm({ formAction, mode, initialProblem, initialSubject }: Props) {
  const isEdit = mode === "edit";
  const subjectValue = initialProblem?.subject ?? initialSubject ?? "probability-statistics";

  return (
    <form action={formAction} className="card form-grid">
      <h2>{isEdit ? "编辑题目（老师）" : "发布题目（老师）"}</h2>
      <p className="muted">{isEdit ? "修改后会立即覆盖原题内容并重新展示。" : "当前无登录，发布身份固定为老师。"}</p>

      {isEdit ? <input type="hidden" name="problemId" value={initialProblem?.id ?? ""} /> : null}
      <input type="hidden" name="role" value="teacher" />

      {!isEdit ? (
        <label>
          昵称
          <input name="alias" placeholder="例如: 王老师" defaultValue="王老师" required minLength={2} maxLength={24} />
        </label>
      ) : null}

      <label>
        标题
        <input name="title" defaultValue={initialProblem?.title ?? ""} required maxLength={120} />
      </label>

      <label>
        题干（支持 Markdown + LaTeX）
        <textarea
          name="stemMd"
          rows={6}
          defaultValue={initialProblem?.stemMd ?? ""}
          required
          placeholder={"例: 计算 $\\int_0^1 x^2dx$"}
        />
      </label>

      <label>
        选项（可选，按行填写）
        <textarea
          name="optionsRaw"
          rows={4}
          defaultValue={toOptionsRaw(initialProblem)}
          placeholder={"A. 1/3\nB. 1/2\nC. 1"}
        />
      </label>

      <label>
        答案（Markdown + LaTeX）
        <textarea name="answerMd" rows={4} defaultValue={initialProblem?.answerMd ?? ""} />
      </label>

      <label>
        解析（Markdown + LaTeX）
        <textarea name="analysisMd" rows={6} defaultValue={initialProblem?.analysisMd ?? ""} />
      </label>

      <div className="grid-2">
        <label>
          栏目
          <select name="subject" defaultValue={subjectValue}>
            <option value="probability-statistics">{SUBJECT_LABELS["probability-statistics"]}</option>
            <option value="microeconomics">{SUBJECT_LABELS.microeconomics}</option>
          </select>
        </label>
        <label>
          标签（英文逗号分隔）
          <input name="tagsRaw" defaultValue={toTagsRaw(initialProblem)} placeholder="函数,极限,微积分" />
        </label>
      </div>

      <label>
        难度
        <select name="difficulty" defaultValue={initialProblem?.difficulty ?? "medium"}>
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
      </label>

      <label>
        附件（图片或 PDF，可多选；编辑模式下会追加到原附件后）
        <input type="file" name="attachments" multiple accept="image/*,application/pdf" />
      </label>

      <SubmitButton text={isEdit ? "保存修改" : "发布题目"} />
    </form>
  );
}
