-- 概率论与数理统计：例题 1.2.7 导入
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
  '例 1.2.7',
  'probability-statistics',
  'examples',
  '生日问题',
  '例 1.2.7（生日问题）$n$ 个人的生日全不相同的概率 $p_n$ 是多少？',
  '[]'::jsonb,
  '',
  '把 $n$ 个人看成是 $n$ 个球，将一年 365 天看成是 $N = 365$ 个盒子，则"$n$ 个人的生日全不相同"就相当于"恰好有 $n$（$n \le N$）个盒子各有一球"，所以 $n$ 个人的生日全不相同的概率为

$$
p_n = \frac{365!}{365^n (365-n)!} = \left(1 - \frac{1}{365}\right)\left(1 - \frac{2}{365}\right)\cdots\left(1 - \frac{n-1}{365}\right). \tag{1.2.10}
$$

上式看似简单，但其具体计算是烦琐的，对此可用以下方法作近似计算：

（1）当 $n$ 较小时，(1.2.10) 式右边中各因子的第二项之间的乘积 $\frac{i}{365} \times \frac{j}{365}$ 都可以忽略，于是有近似公式

$$
p_n \approx 1 - \frac{1+2+\cdots+(n-1)}{365} = 1 - \frac{n(n-1)}{730}. \tag{1.2.11}
$$

（2）当 $n$ 较大时，因为对较小的正数 $x$，有 $\ln(1-x) \approx -x$，所以由 (1.2.10) 式得

$$
\ln p_n \approx -\frac{1+2+\cdots+(n-1)}{365} = -\frac{n(n-1)}{730}. \tag{1.2.12}
$$

例如当 $n = 10$ 时，由 (1.2.12) 式给出 $p_n$ 的近似值为 0.884 0，而精确值为 $p_n$ = 0.883 1…；当 $n = 30$ 时，$p_n$ 的近似值为 0.303 7，精确值为 $p_n$ = 0.293 7。',
  array['一级题目']::text[],
  'medium',
  'ai-batch'
where not exists (
  select 1
  from public.problems p
  where p.subject = 'probability-statistics'
    and p.question_no = '例 1.2.7'
);
