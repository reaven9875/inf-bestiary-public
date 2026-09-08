# GitHub 同步狀態

目前99張公開敵卡與私人站可見資料已核對一致；規則書圖鑑大分類透過 docs/data/collections.json 同步，成員使用公開slug，不公開私人資料庫recordId。原始卡、綠色括號與圖片沒有修改。

這是代理執行的一次性同步，不是網站自動寫回GitHub。私人站production runtime沒有任何環境變數，也沒有獨立GitHub寫入憑證。Codex的GitHub連線及本機git權限不會自動轉交網站，更不能把使用者本機憑證複製到公開程式。

尚未完成：自訂製作者大分類與小分類CRUD、新敵卡分類選擇、公開版編輯器、作者身份與刪除權限、網站自行提交至GitHub。未授予訪客任意寫入本儲存庫的權限。

下一步需網站專用GitHub授權。建議GitHub App僅安裝於 reaven9875/inf-bestiary-public，Contents read/write；私鑰僅置伺服器秘密。公開版作者身份與提交/審核流程仍須設定，不能以可自行輸入的製作者名稱充當刪除授權。不要把token或私鑰貼在聊天、存到public、localStorage或提交進Git。

檢核：語法、99成員唯一且全覆蓋、既有monster JSON未改、分組讀取與展開/收合程式靜態檢查。未執行瀏覽器點擊、viewport或讀屏QA。GitHub Pages更新後另讀回公開檔案比對。
