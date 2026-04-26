-- 概率论与数理统计：例题 1.2.5 导入
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
  '例 1.2.5',
  'probability-statistics',
  'examples',
  '彩票问题',
  '例 1.2.5（彩票问题）一种福利彩票称为幸运 35 选 7，即购买时从 01, 02, …, 35 中任选 7 个号码，开奖时从 01, 02, …, 35 中不重复地选出 7 个基本号码和 1 个特殊号码。中各等奖的规则如下：

| 中奖级别 | 中奖规则 |
|:---:|:---:|
| 一等奖 | 7 个基本号码全中 |
| 二等奖 | 中 6 个基本号码及特殊号码 |
| 三等奖 | 中 6 个基本号码 |
| 四等奖 | 中 5 个基本号码及特殊号码 |
| 五等奖 | 中 5 个基本号码 |
| 六等奖 | 中 4 个基本号码及特殊号码 |
| 七等奖 | 中 4 个基本号码，或中 3 个基本号码及特殊号码 |

试求各等奖的中奖概率。',
  '[]'::jsonb,
  '',
  '因为不重复地选号码是一种不放回抽样，所以样本空间 $\Omega$ 含有 $\binom{35}{7}$ 个样本点。要中奖应把抽取看成是在三种类型中抽取：

第一类号码：7 个基本号码。

第二类号码：1 个特殊号码。

第三类号码：27 个其他号码。

注意到例 1.2.3 中是在两类元素（合格品和不合格品）中抽取，如今在三类号码中抽取，若记 $p_i$ 为中第 $i$ 等奖的概率（$i = 1, 2, \cdots, 7$），仿照例 1.2.3 的方法，可得各等奖的中奖概率如下：

$$
p_1 = \frac{\binom{7}{7}\binom{1}{0}\binom{27}{0}}{\binom{35}{7}} = \frac{1}{6\,724\,520} = 0.149 \times 10^{-6},
$$

$$
p_2 = \frac{\binom{7}{6}\binom{1}{1}\binom{27}{0}}{\binom{35}{7}} = \frac{7}{6\,724\,520} = 1.04 \times 10^{-6},
$$

$$
p_3 = \frac{\binom{7}{6}\binom{1}{0}\binom{27}{1}}{\binom{35}{7}} = \frac{189}{6\,724\,520} = 28.106 \times 10^{-6},
$$

$$
p_4 = \frac{\binom{7}{5}\binom{1}{1}\binom{27}{1}}{\binom{35}{7}} = \frac{567}{6\,724\,520} = 84.318 \times 10^{-6},
$$

$$
p_5 = \frac{\binom{7}{5}\binom{1}{0}\binom{27}{2}}{\binom{35}{7}} = \frac{7\,371}{6\,724\,520} = 1.096 \times 10^{-3},
$$

$$
p_6 = \frac{\binom{7}{4}\binom{1}{1}\binom{27}{2}}{\binom{35}{7}} = \frac{12\,285}{6\,724\,520} = 1.827 \times 10^{-3},
$$

$$
p_7 = \frac{\binom{7}{4}\binom{1}{0}\binom{27}{3} + \binom{7}{3}\binom{1}{1}\binom{27}{3}}{\binom{35}{7}} = \frac{204\,750}{6\,724\,520} = 30.448 \times 10^{-3}.
$$

若记 $A$ 为事件"中奖"，则 $\bar{A}$ 为事件"不中奖"，且由 $P(A) + P(\bar{A}) = P(\Omega) = 1$ 可得

$$
P(\text{中奖}) = P(A) = p_1 + p_2 + p_3 + p_4 + p_5 + p_6 + p_7 = \frac{225\,170}{6\,724\,520} = 0.033\,485,
$$

$$
P(\text{不中奖}) = P(\bar{A}) = 1 - P(A) = 0.966\,515.
$$

这就说明：一百个人中约有 3 人中奖，而中头奖的概率只有 $0.149 \times 10^{-6}$，即两千万个人中约有 3 人中头奖。因此购买彩票要有平常心，期望值不宜过高。',
  array['一级题目']::text[],
  'medium',
  'ai-batch'
where not exists (
  select 1
  from public.problems p
  where p.subject = 'probability-statistics'
    and p.question_no = '例 1.2.5'
);
