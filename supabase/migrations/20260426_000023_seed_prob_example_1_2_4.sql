-- 概率论与数理统计：例题 1.2.4 导入
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
  '例 1.2.4',
  'probability-statistics',
  'examples',
  '放回抽样',
  '例 1.2.4（放回抽样）抽样有两种方式：不放回抽样与放回抽样。上例讨论的是不放回抽样。放回抽样是抽取一件后放回，然后再抽取下一件……如此重复直至抽出 $n$ 件为止。现对例 1.2.3 在有放回抽样情况下，讨论事件 $B_m$ = "取出的 $n$ 件产品中有 $m$ 件不合格品"的概率。',
  '[]'::jsonb,
  '',
  '同样我们先计算样本空间 $\Omega$ 中样本点的总数：第一次抽取时，可从 $N$ 件中任取一件，有 $N$ 种取法。因为是放回抽样，所以第二次抽取时，仍有 $N$ 种取法……如此下去，每一次都有 $N$ 种取法，一共抽取了 $n$ 次，所以共有 $N^n$ 个等可能的样本点。

事件 $B_m$ = "取出的 $n$ 件产品中恰有 $m$ 件不合格品"发生必须从 $N-M$ 件合格品中有放回地抽取 $n-m$ 次，从 $M$ 件不合格品中有放回地抽取 $m$ 次，这样就有 $M^m \cdot (N-M)^{n-m}$ 种取法。再考虑到这 $m$ 件不合格品可能在 $n$ 次中的任何 $m$ 次抽取中得到，总共有 $\binom{n}{m}$ 种可能。所以事件 $B_m$ 含有 $\binom{n}{m} M^m (N-M)^{n-m}$ 个样本点，故 $B_m$ 的概率为

$$
P(B_m) = \frac{\binom{n}{m} M^m (N-M)^{n-m}}{N^n} = \binom{n}{m} \left(\frac{M}{N}\right)^m \left(1 - \frac{M}{N}\right)^{n-m}, \quad m = 0, 1, 2, \cdots, n. \tag{1.2.7}
$$

由于是放回抽样，不合格品在整批产品中所占比例 $M/N$ 是不变的，记此比例为 $p$，则上式可改写为

$$
P(B_m) = \binom{n}{m} p^m (1-p)^{n-m}, \quad m = 0, 1, 2, \cdots, n.
$$

同样取 $N=9$，$M=3$，$n=4$，则有 $m \le 4$，

$$
P(B_0) = \left(1 - \frac{3}{9}\right)^4 = \left(\frac{2}{3}\right)^4 = \frac{16}{81},
$$

$$
P(B_1) = 4 \cdot \frac{1}{3} \left(\frac{2}{3}\right)^3 = \frac{32}{81},
$$

$$
P(B_2) = 6 \left(\frac{1}{3}\right)^2 \left(\frac{2}{3}\right)^2 = \frac{24}{81},
$$

$$
P(B_3) = 4 \left(\frac{1}{3}\right)^3 \left(\frac{2}{3}\right)^1 = \frac{8}{81},
$$

$$
P(B_4) = \left(\frac{1}{3}\right)^4 = \frac{1}{81}.
$$',
  array['一级题目']::text[],
  'medium',
  'ai-batch'
where not exists (
  select 1
  from public.problems p
  where p.subject = 'probability-statistics'
    and p.question_no = '例 1.2.4'
);
