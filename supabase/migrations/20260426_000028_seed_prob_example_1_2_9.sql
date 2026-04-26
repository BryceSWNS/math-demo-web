-- 概率论与数理统计：例题 1.2.9 导入
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
  '例 1.2.9',
  'probability-statistics',
  'examples',
  '比丰投针问题',
  '例 1.2.9（比丰投针问题（见[1]））平面上画有间隔为 $d$（$d>0$）的等距平行线，向平面任意投掷一枚长为 $l$（$l<d$）的针，求针与任一平行线相交的概率。',
  '[]'::jsonb,
  '',
  '以 $x$ 表示针的中点与最近一条平行线的距离，又以 $\varphi$ 表示针与此直线间的夹角，见图 1.2.5。易知样本空间 $\varOmega$ 满足

$$
0 \le x \le d/2, \quad 0 \le \varphi \le \pi,
$$

由这两式可以确定 $\varphi Ox$ 平面上的一个矩形 $\varOmega$，这就是样本空间，其面积为 $S_\varOmega = d\pi/2$。这时针与平行线相交（记为事件 $A$）的充要条件是

$$
x \le \frac{l}{2} \sin \varphi.
$$

由这个不等式表示的区域是图 1.2.6 中的阴影部分。

![图 1.2.5 比丰投针问题](https://bcvhvrrgbkwioqjqglkf.supabase.co/storage/v1/object/public/problem-assets/figures/1_2_9a.svg)

![图 1.2.6 比丰投针问题中的 Ω 与 A](https://bcvhvrrgbkwioqjqglkf.supabase.co/storage/v1/object/public/problem-assets/figures/1_2_9b.svg)

由于针是向平面任意投掷的，所以由等可能性知这是一个几何概率问题。由此得

$$
P(A) = \frac{S_A}{S_\varOmega} = \frac{\displaystyle\int_0^{\pi} \frac{l}{2} \sin \varphi \, \mathrm{d}\varphi}{\displaystyle\frac{d}{2}\pi} = \frac{2l}{d\pi}.
$$

如果 $l$，$d$ 已知，则以 $\pi$ 的值代入上式即可计算得 $P(A)$ 之值。反之，如果已知 $P(A)$ 的值，则也可利用上式求出 $\pi$，而关于 $P(A)$ 的值，可用从试验中获得的频率去近似它：即投针 $N$ 次，其中针与平行线相交 $n$ 次，则频率 $n/N$ 可作为 $P(A)$ 的估计值，于是由

$$
\frac{n}{N} \approx P(A) = \frac{2l}{d\pi},
$$

可得

$$
\pi \approx \frac{2lN}{dn}.
$$

历史上有一些学者曾亲自做过这个试验，下表记录了他们的试验结果。

| 试验者 | 年份 | $l/d$ | 投掷次数 | 相交次数 | $\pi$ 的近似值 |
|---|---|---|---|---|---|
| 沃尔夫（Wolf） | 1850 | 0.8 | 5 000 | 2 532 | 3.159 6 |
| 福克斯（Fox） | 1884 | 0.75 | 1 030 | 489 | 3.159 5 |
| 拉泽里尼（Lazzerini） | 1901 | 0.83 | 3 408 | 1 808 | 3.141 592 9 |
| 雷娜（Reina） | 1925 | 0.541 9 | 2 520 | 859 | 3.179 5 |',
  array['一级题目']::text[],
  'hard',
  'ai-batch'
where not exists (
  select 1
  from public.problems p
  where p.subject = 'probability-statistics'
    and p.question_no = '例 1.2.9'
);
