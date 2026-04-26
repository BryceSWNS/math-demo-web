-- 概率论与数理统计：例题 1.2.8 导入
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
  '例 1.2.8',
  'probability-statistics',
  'examples',
  '会面问题',
  '例 1.2.8（会面问题）甲、乙两人约定在下午 6 时到 7 时在某处会面，并约定先到者应等候另一个人 20 min，过时即可离去。求两人能会面的概率。',
  '[]'::jsonb,
  '',
  '以 $x$ 和 $y$ 分别表示甲、乙两人到达约会地点的时间（以 min 为单位），在平面上建立 $xOy$ 直角坐标系（见图 1.2.4）。

![图 1.2.4 会面问题中的 Ω 与 A](https://bcvhvrrgbkwioqjqglkf.supabase.co/storage/v1/object/public/problem-assets/figures/1_2_8.svg)

因为甲、乙都是在 0 至 60 min 内等可能地到达，所以由等可能性知这是一个几何概率问题。$(x, y)$ 的所有可能取值在边长为 60 的正方形区域内，其面积为 $S_\varOmega = 60^2$。而事件 $A$ = "两人能够会面"相当于

$$
|x - y| \le 20,
$$

即图中的阴影部分，其面积为 $S_A = 60^2 - 40^2$，由 (1.2.13) 式知

$$
P(A) = \frac{S_A}{S_\varOmega} = \frac{60^2 - 40^2}{60^2} = \frac{5}{9} = 0.555\ 6.
$$

结果表明：按此规则约会，两人能会面的概率不超过 0.6。若把约定时间改为下午 6 时到 6 时 30 分，其他不变，则两人能会面的概率提高到 0.888 9。',
  array['一级题目']::text[],
  'easy',
  'ai-batch'
where not exists (
  select 1
  from public.problems p
  where p.subject = 'probability-statistics'
    and p.question_no = '例 1.2.8'
);
