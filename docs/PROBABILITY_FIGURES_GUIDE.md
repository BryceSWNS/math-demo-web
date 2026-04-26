# 概率论与数理统计 · 含图题目处理指南（Cursor Agent）

> 本文档仅针对**题干或解析中包含几何图形、坐标系、示意图**的题目。
> 纯文字 + 公式的题目请直接按 `PROBABILITY_EXAMPLES_UPLOAD_GUIDE.md` 执行。

## 1. 整体流程

```
识图 → 生成 SVG 文件 → 生成含占位符的 SQL → 运行上传脚本替换占位符 → 交付最终 SQL
```

你必须按顺序完成以下步骤，不得中断要求用户手动操作：

1. 将 SVG 内容写入 `figures/章_节_题.svg`
2. 将含 `{{FIG:...}}` 占位符的 SQL 写入迁移文件
3. 执行 `./scripts/upload-figures.sh <sql文件> ./figures` 完成上传与替换
4. 确认脚本输出中所有占位符均已替换成功（含 `✓`）
5. 若有失败项，排查原因并重试

## 2. SVG 文件规范

### 命名

- 格式：`章_节_题.svg`，如 `1_2_8.svg`
- 存放目录：项目根目录下 `figures/`

### 绘图要求

- 宽度 300–400px，高度按比例
- 坐标轴：带箭头、有刻度标注、轴标签（$x$、$y$ 等用 `<text>` 元素）
- 阴影/填充区域：用 `fill="#d1d5db"` 或 `fill="#e5e7eb"`（浅灰），`fill-opacity="0.6"`
- 文字标注（区域名、点坐标等）：`font-family="serif"`，`font-size="14"`
- 不使用外部字体或图片引用，保持纯 SVG 独立可渲染
- **编码安全**：SVG 是 XML，非 ASCII 字符（中文、希腊字母等）必须使用 XML 实体（如 `&#937;` 表示 Ω）或确保文件为合法 UTF-8；**禁止在 SVG 中写中文注释**，注释一律用英文或直接省略

### 示例：例 1.2.8 会面问题的坐标图

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">
  <!-- 坐标轴 -->
  <line x1="40" y1="280" x2="300" y2="280" stroke="black" stroke-width="1.5"/>
  <line x1="40" y1="280" x2="40" y2="20" stroke="black" stroke-width="1.5"/>
  <!-- 箭头 -->
  <polygon points="300,280 294,276 294,284" fill="black"/>
  <polygon points="40,20 36,26 44,26" fill="black"/>
  <!-- 正方形区域 Ω -->
  <rect x="40" y="40" width="240" height="240" fill="none" stroke="black" stroke-dasharray="4"/>
  <!-- 阴影区域 A: |x-y|≤20 -->
  <polygon points="40,40 40,120 200,280 280,280 280,200 120,40"
           fill="#d1d5db" fill-opacity="0.6" stroke="none"/>
  <!-- 刻度与标注 -->
  <text x="295" y="298" font-size="14" font-family="serif">x</text>
  <text x="20" y="20" font-size="14" font-family="serif">y</text>
  <text x="36" y="298" font-size="12" font-family="serif">O</text>
  <text x="115" y="298" font-size="12" font-family="serif">20</text>
  <text x="275" y="298" font-size="12" font-family="serif">60</text>
  <text x="20" y="126" font-size="12" font-family="serif">20</text>
  <text x="20" y="46" font-size="12" font-family="serif">60</text>
  <text x="240" y="76" font-size="14" font-family="serif" font-style="italic">Ω</text>
  <text x="150" y="200" font-size="14" font-family="serif" font-style="italic">A</text>
</svg>
```

## 3. SQL 中的占位符写法

在 `stem_md` 或 `analysis_md` 中需要插入图片的位置，使用：

```
![图片描述]({{FIG:文件名.svg}})
```

**示例**（`analysis_md` 片段）：

```sql
'以 $x$ 和 $y$ 分别表示甲、乙两人到达约会地点的时间（以 min 为单位），在平面上建立 $xOy$ 直角坐标系（见图 1.2.4）。

![图 1.2.4 会面问题中的 Ω 与 A]({{FIG:1_2_8.svg}})

因为甲、乙都是在 0 至 60 min 内等可能地到达……'
```

**示例**（图在 `stem_md` 中，题干本身包含图）：

```sql
'某零件的截面如图所示，求阴影部分的面积。

![截面示意图]({{FIG:2_3_1.svg}})'
```

## 4. 上传脚本

你在写完 SVG 文件和 SQL 文件后，**必须自行执行**：

```bash
./scripts/upload-figures.sh <sql文件路径> ./figures
```

脚本自动完成：
1. 从 `.env.local` 读取 Supabase 凭证
2. 扫描 SQL 中所有 `{{FIG:...}}` 占位符
3. 上传对应 SVG 到 Supabase Storage（`problem-assets/figures/`）
4. 原地替换占位符为 public URL
5. 备份原始 SQL（`.bak`）

你需检查脚本输出，确认每个文件均显示 `✓ 成功`。若出现失败，应排查并重试。

## 5. 其他字段

含图题目除图片处理外，所有字段规则与 `PROBABILITY_EXAMPLES_UPLOAD_GUIDE.md` 完全一致（题号、字段映射、LaTeX 规则等），此处不重复。
