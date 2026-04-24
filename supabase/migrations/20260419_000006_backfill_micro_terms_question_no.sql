-- 回填微观名词解释题号：
-- 规则：创建时间越早，题号越小；统一回填为 1.x
-- 仅处理 question_no 为空的记录，避免覆盖已人工设置的题号。

with ranked as (
  select
    id,
    row_number() over (order by created_at asc, id asc) as seq
  from public.problems
  where subject = 'microeconomics-terms'
    and coalesce(question_no, '') = ''
)
update public.problems p
set question_no = '1.' || ranked.seq::text
from ranked
where p.id = ranked.id;
