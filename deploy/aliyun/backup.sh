#!/bin/bash
# 数据库备份脚本
# 建议添加到 crontab 定时执行：0 2 * * * /opt/qoder-team/backup.sh

set -e

BACKUP_DIR="/opt/backups/qoder-team"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

mkdir -p $BACKUP_DIR

# 备份 PostgreSQL
echo "备份数据库..."
docker exec qoder-postgres pg_dump -U qoder qoder_team | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# 清理旧备份
echo "清理 $RETENTION_DAYS 天前的备份..."
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "备份完成: $BACKUP_DIR/db_$DATE.sql.gz"
