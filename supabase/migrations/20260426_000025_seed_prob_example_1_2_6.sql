-- 概率论与数理统计：例题 1.2.6 导入
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
  '例 1.2.6',
  'probability-statistics',
  'examples',
  '盒子模型',
  '例 1.2.6（盒子模型）设有 $n$ 个球，每个球都等可能地被放到 $N$ 个不同盒子中的任一个，每个盒子所放球数不限。试求

（1）指定的 $n$（$n \le N$）个盒子中各有一球的概率 $p_1$；

（2）恰好有 $n$（$n \le N$）个盒子各有一球的概率 $p_2$。',
  '[]'::jsonb,
  '',
  '因为每个球都可放到 $N$ 个盒子中的任一个，所以 $n$ 个球放的方式共有 $N^n$ 种，它们是等可能的。

（1）因为各有一球的 $n$ 个盒子已经指定，余下的没有球的 $N-n$ 个盒子也同时被指定，所以只要考虑 $n$ 个球在这指定的 $n$ 个盒子中各放 1 个的放法数。设想第 1 个球有 $n$ 种放法，第 2 个球只有 $n-1$ 种放法，……，第 $n$ 个球只有 1 种放法，所以根据排列乘法原理，其可能总数为 $n!$，于是其概率为

$$
p_1 = \frac{n!}{N^n}. \tag{1.2.8}
$$

（2）与（1）的差别在于：此处 $n$ 个盒子可以在 $N$ 个盒子中任意选取。此时可分两步做：第一步从 $N$ 个盒子中任取 $n$ 个盒子准备放球，共有 $\binom{N}{n}$ 种取法；第二步将 $n$ 个球放入选中的 $n$ 个盒子中，每个盒子各放 1 球，共有 $n!$ 种放法。所以根据乘法原理共有

$$
\binom{N}{n} \cdot n! = \mathrm{P}_N^n = N(N-1)(N-2)\cdots(N-n+1)
$$

种放法。其实这个放法数可以更直接地考虑成：第 1 个球可放在 $N$ 个盒子中的任一个，第 2 个球只可放在余下的 $N-1$ 个盒子中的任一个，……，第 $n$ 个球只可放在余下的 $N-n+1$ 个盒子中的任一个，由乘法原理即可得以上放法数。因此所求概率为

$$
p_2 = \frac{\mathrm{P}_N^n}{N^n} = \frac{N!}{N^n (N-n)!}. \tag{1.2.9}
$$',
  array['一级题目']::text[],
  'medium',
  'ai-batch'
where not exists (
  select 1
  from public.problems p
  where p.subject = 'probability-statistics'
    and p.question_no = '例 1.2.6'
);
