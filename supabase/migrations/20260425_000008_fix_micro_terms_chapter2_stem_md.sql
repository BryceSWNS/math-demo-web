-- 修正已入库的第二章微观名词解释 stem_md（2.1 - 2.6）
-- 适用场景：20260425_000007 已执行，且其中 stem_md 与 title 重复。

update public.problems p
set stem_md = v.stem_md
from (
  values
    ('2.1', '表示消费者在相同效用水平下的商品组合轨迹。'),
    ('2.2', '满足“越多越好”和“偏好多样化”的消费者偏好。'),
    ('2.3', '同一商品消费越多，新增一单位带来的满足增量越小。'),
    ('2.4', '价格变化会同时通过相对价格与实际购买力影响需求。'),
    ('2.5', '为保持同等效用，新增某商品时愿放弃的另一商品数量会递减。'),
    ('2.6', '消费者愿付最高金额与实际支付金额之间的差额。')
) as v(question_no, stem_md)
where p.subject = 'microeconomics-terms'
  and p.question_no = v.question_no;
