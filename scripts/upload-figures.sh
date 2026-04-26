#!/usr/bin/env bash
#
# 一体化脚本：扫描 figures/ 目录中的 SVG，上传到 Supabase Storage，
# 然后把 SQL 文件里的 {{FIG:文件名}} 占位符替换为真实的 public URL。
#
# 用法：
#   ./scripts/upload-figures.sh <sql_file> [figures_dir]
#
# 示例：
#   ./scripts/upload-figures.sh migrations/seed_1_2_8.sql ./figures
#
# 占位符格式（写在 SQL 的 stem_md / analysis_md 中）：
#   ![图 1.2.4]({{FIG:1_2_8.svg}})
#
# 脚本会把 {{FIG:1_2_8.svg}} 替换为上传后的完整 public URL。

set -euo pipefail

# ─── 参数 ───────────────────────────────────────────────
SQL_FILE="${1:?用法: $0 <sql_file> [figures_dir]}"
FIG_DIR="${2:-./figures}"

# ─── 环境变量（从 .env.local 自动加载） ─────────────────
ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env.local"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:?请设置 NEXT_PUBLIC_SUPABASE_URL}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY:?请设置 SUPABASE_SERVICE_ROLE_KEY}"
BUCKET="problem-assets"
STORAGE_PREFIX="figures"

# ─── 检查依赖 ──────────────────────────────────────────
for cmd in curl sed; do
  command -v "$cmd" >/dev/null || { echo "缺少命令: $cmd"; exit 1; }
done

[[ -f "$SQL_FILE" ]] || { echo "SQL 文件不存在: $SQL_FILE"; exit 1; }
[[ -d "$FIG_DIR" ]] || { echo "图片目录不存在: $FIG_DIR"; exit 1; }

# ─── 收集 SQL 中的占位符 ────────────────────────────────
PLACEHOLDERS=$(grep -oP '\{\{FIG:[^}]+\}\}' "$SQL_FILE" | sort -u || true)

if [[ -z "$PLACEHOLDERS" ]]; then
  echo "SQL 中没有 {{FIG:...}} 占位符，无需处理。"
  exit 0
fi

echo "=== 发现占位符 ==="
echo "$PLACEHOLDERS"
echo ""

# ─── 逐个上传并替换 ────────────────────────────────────
cp "$SQL_FILE" "${SQL_FILE}.bak"
echo "已备份原始 SQL → ${SQL_FILE}.bak"
echo ""

for ph in $PLACEHOLDERS; do
  FILENAME=$(echo "$ph" | sed 's/{{FIG:\(.*\)}}/\1/')
  FILEPATH="${FIG_DIR}/${FILENAME}"

  if [[ ! -f "$FILEPATH" ]]; then
    echo "⚠ 文件不存在，跳过: $FILEPATH"
    continue
  fi

  CONTENT_TYPE="image/svg+xml"
  case "$FILENAME" in
    *.png) CONTENT_TYPE="image/png" ;;
    *.jpg|*.jpeg) CONTENT_TYPE="image/jpeg" ;;
  esac

  OBJECT_PATH="${STORAGE_PREFIX}/${FILENAME}"
  UPLOAD_URL="${SUPABASE_URL}/storage/v1/object/${BUCKET}/${OBJECT_PATH}"

  echo "上传 ${FILENAME} → ${OBJECT_PATH} ..."

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$UPLOAD_URL" \
    -H "apikey: ${SERVICE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "Content-Type: ${CONTENT_TYPE}" \
    -H "x-upsert: true" \
    --data-binary "@${FILEPATH}")

  if [[ "$HTTP_CODE" -ge 200 && "$HTTP_CODE" -lt 300 ]]; then
    PUBLIC_URL="${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${OBJECT_PATH}"
    echo "  ✓ 成功 (${HTTP_CODE})  →  ${PUBLIC_URL}"
    sed -i "s|{{FIG:${FILENAME}}}|${PUBLIC_URL}|g" "$SQL_FILE"
  else
    echo "  ✗ 上传失败 (HTTP ${HTTP_CODE})，占位符保留"
  fi
done

echo ""
echo "=== 完成 ==="
echo "处理后的 SQL: $SQL_FILE"
echo "原始备份:     ${SQL_FILE}.bak"
