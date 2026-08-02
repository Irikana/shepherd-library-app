# 历史版本归档：把 v0.0.1/v0.0.2/v0.0.3 的 APK 从 Actions artifact 下载并发布为永久 GitHub Release
# 使用 git 凭据管理器中的凭据（不打印 token）
$ErrorActionPreference = 'Stop'
$git = "$env:LOCALAPPDATA\PortableGit\cmd\git.exe"
$owner = 'Irikana'
$repo = 'shepherd-library-app'
$api = "https://api.github.com/repos/$owner/$repo"

# 1. 获取凭据
$credOut = "protocol=https`nhost=github.com`n" | & $git credential fill 2>$null | Out-String
$token = (($credOut -split "`n" | ForEach-Object { $_.Trim() }) | Where-Object { $_ -like 'password=*' }) -replace '^password=', ''
if (-not $token) { Write-Error '无法从凭据管理器获取 GitHub 凭据'; exit 1 }
$me = Invoke-RestMethod -Uri 'https://api.github.com/user' -Headers @{ 'User-Agent' = 'reasonix'; 'Authorization' = "Bearer $token" }
Write-Output "认证用户: $($me.login)"

# 2. 版本 -> commit sha / artifact id 映射
$artifacts = (Invoke-RestMethod -Uri "$api/actions/artifacts?per_page=30" -Headers @{ 'User-Agent' = 'reasonix'; 'Authorization' = "Bearer $token" }).artifacts
$versions = @(
  @{ tag = 'v0.0.1'; commit = 'ee1bc01c860cd55ba2ce3f786098017b6292e6f9'; artifact = 'shepherd-library-app-v0.0.1-release'; body = '牧羊人图书馆写作管理 App 首个版本。' },
  @{ tag = 'v0.0.2'; commit = '273d37126442815092594eadda8056f7e4ac9c1c'; artifact = 'shepherd-library-app-v0.0.2-release'; body = '撰写文章功能增强：月历日期选择、录音时长小时钟、脚注、数学公式、网站样式预览。' },
  @{ tag = 'v0.0.3'; commit = '1af55b3c94bfab2f362fe4501bb373cbb639ba32'; artifact = 'shepherd-library-app-v0.0.3-release'; body = '双标题英文文件名、实验性文章、分类上传与 library.html 同步、草稿箱、主题设置、新闻发布、输入法插入修复。' }
)

$tmp = "$env:TEMP\slywrite-archive"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null

foreach ($v in $versions) {
  $art = $artifacts | Where-Object { $_.name -eq $v.artifact } | Select-Object -First 1
  if (-not $art) { Write-Output "跳过 $($v.tag)：artifact 不存在"; continue }

  # 下载 artifact zip
  $zip = Join-Path $tmp "$($v.tag).zip"
  & curl.exe -sL -H "Authorization: Bearer $token" -o $zip "$api/actions/artifacts/$($art.id)/zip"
  if (-not (Test-Path $zip)) { Write-Output "跳过 $($v.tag)：下载失败"; continue }

  # 解压 APK
  $dir = Join-Path $tmp $v.tag
  Expand-Archive $zip $dir -Force
  $apk = Get-ChildItem $dir -Recurse -Filter '*.apk' | Select-Object -First 1
  if (-not $apk) { Write-Output "跳过 $($v.tag)：zip 中无 APK"; continue }

  # 创建 Release
  $relBody = @{ tag_name = $v.tag; target_commitish = $v.commit; name = "SlyWrite $($v.tag)"; body = $v.body } | ConvertTo-Json -Compress
  $rel = Invoke-RestMethod -Method Post -Uri "$api/releases" -Headers @{ 'User-Agent' = 'reasonix'; 'Authorization' = "Bearer $token" } -ContentType 'application/json' -Body $relBody

  # 上传 APK asset
  $assetName = 'app-release.apk'
  & curl.exe -sL -X POST -H "Authorization: Bearer $token" -H "Content-Type: application/vnd.android.package-archive" --data-binary "@$($apk.FullName)" "$api/releases/$($rel.id)/assets?name=$assetName" | Out-Null
  Write-Output "已归档 $($v.tag) -> $($rel.html_url) ($([Math]::Round($apk.Length/1MB,1)) MB)"
}

Remove-Item -Recurse -Force $tmp
Write-Output 'ARCHIVE_DONE'
