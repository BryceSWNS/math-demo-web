-- 概率论与数理统计：例题 1.2.2 批量导入
-- 幂等处理：若同 subject + question_no 已存在，则跳过。

insert into public.problems (
  question_no,
  subject,
  chapter_section,
  title,
  stem_md,
  options_json,
  answer_md,
  analysis_md,
  tags,
  difficulty,
  created_by_alias
)
select
  v.question_no,
  'probability-statistics',
  'examples',
  v.title,
  v.stem_md,
  '[]'::jsonb,
  v.answer_md,
  v.analysis_md,
  array['一级题目']::text[],
  'easy',
  'ai-batch'
from (
  values
    (
      '例 1.2.2',
      '掷两枚硬币，求出现一个正面一个反面的概率',
      '掷两枚硬币，求出现一个正面一个反面的概率。',
      '$P = 1/2$',
      '此例的样本空间为 $\Omega = \{(\text{正}, \text{正}), (\text{正}, \text{反}), (\text{反}, \text{正}), (\text{反}, \text{反})\}$。所以 $\Omega$ 中含有样本点的个数为 4，事件"出现一个正面一个反面"含有的样本点的个数为 2，因此所求概率为 $P = \dfrac{2}{4} = \dfrac{1}{2}$。'
    )
) as v(question_no, title, stem_md, answer_md, analysis_md)
where not exists (
  select 1
  from public.problems p
  where p.subject = 'probability-statistics'
    and p.question_no = v.question_no
);
