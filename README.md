# INF 怪物圖鑑（公開唯讀版）

這是一個完全獨立、無後端、無編輯功能的靜態圖鑑。頁面只讀取 `docs/data/monsters.json`，可以直接使用 GitHub Pages 的 `main` 分支 `/docs` 目錄發布。

本專案是依 [INF 2.34 規則書](https://inf-boop.github.io/INF/2.34/2.34.html) 重新整理的玩家改寫版、非官方鏡像。內容應以摘要與重新編寫為主；若有差異，以原規則書為準。

## 公開資料格式

`docs/data/monsters.json` 必須是一個 JSON 陣列。每個項目只能公開以下欄位：

```json
{
  "category": "不死生物",
  "tier": "D",
  "name": "範例名稱",
  "card": "完整的公開框卡文字",
  "image": "./images/example-300x60.png",
  "slug": "example",
  "sourceUrl": "https://inf-boop.github.io/INF/2.34/2.34.html"
}
```

- `category`：必須是下列 13 類之一。
- `tier`：必須是 `無`、`D`、`C`、`B`、`A`、`S`、`SS`、`SSS` 或 `待確認`。規則書未標級、或尚待人工校對的條目使用 `待確認`，不得自行降為 A 級。
- `name`、`card`、`slug`：不可空白；`slug` 使用小寫英數字與連字號。
- `image`：建議使用專案內相對路徑，並採 300 × 60 px 顯示比例。
- `sourceUrl`：該怪物資料的原始規則書頁面；未提供時會連到 INF 2.34 首頁。

公開頁面的程式只會取用上述七個欄位，額外欄位會被忽略。請勿把內部編號、模組來源、標籤、存檔狀態、備註、資料庫鍵或管理 API 資訊放入公開 JSON。

## 分類

1. 黑暗生物
2. 光明生物
3. 不死生物
4. 虛體
5. 靈體
6. 構裝體
7. 幻想魔法生物
8. 元素生物
9. 泥型生物
10. 植物生物
11. 集群生物
12. 人類
13. 一般生物

## 本機預覽

瀏覽器的 `file://` 模式通常不允許 `fetch` JSON，請在專案根目錄啟動任一靜態檔案伺服器，再打開 `/docs/`。例如：

```powershell
python -m http.server 8000
```

然後前往 `http://127.0.0.1:8000/docs/`。

## GitHub Pages 發布

1. 把此目錄提交到公開 GitHub repository 的 `main` 分支。
2. 在 repository 的 **Settings → Pages** 選擇 **Deploy from a branch**。
3. Branch 選 `main`，資料夾選 `/docs`，儲存設定。

專案不需要套件安裝、建置流程或伺服器端功能。`.nojekyll` 讓 GitHub Pages 原樣提供 `docs` 中的檔案。
