# 代理工具

`offwork_clock` 供 Harness 代理读取或更新作息与薪资。默认关闭；请在「设置 → 高级设置」中显式开启“允许代理工具读写作息与薪资”。

读取：

```json
{ "action": "get" }
```

更新时只传需要修改的字段，其他字段保留：

```json
{
  "action": "set",
  "settings": {
    "payMode": "monthly",
    "monthlySalary": 10000,
    "workdaysPerMonth": 21.75,
    "start": "09:00",
    "end": "18:00",
    "breakStart": "12:00",
    "breakEnd": "13:00",
    "weekdays": [1, 2, 3, 4, 5],
    "timezone": "Asia/Shanghai"
  }
}
```

`weekdays` 使用 `0`–`6` 表示周日到周六；日薪模式使用 `"payMode": "daily"` 和 `dailySalary`。`breakStart` 与 `breakEnd` 相同可关闭休息扣除。

成功返回 `{ "ok": true, "settings": { ... }, "configured": true }`；未保存过配置时 `configured` 为 `false`。失败返回 `{ "ok": false, "error": "..." }`。

界面配置不进入会话记录。代理工具的调用及结果可能进入会话记录，因此默认不开放。
