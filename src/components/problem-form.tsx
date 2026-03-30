import { createProblemAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export function ProblemForm() {
  return (
    <form action={createProblemAction} className="card form-grid">
      <h2>发布数学题目（Demo）</h2>
      <p className="muted">当前无登录，请手动选择身份并填写昵称。</p>

      <div className="grid-2">
        <label>
          身份
          <select name="role" defaultValue="teacher" required>
            <option value="teacher">老师</option>
            <option value="student">学生</option>
          </select>
        </label>
        <label>
          昵称
          <input name="alias" placeholder="例如: 王老师" required minLength={2} maxLength={24} />
        </label>
      </div>

      <label>
        标题
        <input name="title" required maxLength={120} />
      </label>

      <label>
        题干（支持 Markdown + LaTeX）
        <textarea name="stemMd" rows={6} required placeholder={"例: 计算 $\\int_0^1 x^2dx$"} />
      </label>

      <label>
        选项（可选，按行填写）
        <textarea name="optionsRaw" rows={4} placeholder={"A. 1/3\nB. 1/2\nC. 1"} />
      </label>

      <label>
        答案（Markdown + LaTeX）
        <textarea name="answerMd" rows={4} />
      </label>

      <label>
        解析（Markdown + LaTeX）
        <textarea name="analysisMd" rows={6} />
      </label>

      <div className="grid-2">
        <label>
          标签（英文逗号分隔）
          <input name="tagsRaw" placeholder="函数,极限,微积分" />
        </label>
        <label>
          难度
          <select name="difficulty" defaultValue="medium">
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </label>
      </div>

      <label>
        附件（图片或 PDF，可多选）
        <input type="file" name="attachments" multiple accept="image/*,application/pdf" />
      </label>

      <SubmitButton text="发布题目" />
    </form>
  );
}
