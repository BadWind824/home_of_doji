"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Moon,
  Sun,
  Heart,
  Search,
  X,
  Github,
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import { Toaster } from "@/components/ui/toaster"

interface GitHubFile {
  name: string
  download_url: string
  size: number
}

interface GitHubTreeItem {
  path: string
  mode: string
  type: string
  sha: string
  size?: number
  url: string
}

interface GitHubTree {
  sha: string
  url: string
  tree: GitHubTreeItem[]
  truncated: boolean
}

interface GifItem {
  name: string
  url: string
  cdnUrl: string
  size: number
  type: string
}

export default function GifGallery() {
  const [gifs, setGifs] = useState<GifItem[]>([])
  const [filteredGifs, setFilteredGifs] = useState<GifItem[]>([])
  const [loading, setLoading] = useState(true)
  const [pageLoading, setPageLoading] = useState(false)
  const [selectedGif, setSelectedGif] = useState<GifItem | null>(null)
  const [selectedGifIndex, setSelectedGifIndex] = useState<number>(-1)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [copySuccess, setCopySuccess] = useState<{ [key: string]: boolean }>({})
  const [downloadingGifs, setDownloadingGifs] = useState<Set<string>>(new Set())

  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(32) // 默认4列×8行
  const [columnsCount, setColumnsCount] = useState(4)

  // 处理客户端水合问题
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetchGifs()
  }, [])

  // 搜索过滤效果
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredGifs(gifs)
    } else {
      const term = searchTerm.toLowerCase().trim()
      const filtered = gifs.filter((gif) => gif.name.toLowerCase().includes(term))
      setFilteredGifs(filtered)
    }
    setCurrentPage(1) // 重置到第一页
  }, [searchTerm, gifs])

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth
      let columns = 4 // 默认列数

      if (width < 640)
        columns = 2 // sm
      else if (width < 768)
        columns = 3 // md
      else if (width < 1024)
        columns = 4 // lg
      else if (width < 1280)
        columns = 5 // xl
      else if (width < 1536)
        columns = 6 // 2xl
      else columns = Math.floor(width / 200) // 超大屏幕动态计算

      setColumnsCount(columns)
      setItemsPerPage(columns * 8) // 8行
    }

    updateLayout()
    window.addEventListener("resize", updateLayout)
    return () => window.removeEventListener("resize", updateLayout)
  }, [])

  const fetchGifs = async () => {
    try {
      setLoading(true)
      setError(null)

      // 首先获取仓库的默认分支信息
      const repoResponse = await fetch("https://api.github.com/repos/1143520/doro")
      if (!repoResponse.ok) {
        throw new Error("Failed to fetch repository info")
      }
      const repoData = await repoResponse.json()
      const defaultBranch = repoData.default_branch || "main"

      // 使用Git Trees API获取所有文件，递归获取mao文件夹
      const treeResponse = await fetch(
        `https://api.github.com/repos/1143520/doro/git/trees/${defaultBranch}?recursive=1`,
      )

      if (!treeResponse.ok) {
        throw new Error("Failed to fetch repository tree")
      }

      const treeData: GitHubTree = await treeResponse.json()

      // 过滤出mao文件夹中的图片文件
      const gifFiles = treeData.tree.filter(
        (item) =>
          item.type === "blob" && // 确保是文件而不是文件夹
          item.path.startsWith("loop/") && // 在mao文件夹中
          /\.(gif|jpg|jpeg|png|webp|avif|svg)$/i.test(item.path.toLowerCase()) // 支持多种图片格式
      )

      console.log(`找到 ${gifFiles.length} 个图片文件`)

      // 转换为我们需要的格式
      const gifItems: GifItem[] = gifFiles.map((file) => {
        const fileName = file.path.split("/").pop() || file.path
        const fileType = fileName.split('.').pop()?.toLowerCase() || 'unknown'
        return {
          name: fileName,
          url: `https://raw.githubusercontent.com/1143520/doro/${defaultBranch}/${file.path}`,
          cdnUrl: `https://hub.gitmirror.com/raw.githubusercontent.com/1143520/doro/${defaultBranch}/${file.path}`,
          size: file.size || 0,
          type: fileType
        }
      })

      // 按文件名排序
      gifItems.sort((a, b) => a.name.localeCompare(b.name))

      setGifs(gifItems)
      setFilteredGifs(gifItems) // 初始化过滤后的列表
    } catch (err) {
      console.error("获取GIF文件失败:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // 修改copyToClipboard函数，添加格式参数
  const copyToClipboard = async (text: string, format: "url" | "markdown" = "url", id?: string) => {
    try {
      let copyText = text
      if (format === "markdown") {
        // 从URL中提取文件名作为alt文本
        const fileName = text.split("/").pop() || "gif"
        copyText = `![${fileName}](${text})`
      }

      await navigator.clipboard.writeText(copyText)

      // 显示复制成功状态
      if (id) {
        setCopySuccess({ ...copySuccess, [id]: true })
        setTimeout(() => {
          setCopySuccess({ ...copySuccess, [id]: false })
        }, 2000)
      }

      toast({
        title: "已复制到剪贴板",
        description: format === "markdown" ? "Markdown格式的图片链接已复制" : "图片链接已复制",
      })
    } catch (err) {
      toast({
        title: "复制失败",
        description: "无法复制链接到剪贴板",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "未知大小"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // 处理主题切换
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
    toast({
      title: `已切换到${theme === "dark" ? "浅色" : "深色"}模式`,
      description: `主题已更新为${theme === "dark" ? "浅色" : "深色"}模式`,
    })
  }

  // 修改下载功能，使用 fetch + blob 方式
  const handleDownload = async (gif: GifItem) => {
    const gifId = gif.name

    // 防止重复下载
    if (downloadingGifs.has(gifId)) {
      toast({
        title: "下载中",
        description: "该文件正在下载中，请稍候...",
      })
      return
    }

    try {
      // 添加到下载中列表
      setDownloadingGifs((prev) => new Set([...prev, gifId]))

      toast({
        title: "开始下载",
        description: `正在获取 ${gif.name}...`,
      })

      // 使用 fetch 获取图片数据
      const response = await fetch(gif.cdnUrl, {
        mode: "cors",
      })

      if (!response.ok) {
        throw new Error(`下载失败: ${response.status}`)
      }

      // 获取 blob 数据
      const blob = await response.blob()

      // 创建 blob URL
      const blobUrl = URL.createObjectURL(blob)

      // 创建下载链接
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = gif.name
      a.style.display = "none"

      // 添加到 DOM，点击，然后移除
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      // 清理 blob URL
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl)
      }, 1000)

      toast({
        title: "下载成功",
        description: `${gif.name} 已保存到下载文件夹`,
      })
    } catch (err) {
      console.error("下载失败:", err)
      toast({
        title: "下载失败",
        description: err instanceof Error ? err.message : "下载过程中出现错误",
        variant: "destructive",
      })
    } finally {
      // 从下载中列表移除
      setDownloadingGifs((prev) => {
        const newSet = new Set(prev)
        newSet.delete(gifId)
        return newSet
      })
    }
  }

  // 处理在新窗口打开
  const handleOpenInNewWindow = (url: string) => {
    window.open(url, "_blank")

    toast({
      title: "已在新窗口打开",
      description: "图片已在新标签页中打开",
    })
  }

  // 优化的页面切换函数
  const changePage = useCallback(
    (newPage: number) => {
      if (newPage === currentPage) return

      setPageLoading(true)
      // 使用setTimeout来模拟异步操作，让状态变化有时间反映到UI上
      setTimeout(() => {
        setCurrentPage(newPage)
        // 滚动到页面顶部
        window.scrollTo({ top: 0, behavior: "smooth" })
        setPageLoading(false)
      }, 100)
    },
    [currentPage],
  )

  // 预加载下一页图片
  useEffect(() => {
    const totalPages = Math.ceil(filteredGifs.length / itemsPerPage)
    if (currentPage < totalPages) {
      const nextPageStart = currentPage * itemsPerPage
      const nextPageEnd = Math.min(nextPageStart + itemsPerPage, filteredGifs.length)
      const nextPageGifs = filteredGifs.slice(nextPageStart, nextPageEnd)

      // 预加载下一页的图片
      nextPageGifs.forEach((gif) => {
        const img = new Image()
        img.src = gif.cdnUrl
      })
    }
  }, [currentPage, filteredGifs, itemsPerPage])

  // 导航到上一个/下一个图片
  const navigateGif = (direction: "prev" | "next") => {
    const currentIndex = selectedGifIndex
    let newIndex = currentIndex

    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredGifs.length - 1
    } else {
      newIndex = currentIndex < filteredGifs.length - 1 ? currentIndex + 1 : 0
    }

    setSelectedGifIndex(newIndex)
    setSelectedGif(filteredGifs[newIndex])
  }

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedGif) return

      if (e.key === "ArrowLeft") {
        e.preventDefault()
        navigateGif("prev")
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        navigateGif("next")
      } else if (e.key === "Escape") {
        setSelectedGif(null)
        setSelectedGifIndex(-1)
      }
    }

    if (selectedGif) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedGif, selectedGifIndex, filteredGifs])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-pink-600 dark:text-pink-400" />
          <p className="text-lg text-gray-600 dark:text-gray-300">正在加载doro的小窝...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">正在获取所有GIF文件，请稍候...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 dark:text-red-400 mb-4">加载失败: {error}</p>
          <Button onClick={fetchGifs} variant="outline">
            重试
          </Button>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(filteredGifs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentGifs = filteredGifs.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* 头部区域 */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img
                src="https://img.meituan.net/video/1f498ca05808be0e7a8a837d4e51e995233496.png"
                alt="doro"
                className="w-12 h-12 rounded-full object-cover border-2 border-pink-200 dark:border-pink-700 shadow-lg"
              />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                <a 
                  href="https://badwind824.top" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="no-underline"
                >
                  doro の 小窝
                </a>
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 flex items-center justify-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              <a 
                href="https://badwind824.top" 
                target="_blank" 
                rel="noopener noreferrer"
                className="no-underline"
              >
                doro表情收藏库
              </a>
              <Heart className="h-4 w-4 text-pink-500" />
            </p>
            <Badge
              variant="secondary"
              className="text-sm bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
            >
              共收藏 {gifs.length} 个图片
            </Badge>
          </div>

          {/* 主题切换按钮 */}
          {mounted && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="ml-4 bg-white/80 dark:bg-gray-800/80 border-pink-200 dark:border-pink-700 backdrop-blur-sm"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">切换主题</span>
            </Button>
          )}
        </div>

        {/* 搜索区域 */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-300 z-10" />
                <Input
                  type="text"
                  placeholder="搜索图片文件名..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      toast({
                        title: "搜索中",
                        description: searchTerm ? `正在搜索 "${searchTerm}"` : "显示所有结果",
                      })
                    }
                  }}
                  className="pl-12 pr-10 bg-white/90 dark:bg-gray-800/90 border-pink-200 dark:border-pink-700 backdrop-blur-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-1"
                    onClick={() => {
                      setSearchTerm("")
                      toast({
                        title: "已清除搜索",
                        description: "搜索条件已重置",
                      })
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* 搜索按钮 */}
              <Button
                onClick={() => {
                  toast({
                    title: "搜索中",
                    description: searchTerm ? `正在搜索 "${searchTerm}"` : "显示所有结果",
                  })
                }}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-4"
              >
                <Search className="h-5 w-5 mr-2" />
                搜索
              </Button>
            </div>
          </div>
        </div>

        {filteredGifs.length === 0 ? (
          <div className="text-center py-12 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow backdrop-blur-sm">
            {searchTerm ? (
              <div>
                <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">没有找到匹配"{searchTerm}"的图片</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("")
                    toast({
                      title: "已清除搜索",
                      description: "搜索条件已重置",
                    })
                  }}
                >
                  清除搜索
                </Button>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-lg">小窝里还没有图片呢~</p>
            )}
          </div>
        ) : (
          <>
            {/* 分页信息 */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {searchTerm ? (
                  <span>
                    搜索 "{searchTerm}" 找到 {filteredGifs.length} 个结果，显示 {startIndex + 1}-
                    {Math.min(endIndex, filteredGifs.length)} 项
                  </span>
                ) : (
                  <span>
                    显示 {startIndex + 1}-{Math.min(endIndex, filteredGifs.length)} 项，共 {filteredGifs.length} 项
                  </span>
                )}
                {totalPages > 1 && (
                  <span>
                    {" "}
                    (第 {currentPage} 页，共 {totalPages} 页)
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                当前布局: {columnsCount} 列 × 8 行 = {itemsPerPage} 项/页
              </div>
            </div>

            {/* 页面加载指示器 */}
            {pageLoading && (
              <div className="fixed top-0 left-0 w-full h-1 bg-pink-100 dark:bg-pink-900 z-50">
                <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 animate-[loader_1s_ease-in-out_infinite]"></div>
              </div>
            )}

            <div
              className={`grid gap-6 transition-opacity duration-300 ${pageLoading ? "opacity-50" : "opacity-100"}`}
              style={{
                gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))`,
              }}
            >
              {currentGifs.map((gif, index) => {
                const copyUrlId = `copy-url-${index}`
                const copyMdId = `copy-md-${index}`
                const isDownloading = downloadingGifs.has(gif.name)

                return (
                  <Card
                    key={index}
                    className="group hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white/90 dark:bg-gray-800/90 border-pink-200 dark:border-pink-700 backdrop-blur-sm hover:scale-105"
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={gif.cdnUrl || "/placeholder.svg"}
                          alt={gif.name}
                          className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-110"
                          onClick={() => {
                            setSelectedGif(gif)
                            setSelectedGifIndex(startIndex + index)
                          }}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 backdrop-blur-sm"
                            onClick={() => {
                              setSelectedGif(gif)
                              setSelectedGifIndex(startIndex + index)
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            查看
                          </Button>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3
                          className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-2 truncate"
                          title={gif.name}
                        >
                          {gif.name}
                        </h3>

                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <span>{formatFileSize(gif.size)}</span>
                          <Badge variant="outline" className="uppercase">
                            {gif.type}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          {/* 修改URL输入框和复制按钮的布局 */}
                          <div className="flex items-center gap-1">
                            <div className="relative flex-1 min-w-0">
                              <input
                                type="text"
                                value={gif.cdnUrl}
                                readOnly
                                className="w-full text-xs bg-pink-50 dark:bg-gray-700 border border-pink-200 dark:border-pink-600 rounded px-2 py-1 text-gray-600 dark:text-gray-300 pr-7"
                                onFocus={(e) => e.target.blur()}
                                onMouseDown={(e) => e.preventDefault()}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(gif.cdnUrl, "url", copyUrlId)}
                                className="absolute right-0 top-0 h-full w-7 p-0 flex items-center justify-center hover:bg-pink-100 dark:hover:bg-pink-900"
                                title="复制链接"
                              >
                                {copySuccess[copyUrlId] ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* 两按钮布局 */}
                          <div className="grid grid-cols-2 gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-1 border-pink-200 dark:border-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900 relative"
                              onClick={() => copyToClipboard(gif.cdnUrl, "markdown", copyMdId)}
                              title="复制Markdown格式"
                            >
                              <span className="sr-only">复制Markdown</span>
                              <span className="flex items-center">
                                {copySuccess[copyMdId] ? (
                                  <Check className="h-3 w-3 text-green-500 mr-1" />
                                ) : (
                                  <Copy className="h-3 w-3 mr-1" />
                                )}
                                MD
                              </span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-1 border-pink-200 dark:border-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900"
                              onClick={() => handleOpenInNewWindow(gif.cdnUrl)}
                              title="在新窗口打开"
                            >
                              <span className="sr-only">在新窗口打开</span>
                              <span className="flex items-center">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                打开
                              </span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(1)}
                  disabled={currentPage === 1 || pageLoading}
                  className="border-pink-200 dark:border-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900"
                >
                  首页
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || pageLoading}
                  className="border-pink-200 dark:border-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900"
                >
                  {pageLoading && currentPage > 1 ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : "上一页"}
                </Button>

                {/* 页码显示 */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => changePage(pageNum)}
                        disabled={pageLoading}
                        className={`w-8 h-8 p-0 ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                            : "border-pink-200 dark:border-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || pageLoading}
                  className="border-pink-200 dark:border-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900"
                >
                  {pageLoading && currentPage < totalPages ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    "下一页"
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(totalPages)}
                  disabled={currentPage === totalPages || pageLoading}
                  className="border-pink-200 dark:border-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900"
                >
                  末页
                </Button>
              </div>
            )}
          </>
        )}

        {/* 放大查看对话框 */}
        <Dialog
          open={!!selectedGif}
          onOpenChange={() => {
            setSelectedGif(null)
            setSelectedGifIndex(-1)
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto hide-scrollbar bg-white/95 dark:bg-gray-800/95 border-pink-200 dark:border-pink-700 backdrop-blur-sm">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-medium text-gray-800 dark:text-gray-200 flex-1">
                  {selectedGif?.name}
                </DialogTitle>
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {selectedGifIndex + 1} / {filteredGifs.length}
                  </span>
                </div>
              </div>
            </DialogHeader>

            {selectedGif && (
              <div className="space-y-4">
                <div className="relative flex justify-center items-center group">
                  {/* 左侧导航按钮 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateGif("prev")}
                    className="absolute left-4 z-10 h-12 w-12 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
                    title="上一个 (←)"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>

                  {/* 图片 */}
                  <img
                    src={selectedGif.cdnUrl || "/placeholder.svg"}
                    alt={selectedGif.name}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                  />

                  {/* 右侧导航按钮 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateGif("next")}
                    className="absolute right-4 z-10 h-12 w-12 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
                    title="下一个 (→)"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-gray-700 dark:text-gray-300">文件名:</label>
                    <p className="text-gray-600 dark:text-gray-400 break-all">{selectedGif.name}</p>
                  </div>

                  <div>
                    <label className="font-medium text-gray-700 dark:text-gray-300">文件大小:</label>
                    <p className="text-gray-600 dark:text-gray-400">{formatFileSize(selectedGif.size)}</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-medium text-gray-700 dark:text-gray-300">CDN链接:</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={selectedGif.cdnUrl}
                        readOnly
                        className="flex-1 text-sm bg-pink-50 dark:bg-gray-700 border border-pink-200 dark:border-pink-600 rounded px-3 py-2 text-gray-600 dark:text-gray-300"
                        onFocus={(e) => e.target.blur()}
                        onMouseDown={(e) => e.preventDefault()}
                      />
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(selectedGif.cdnUrl)}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        复制链接
                      </Button>
                    </div>

                    <div className="mt-2">
                      <label className="font-medium text-gray-700 dark:text-gray-300">Markdown格式:</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={`![${selectedGif.name}](${selectedGif.cdnUrl})`}
                          readOnly
                          className="flex-1 text-sm bg-pink-50 dark:bg-gray-700 border border-pink-200 dark:border-pink-600 rounded px-3 py-2 text-gray-600 dark:text-gray-300 font-mono"
                          onFocus={(e) => e.target.blur()}
                          onMouseDown={(e) => e.preventDefault()}
                        />
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(selectedGif.cdnUrl, "markdown")}
                          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          复制MD
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-4">
                  <Button
                    onClick={() => handleOpenInNewWindow(selectedGif.cdnUrl)}
                    variant="outline"
                    className="border-pink-200 dark:border-pink-600"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    在新窗口打开
                  </Button>

                  <Button
                    onClick={() => handleDownload(selectedGif)}
                    disabled={downloadingGifs.has(selectedGif.name)}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50"
                  >
                    {downloadingGifs.has(selectedGif.name) ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {downloadingGifs.has(selectedGif.name) ? "下载中..." : "下载图片"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 页脚 */}
        <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-pink-500" />
            <span>Made with love by doro</span>
            <Heart className="h-4 w-4 text-pink-500" />
          </div>
          <p>欢迎来到我的小窝，这里收藏着我喜欢的表情~</p>
          <p className="mt-2">
            <a
              href="https://badwind824.top"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:underline flex items-center justify-center gap-1"
            >
              <Github className="h-3 w-3" />
              一只南风
            </a>
          </p>
        </footer>

        {/* Toast通知组件 */}
        <Toaster />
      </div>
    </div>
  )
}
